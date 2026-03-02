<template>
  <div class="page-wrapper">
    <h1>PAQs</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un PAQ..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredPAQs.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('designationPAQ')" class="sortable">
              Désignation
              <span v-if="sortColumn === 'designationPAQ'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('description')" class="sortable">
              Description
              <span v-if="sortColumn === 'description'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('nomFichier')" class="sortable">
              Fichier
              <span v-if="sortColumn === 'nomFichier'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="paq in paginatedPAQs" :key="paq.idPAQ">
            <td>{{ paq.designationPAQ }}</td>
            <td>{{ paq.description || '—' }}</td>
            <td>
              <div v-if="paq.nomFichier" class="document-actions">
                <span>{{ paq.nomFichier }}</span>
                <button @click="viewFile(paq.idPAQ)" class="file-btn" :disabled="loadingConsulter" title="Consulter">
                  <span v-if="loadingConsulter && loadingDocumentId === paq.idPAQ">...</span>
                  <span v-else>👁️</span>
                </button>
              </div>
              <span v-else class="no-file">—</span>
            </td>
            <td>
              <button class="update-button" @click="confirmUpdate(paq)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button v-if="userStore.canAccessBibliothequePages.value" class="upload-button" @click="showUploadModal(paq)" title="Télécharger fichier">📁</button>
              <button class="delete-button" @click="confirmDelete(paq)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-result">Aucun résultat trouvé.</div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1">Précédent</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">Suivant</button>
    </div>

    <!-- ADD POPUP -->
    <div v-if="showAddPopup" class="modal-overlay">
      <div class="modal">
        <h2>Ajouter un PAQ</h2>
        <div class="form-group">
          <label>Désignation *</label>
          <input 
            v-model="newPAQ.designationPAQ" 
            placeholder="Désignation" 
            :class="{ 'error': validationErrors.designationPAQ }"
          />
          <div v-if="validationErrors.designationPAQ" class="error-message">{{ validationErrors.designationPAQ }}</div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newPAQ.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddPAQ">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="paqToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ paqToDelete.designationPAQ }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deletePAQ">Oui, supprimer</button>
          <button @click="paqToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="paqToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier PAQ</h2>
        <input v-model="paqToUpdate.designationPAQ" placeholder="Désignation" />
        <textarea v-model="paqToUpdate.description" placeholder="Description (optionnelle)" />
        <div class="modal-actions">
          <button @click="updatePAQ">Modifier</button>
          <button @click="paqToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPLOAD FILE MODAL -->
    <div v-if="paqToUpload" class="modal-overlay">
      <div class="modal">
        <h2>Télécharger fichier pour {{ paqToUpload.designationPAQ }}</h2>
        <div class="form-group">
          <label>Fichier</label>
          <input 
            type="file" 
            @change="handleUploadFileSelect"
            accept=".pdf,.doc,.docx,.txt"
          />
        </div>
        <div class="modal-actions">
          <button @click="uploadFile" :disabled="!uploadFileSelected">Télécharger</button>
          <button @click="paqToUpload = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- FILE VIEWER MODAL -->
    <div v-if="selectedDocument && selectedDocument.fichier" class="modal-overlay">
      <div class="modal pdf-modal">
        <h2>Consulter Document</h2>
        
        <div class="file-viewer-container">
          <!-- PDF Viewer -->
          <PdfViewer
            v-if="selectedDocument.fichier && getFileType(selectedDocument) === 'pdf'"
            :pdfUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idPAQ"
          />
          
          <!-- Image Viewer -->
          <ImageViewer
            v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'image'"
            :imageUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idPAQ"
          />
          
          <!-- Video Viewer -->
          <VideoViewer
            v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'video'"
            :videoUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idPAQ"
          />
        </div>
        
        <div class="modal-actions">
          <button @click="closeDocumentViewer" class="cancel">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'
import PdfViewer from '../components/PdfViewer.vue'
import ImageViewer from '../components/ImageViewer.vue'
import VideoViewer from '../components/VideoViewer.vue'

interface PAQ {
  idPAQ: number
  designationPAQ: string
  description: string
  nomFichier: string
  date_suppression: string | null
  fichier?: string
  detectedType?: string
}

