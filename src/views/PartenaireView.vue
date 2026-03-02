<template>
  <div class="page-wrapper">
    <h1>Partenaires</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un partenaire..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredPartenaires.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('designationPartenaire')" class="sortable">
              Désignation
              <span v-if="sortColumn === 'designationPartenaire'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('description')" class="sortable">
              Description
              <span v-if="sortColumn === 'description'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('adresse')" class="sortable">
              Adresse
              <span v-if="sortColumn === 'adresse'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('telephone')" class="sortable">
              Téléphone
              <span v-if="sortColumn === 'telephone'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('email')" class="sortable">
              Email
              <span v-if="sortColumn === 'email'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Secteur d'activité</th>
            <th>Fichier</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="partenaire in paginatedPartenaires" :key="partenaire.idPartenaire">
            <td>{{ partenaire.designationPartenaire }}</td>
            <td>{{ partenaire.description || '—' }}</td>
            <td>{{ partenaire.adresse || '—' }}</td>
            <td>{{ partenaire.telephone || '—' }}</td>
            <td>{{ partenaire.email || '—' }}</td>
            <td>{{ getSecteursNames(partenaire.secteurs_activite) }}</td>
            <td>
              <div v-if="partenaire.nomFichier" class="document-actions">
                <span>{{ partenaire.nomFichier }}</span>
                <button @click="viewFile(partenaire.idPartenaire)" class="file-btn" :disabled="loadingConsulter" title="Consulter">
                  <span v-if="loadingConsulter && loadingDocumentId === partenaire.idPartenaire">...</span>
                  <span v-else>👁️</span>
                </button>
              </div>
              <span v-else class="no-file">—</span>
            </td>
            <td>
              <button class="update-button" @click="confirmUpdate(partenaire)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button v-if="userStore.canAccessBibliothequePages.value" class="upload-button" @click="showUploadModal(partenaire)" title="Télécharger fichier">📁</button>
              <button class="delete-button" @click="confirmDelete(partenaire)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        <h2>Ajouter un Partenaire</h2>
        <div class="form-group">
          <label>Désignation *</label>
          <input 
            v-model="newPartenaire.designationPartenaire" 
            placeholder="Désignation" 
            :class="{ 'error': validationErrors.designationPartenaire }"
          />
          <div v-if="validationErrors.designationPartenaire" class="error-message">{{ validationErrors.designationPartenaire }}</div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newPartenaire.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="form-group">
          <label>Adresse</label>
          <input v-model="newPartenaire.adresse" placeholder="Adresse" />
        </div>
        <div class="form-group">
          <label>Téléphone</label>
          <input v-model="newPartenaire.telephone" placeholder="Téléphone" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="newPartenaire.email" placeholder="Email" />
        </div>
        <div class="form-group">
          <label>Secteurs d'activité (optionnel)</label>
          <div class="multi-select-container">
            <div class="selected-items">
              <span v-for="secteurId in newPartenaire.secteurs_activite" :key="secteurId" class="selected-item">
                {{ getSecteurName(secteurId) }}
                <button type="button" @click="removeSecteur(secteurId)" class="remove-item">×</button>
              </span>
            </div>
            <select @change="addSecteur($event)" class="secteur-select">
              <option value="">-- Ajouter un secteur --</option>
              <option v-for="secteur in availableSecteurs" :key="secteur.id" :value="secteur.id">
                {{ secteur.secteur }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddPartenaire">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="partenaireToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ partenaireToDelete.designationPartenaire }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deletePartenaire">Oui, supprimer</button>
          <button @click="partenaireToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="partenaireToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Partenaire</h2>
        <div class="form-group">
          <label>Désignation</label>
          <input v-model="partenaireToUpdate.designationPartenaire" placeholder="Désignation" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="partenaireToUpdate.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="form-group">
          <label>Adresse</label>
          <input v-model="partenaireToUpdate.adresse" placeholder="Adresse" />
        </div>
        <div class="form-group">
          <label>Téléphone</label>
          <input v-model="partenaireToUpdate.telephone" placeholder="Téléphone" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="partenaireToUpdate.email" placeholder="Email" />
        </div>
        <div class="form-group">
          <label>Secteurs d'activité</label>
          <div class="multi-select-container">
            <div class="selected-items">
              <span v-for="secteurId in partenaireToUpdate.secteurs_activite" :key="secteurId" class="selected-item">
                {{ getSecteurName(secteurId) }}
                <button type="button" @click="removeUpdateSecteur(secteurId)" class="remove-item">×</button>
              </span>
            </div>
            <select @change="addUpdateSecteur($event)" class="secteur-select">
              <option value="">-- Ajouter un secteur --</option>
              <option v-for="secteur in availableUpdateSecteurs" :key="secteur.id" :value="secteur.id">
                {{ secteur.secteur }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="updatePartenaire">Modifier</button>
          <button @click="partenaireToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPLOAD FILE MODAL -->
    <div v-if="partenaireToUpload" class="modal-overlay">
      <div class="modal">
        <h2>Télécharger fichier pour {{ partenaireToUpload.designationPartenaire }}</h2>
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
          <button @click="partenaireToUpload = null" class="cancel">Annuler</button>
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
            :documentId="selectedDocument.idPartenaire"
          />
          
          <!-- Image Viewer -->
          <ImageViewer
            v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'image'"
            :imageUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idPartenaire"
          />
          
          <!-- Video Viewer -->
          <VideoViewer
            v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'video'"
            :videoUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idPartenaire"
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

interface Secteur {
  id: number
  secteur: string
}

interface Partenaire {
  idPartenaire: number
  designationPartenaire: string
  description: string
  adresse: string
  telephone: string
  email: string
  secteurs_activite: number[] | null
  nomFichier: string | null
  date_suppression: string | null
  fichier?: string
  detectedType?: string
}

const partenaires = ref<Partenaire[]>([])
const secteurs = ref<Secteur[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'designationPartenaire' | 'description' | 'adresse' | 'telephone' | 'email'>('designationPartenaire')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newPartenaire = ref({ 
  designationPartenaire: '', 
  description: '', 
  adresse: '', 
  telephone: '', 
  email: '', 
  secteurs_activite: [] as number[] 
})
const partenaireToDelete = ref<Partenaire | null>(null)
const partenaireToUpdate = ref<Partenaire | null>(null)
const partenaireToUpload = ref<Partenaire | null>(null)
const uploadFileSelected = ref<File | null>(null)
const selectedDocument = ref<Partenaire | null>(null)
const loadingConsulter = ref(false)
const loadingDocumentId = ref<number | null>(null)

// Validation errors
const validationErrors = ref({
  designationPartenaire: ''
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

const filteredPartenaires = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = partenaires.value.filter((partenaire) =>
    partenaire.designationPartenaire.toLowerCase().includes(s) ||
    (partenaire.description?.toLowerCase().includes(s) ?? false) ||
    (partenaire.adresse?.toLowerCase().includes(s) ?? false) ||
    (partenaire.telephone?.toLowerCase().includes(s) ?? false) ||
    (partenaire.email?.toLowerCase().includes(s) ?? false)
  )

  return filtered.sort((a, b) => {
    const nameA = a.designationPartenaire.toLowerCase()
    const nameB = b.designationPartenaire.toLowerCase()
    
    if (sortColumn.value === 'designationPartenaire') {
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

const paginatedPartenaires = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPartenaires.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredPartenaires.value.length / pageSize))

async function fetchPartenaires() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('partenaires/')
    partenaires.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function fetchSecteurs() {
  try {
    const response = await axiosInstance.get('secteurs/')
    secteurs.value = response.data
  } catch (e: any) {
    console.error('Erreur lors du chargement des secteurs:', e)
  }
}

function getSecteurName(secteurId: number | null): string {
  if (!secteurId) return '—'
  const secteur = secteurs.value.find(s => s.id === secteurId)
  return secteur ? secteur.secteur : '—'
}

function getSecteursNames(secteurIds: number[] | null): string {
  if (!secteurIds || secteurIds.length === 0) return '—'
  const names = secteurIds.map(id => getSecteurName(id)).filter(name => name !== '—')
  return names.length > 0 ? names.join(', ') : '—'
}

const availableSecteurs = computed(() => {
  return secteurs.value.filter(secteur => !newPartenaire.value.secteurs_activite.includes(secteur.id))
})

const availableUpdateSecteurs = computed(() => {
  if (!partenaireToUpdate.value || !partenaireToUpdate.value.secteurs_activite) return secteurs.value
  return secteurs.value.filter(secteur => !partenaireToUpdate.value!.secteurs_activite!.includes(secteur.id))
})

function addSecteur(event: Event) {
  const target = event.target as HTMLSelectElement
  const secteurId = parseInt(target.value)
  if (secteurId && !newPartenaire.value.secteurs_activite.includes(secteurId)) {
    newPartenaire.value.secteurs_activite.push(secteurId)
  }
  target.value = ''
}

function removeSecteur(secteurId: number) {
  const index = newPartenaire.value.secteurs_activite.indexOf(secteurId)
  if (index > -1) {
    newPartenaire.value.secteurs_activite.splice(index, 1)
  }
}

function addUpdateSecteur(event: Event) {
  const target = event.target as HTMLSelectElement
  const secteurId = parseInt(target.value)
  if (secteurId && partenaireToUpdate.value && partenaireToUpdate.value.secteurs_activite && !partenaireToUpdate.value.secteurs_activite.includes(secteurId)) {
    partenaireToUpdate.value.secteurs_activite.push(secteurId)
  }
  target.value = ''
}

function removeUpdateSecteur(secteurId: number) {
  if (!partenaireToUpdate.value || !partenaireToUpdate.value.secteurs_activite) return
  const index = partenaireToUpdate.value.secteurs_activite.indexOf(secteurId)
  if (index > -1) {
    partenaireToUpdate.value.secteurs_activite.splice(index, 1)
  }
}

function handleUploadFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  uploadFileSelected.value = target.files?.[0] || null
}

function showUploadModal(partenaire: Partenaire) {
  partenaireToUpload.value = partenaire
  uploadFileSelected.value = null
}

async function addPartenaire() {
  try {
    const formData = new FormData()
    formData.append('designationPartenaire', newPartenaire.value.designationPartenaire)
    formData.append('description', newPartenaire.value.description || '')
    formData.append('adresse', newPartenaire.value.adresse || '')
    formData.append('telephone', newPartenaire.value.telephone || '')
    formData.append('email', newPartenaire.value.email || '')
    if (newPartenaire.value.secteurs_activite.length > 0) {
      newPartenaire.value.secteurs_activite.forEach(secteurId => {
        formData.append('secteurs_activite', secteurId.toString())
      })
    }

    const res = await axiosInstance.post('partenaires/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    partenaires.value.push(res.data)
    showAddPopup.value = false
    newPartenaire.value = { 
      designationPartenaire: '', 
      description: '', 
      adresse: '', 
      telephone: '', 
      email: '', 
      secteurs_activite: [] 
    }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(partenaire: Partenaire) {
  partenaireToDelete.value = partenaire
}

function confirmUpdate(partenaire: Partenaire) {
  partenaireToUpdate.value = { 
    ...partenaire, 
    secteurs_activite: Array.isArray(partenaire.secteurs_activite) ? [...partenaire.secteurs_activite] : [] 
  }
}

async function updatePartenaire() {
  if (!partenaireToUpdate.value) return
  try {
    const formData = new FormData()
    formData.append('designationPartenaire', partenaireToUpdate.value.designationPartenaire)
    formData.append('description', partenaireToUpdate.value.description || '')
    formData.append('adresse', partenaireToUpdate.value.adresse || '')
    formData.append('telephone', partenaireToUpdate.value.telephone || '')
    formData.append('email', partenaireToUpdate.value.email || '')
    if (partenaireToUpdate.value.secteurs_activite && partenaireToUpdate.value.secteurs_activite.length > 0) {
      partenaireToUpdate.value.secteurs_activite.forEach(secteurId => {
        formData.append('secteurs_activite', secteurId.toString())
      })
    }

    await axiosInstance.put(`partenaires/${partenaireToUpdate.value.idPartenaire}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const index = partenaires.value.findIndex(p => p.idPartenaire === partenaireToUpdate.value!.idPartenaire)
    if (index !== -1) {
      partenaires.value[index] = { ...partenaireToUpdate.value }
    }
    partenaireToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deletePartenaire() {
  if (!partenaireToDelete.value) return
  try {
    await axiosInstance.delete(`partenaires/${partenaireToDelete.value.idPartenaire}/`)
    partenaires.value = partenaires.value.filter(p => p.idPartenaire !== partenaireToDelete.value!.idPartenaire)
    partenaireToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function validateRequiredFields() {
  const errors = {
    designationPartenaire: ''
  }
  
  let isValid = true
  
  if (!newPartenaire.value.designationPartenaire.trim()) {
    errors.designationPartenaire = 'La désignation est requise'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

function validateAndAddPartenaire() {
  if (validateRequiredFields()) {
    addPartenaire()
  }
}

async function uploadFile() {
  if (!partenaireToUpload.value || !uploadFileSelected.value) return
  try {
    const formData = new FormData()
    formData.append('fichier', uploadFileSelected.value)

    await axiosInstance.post(`partenaires/${partenaireToUpload.value.idPartenaire}/upload-file/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    await fetchPartenaires()
    partenaireToUpload.value = null
    uploadFileSelected.value = null
  } catch (e: any) {
    alert('Erreur lors du téléchargement : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function viewFile(id: number) {
  const document = partenaires.value.find(p => p.idPartenaire === id)
  if (!document) return
  
  loadingConsulter.value = true
  loadingDocumentId.value = id
  
  try {
    const response = await axiosInstance.get(`partenaires/${id}/view-file/`, {
      responseType: 'blob'
    })
    
    if (response.status === 200) {
      const blob = response.data
      const fileUrl = URL.createObjectURL(blob)
      
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

function exportCSV() {
  const headers = ['ID', 'Désignation', 'Description', 'Adresse', 'Téléphone', 'Email', 'Secteur d\'activité', 'Fichier']
  const rows = filteredPartenaires.value.map(partenaire => [
    partenaire.idPartenaire,
    partenaire.designationPartenaire,
    partenaire.description || '',
    partenaire.adresse || '',
    partenaire.telephone || '',
    partenaire.email || '',
    getSecteursNames(partenaire.secteurs_activite),
    partenaire.nomFichier || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'partenaires.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  await fetchSecteurs()
  fetchPartenaires()
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
.modal textarea,
.modal select {
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

/* Multi-select styles */
.multi-select-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  background: white;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
  min-height: 32px;
}

.selected-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2244aa;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.remove-item {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  margin-left: 4px;
}

.remove-item:hover {
  color: #ff495c;
}

.secteur-select {
  width: 100%;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}
</style>