const paqs = ref<PAQ[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'designationPAQ' | 'description' | 'nomFichier'>('designationPAQ')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newPAQ = ref({ designationPAQ: '', description: '' })
const selectedFile = ref<File | null>(null)
const paqToDelete = ref<PAQ | null>(null)
const paqToUpdate = ref<PAQ | null>(null)
const paqToUpload = ref<PAQ | null>(null)
const uploadFileSelected = ref<File | null>(null)
const selectedDocument = ref<PAQ | null>(null)
const loadingConsulter = ref(false)
const loadingDocumentId = ref<number | null>(null)

// Validation errors
const validationErrors = ref({
  designationPAQ: ''
})

const userStore = useUserStore()

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredPAQs = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = paqs.value.filter((paq) =>
    paq.designationPAQ.toLowerCase().includes(s) ||
    (paq.description?.toLowerCase().includes(s) ?? false) ||
    (paq.nomFichier?.toLowerCase().includes(s) ?? false)
  )

  return filtered.sort((a, b) => {
    const nameA = a.designationPAQ.toLowerCase()
    const nameB = b.designationPAQ.toLowerCase()
    
    if (sortColumn.value === 'designationPAQ') {
      if (nameA < nameB) return sortAsc.value ? -1 : 1
      if (nameA > nameB) return sortAsc.value ? 1 : -1
      return 0
    } else {
      const fieldA = (a[sortColumn.value] || '').toString().toLowerCase()
      const fieldB = (b[sortColumn.value] || '').toString().toLowerCase()
      
      if (fieldA !== fieldB) {
        if (fieldA < fieldB) return sortAsc.value ? -1 : 1
        if (fieldA > fieldB) return sortAsc.value ? 1 : -1
      }
      
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    }
  })
})

const paginatedPAQs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPAQs.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredPAQs.value.length / pageSize))

async function fetchPAQs() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('paqs/')
    paqs.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}


function handleUploadFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  uploadFileSelected.value = target.files?.[0] || null
}

async function addPAQ() {
  try {
    const formData = new FormData()
    formData.append('designationPAQ', newPAQ.value.designationPAQ)
    formData.append('description', newPAQ.value.description)
    if (selectedFile.value) {
      formData.append('fichier', selectedFile.value)
    }

    const res = await axiosInstance.post('paqs/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    paqs.value.push(res.data)
    showAddPopup.value = false
    newPAQ.value = { designationPAQ: '', description: '' }
    selectedFile.value = null
  } catch (e: any) {
    alert('Erreur lors de l\'ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(paq: PAQ) {
  paqToDelete.value = paq
}

function confirmUpdate(paq: PAQ) {
  paqToUpdate.value = { ...paq }
}

function showUploadModal(paq: PAQ) {
  paqToUpload.value = paq
  uploadFileSelected.value = null
}

async function updatePAQ() {
  if (!paqToUpdate.value) return
  try {
    const formData = new FormData()
    formData.append('designationPAQ', paqToUpdate.value.designationPAQ)
    formData.append('description', paqToUpdate.value.description)

    await axiosInstance.put(`paqs/${paqToUpdate.value.idPAQ}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const index = paqs.value.findIndex(p => p.idPAQ === paqToUpdate.value!.idPAQ)
    if (index !== -1) {
      paqs.value[index] = { ...paqToUpdate.value }
    }
    paqToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deletePAQ() {
  if (!paqToDelete.value) return
  try {
    await axiosInstance.delete(`paqs/${paqToDelete.value.idPAQ}/`)
    paqs.value = paqs.value.filter(p => p.idPAQ !== paqToDelete.value!.idPAQ)
    paqToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function uploadFile() {
  if (!paqToUpload.value || !uploadFileSelected.value) return
  try {
    const formData = new FormData()
    formData.append('fichier', uploadFileSelected.value)

    await axiosInstance.post(`paqs/${paqToUpload.value.idPAQ}/upload-file/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // Refresh the PAQ list to get updated file info
    await fetchPAQs()
    paqToUpload.value = null
    uploadFileSelected.value = null
  } catch (e: any) {
    alert('Erreur lors du téléchargement : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function viewFile(paqId: number) {
  const document = paqs.value.find(p => p.idPAQ === paqId)
  if (!document) return
  
  loadingConsulter.value = true
  loadingDocumentId.value = paqId
  
  try {
    const response = await axiosInstance.get(`paqs/${paqId}/view-file/`, {
      responseType: 'blob'
    })
    
    if (response.status === 200) {
      const blob = response.data
      const fileUrl = URL.createObjectURL(blob)
      
      // Detect file type from blob content-type
      let detectedType = 'pdf'
      if (blob.type.startsWith('image/')) {
        detectedType = 'image'
      } else if (blob.type.startsWith('video/')) {
        detectedType = 'video'
      }
      
      selectedDocument.value = {
        ...document,
        fichier: fileUrl,
        detectedType: detectedType
      }
    }
  } catch (e: any) {
    alert('Erreur lors de l\'ouverture du fichier : ' + (e?.message || 'Erreur inconnue'))
  } finally {
    loadingConsulter.value = false
    loadingDocumentId.value = null
  }
}

function getFileType(document: any): string {
  if (document.detectedType) {
    return document.detectedType
  }
  return 'pdf'
}

function closeDocumentViewer() {
  if (selectedDocument.value?.fichier) {
    URL.revokeObjectURL(selectedDocument.value.fichier)
  }
  selectedDocument.value = null
}

function validateRequiredFields() {
  const errors = {
    designationPAQ: ''
  }
  
  let isValid = true
  
  if (!newPAQ.value.designationPAQ.trim()) {
    errors.designationPAQ = 'La désignation est requise'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

function validateAndAddPAQ() {
  if (validateRequiredFields()) {
    addPAQ()
  }
}

function exportCSV() {
  const headers = ['ID', 'Désignation', 'Description', 'Fichier']
  const rows = filteredPAQs.value.map(paq => [
    paq.idPAQ,
    paq.designationPAQ,
    paq.description || '',
    paq.nomFichier || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'paqs.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchPAQs()
})
</script>

<style scoped>
.page-wrapper {
  padding: 16px;
  margin-right: 20px;
}

h1 {
  font-size: 1.6rem;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.export-button {
  padding: 8px 16px;
  background: #2244aa;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.export-button:hover {
  background-color: #1a3a8a;
}
.export-button.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.table-wrapper {
  overflow-x: auto;
  padding-right: 1rem;
  margin-right: 1rem;
  background: white;
  border-radius: 0.5rem;
}

.product-table {
  min-width: 800px;
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.4rem;
  background: #192850;
  color: #fff;
  border-radius: 7px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(40, 55, 71, 0.12);
}

.table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.product-table th,
.product-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #232f4b;
  text-align: left;
  font-size: 1rem;
  max-width: 200px;
  word-wrap: break-word;
  white-space: normal;
  vertical-align: top;
}

.product-table th {
  background: #22336e;
  font-size: 1.05rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.product-table tr:last-child td {
  border-bottom: none;
}

.no-result {
  padding: 1rem;
  text-align: center;
  color: #999;
}

.info {
  color: #2196F3;
  font-weight: bold;
  margin: 16px 0;
}

.error {
  color: #ff495c;
  font-weight: bold;
  margin: 16px 0;
}

.pagination {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination button {
  padding: 6px 12px;
  background: #22336e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #888;
  cursor: not-allowed;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #2d3c6e;
}

.add-button {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-button:hover {
  background-color: #218838;
}
.add-button.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.delete-button {
  padding: 5px 10px;
  background: white;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.delete-button:hover {
  background: #dc3545;
  color: white;
}
.delete-button.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.update-button {
  padding: 5px 10px;
  background: #17a2b8;
  color: white;
  border: 1px solid #17a2b8;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-right: 5px;
}
.update-button:hover {
  background: #138496;
  border-color: #138496;
}
.update-button.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.upload-button {
  padding: 5px 10px;
  background: #ffc107;
  color: #212529;
  border: 1px solid #ffc107;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-right: 5px;
}
.upload-button:hover {
  background: #e0a800;
  border-color: #d39e00;
}

.view-file-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 5px;
  font-size: 1.1em;
}
.view-file-btn:hover {
  opacity: 0.7;
}

.document-actions {
  display: flex;
  gap: 0.5em;
  align-items: center;
}

.file-btn {
  padding: 6px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.file-btn:hover:not(:disabled) {
  background: #1976d2;
}

.file-btn:disabled {
  background: #888;
  cursor: not-allowed;
  opacity: 0.6;
}

.no-file {
  color: #888;
  font-style: italic;
}

/* PDF Modal Styles */
.pdf-modal {
  max-width: 95vw;
  max-height: 95vh;
  width: fit-content;
  height: fit-content;
}

.file-viewer-container {
  width: 100%;
  height: auto;
  max-height: calc(90vh - 120px);
  overflow: auto;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 10px 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
}

.modal input,
.modal textarea {
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-actions .cancel {
  background: #aaa;
}

.modal-actions button {
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.modal-actions button:first-child {
  background: #2244aa;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-group input.error,
.form-group textarea.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

.error-message {
  color: #e74c3c;
  font-size: 0.85em;
  margin-top: 0.3em;
  font-weight: 500;
}
</style>