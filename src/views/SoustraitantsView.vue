<template>
  <div class="page-wrapper">
    <h1>Sous-traitants</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un sous-traitant..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredSoustraitants.length > 0" class="product-table">
        <thead>
          <tr>
            <!-- <th @click="toggleSort('idSoustraitants')" class="sortable">
              ID
              <span v-if="sortColumn === 'idSoustraitants'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th> -->
            <th @click="toggleSort('designationStt')" class="sortable">
              Désignation
              <span v-if="sortColumn === 'designationStt'">{{ sortAsc ? '▲' : '▼' }}</span>
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
          <tr v-for="soustraitant in paginatedSoustraitants" :key="soustraitant.idSoustraitants">
            <!-- <td>{{ soustraitant.idSoustraitants }}</td> -->
            <td>{{ soustraitant.designationStt }}</td>
            <td>{{ soustraitant.description || '—' }}</td>
            <td>{{ soustraitant.adresse || '—' }}</td>
            <td>{{ soustraitant.telephone || '—' }}</td>
            <td>{{ soustraitant.email || '—' }}</td>
            <td>{{ getSecteursNames(soustraitant.secteurs_activite) }}</td>
            <td>
              <div v-if="soustraitant.nomFichier" class="document-actions">
                <span>{{ soustraitant.nomFichier }}</span>
                <button @click="viewFile(soustraitant.idSoustraitants)" class="file-btn" :disabled="loadingConsulter" title="Consulter">
                  <span v-if="loadingConsulter && loadingDocumentId === soustraitant.idSoustraitants">...</span>
                  <span v-else>👁️</span>
                </button>
              </div>
              <span v-else class="no-file">—</span>
            </td>
            <td>
              <button class="update-button" @click="confirmUpdate(soustraitant)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button v-if="userStore.canAccessBibliothequePages.value" class="upload-button" @click="showUploadModal(soustraitant)" title="Télécharger fichier">📁</button>
              <button class="delete-button" @click="confirmDelete(soustraitant)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        <h2>Ajouter un Sous-traitant</h2>
        <div class="form-group">
          <label>Désignation *</label>
          <input 
            v-model="newSoustraitant.designationStt" 
            placeholder="Désignation" 
            :class="{ 'error': validationErrors.designationStt }"
          />
          <div v-if="validationErrors.designationStt" class="error-message">{{ validationErrors.designationStt }}</div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newSoustraitant.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="form-group">
          <label>Adresse</label>
          <input 
            v-model="newSoustraitant.adresse" 
            placeholder="Adresse" 
          />
          <!-- <div v-if="validationErrors.adresse" class="error-message">{{ validationErrors.adresse }}</div> -->
        </div>
        <div class="form-group">
          <label>Téléphone</label>
          <input 
            v-model="newSoustraitant.telephone" 
            placeholder="Téléphone" 
          />
          <!-- <div v-if="validationErrors.telephone" class="error-message">{{ validationErrors.telephone }}</div> -->
        </div>
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="newSoustraitant.email" 
            placeholder="Email" 
          />
          <!-- <div v-if="validationErrors.email" class="error-message">{{ validationErrors.email }}</div> -->
        </div>
        <div class="form-group">
          <label>Secteurs d'activité (optionnel)</label>
          <div class="multi-select-container">
            <div class="selected-items">
              <span v-for="secteurId in newSoustraitant.secteurs_activite" :key="secteurId" class="selected-item">
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
        <!-- <div class="form-group">
          <label>Fichier</label>
          <input 
            type="file" 
            @change="handleFileSelect"
            accept=".pdf,.doc,.docx,.txt"
          />
        </div> -->
        <div class="modal-actions">
          <button @click="validateAndAddSoustraitant">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="soustraitantToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ soustraitantToDelete.designationStt }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteSoustraitant">Oui, supprimer</button>
          <button @click="soustraitantToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="soustraitantToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Sous-traitant</h2>
        <div class="form-group">
          <label>Désignation</label>
          <input v-model="soustraitantToUpdate.designationStt" placeholder="Désignation" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="soustraitantToUpdate.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="form-group">
          <label>Adresse</label>
          <input v-model="soustraitantToUpdate.adresse" placeholder="Adresse" />
        </div>
        <div class="form-group">
          <label>Téléphone</label>
          <input v-model="soustraitantToUpdate.telephone" placeholder="Téléphone" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="soustraitantToUpdate.email" placeholder="Email" />
        </div>
        <div class="form-group">
          <label>Secteurs d'activité</label>
          <div class="multi-select-container">
            <div class="selected-items">
              <span v-for="secteurId in soustraitantToUpdate.secteurs_activite" :key="secteurId" class="selected-item">
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
          <button @click="updateSoustraitant">Modifier</button>
          <button @click="soustraitantToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPLOAD FILE MODAL -->
    <div v-if="soustraitantToUpload" class="modal-overlay">
      <div class="modal">
        <h2>Télécharger fichier pour {{ soustraitantToUpload.designationStt }}</h2>
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
          <button @click="soustraitantToUpload = null" class="cancel">Annuler</button>
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
            :documentId="selectedDocument.idSoustraitants"
          />
          
          <!-- Image Viewer -->
          <ImageViewer
            v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'image'"
            :imageUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idSoustraitants"
          />
          
          <!-- Video Viewer -->
          <VideoViewer
            v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'video'"
            :videoUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idSoustraitants"
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

interface Soustraitant {
  idSoustraitants: number
  designationStt: string
  description: string
  adresse: string
  telephone: string
  email: string
  nomFichier: string | null
  date_suppression: string | null
  secteurs_activite: number[] | null
  fichier?: string
  detectedType?: string
}

interface Secteur {
  id: number
  secteur: string
}

const soustraitants = ref<Soustraitant[]>([])
const secteurs = ref<Secteur[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'designationStt' | 'description' | 'adresse' | 'telephone' | 'email'>('designationStt')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newSoustraitant = ref({ designationStt: '', description: '', adresse: '', telephone: '', email: '', secteurs_activite: [] as number[] })
const selectedFile = ref<File | null>(null)
const soustraitantToDelete = ref<Soustraitant | null>(null)
const soustraitantToUpdate = ref<Soustraitant | null>(null)
const soustraitantToUpload = ref<Soustraitant | null>(null)
const uploadFileSelected = ref<File | null>(null)
const selectedDocument = ref<Soustraitant | null>(null)
const loadingConsulter = ref(false)
const loadingDocumentId = ref<number | null>(null)

// Validation errors
const validationErrors = ref({
  designationStt: '',
  adresse: '',
  telephone: '',
  email: ''
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

const filteredSoustraitants = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = soustraitants.value.filter((soustraitant) =>
    soustraitant.designationStt.toLowerCase().includes(s) ||
    (soustraitant.description?.toLowerCase().includes(s) ?? false) ||
    (soustraitant.adresse?.toLowerCase().includes(s) ?? false) ||
    (soustraitant.telephone?.toLowerCase().includes(s) ?? false) ||
    (soustraitant.email?.toLowerCase().includes(s) ?? false)
  )

  return filtered.sort((a, b) => {
    // Primary sort by designation (A to Z)
    const nameA = a.designationStt.toLowerCase()
    const nameB = b.designationStt.toLowerCase()
    
    if (sortColumn.value === 'designationStt') {
      // If sorting by designation column, respect user's sort direction
      if (nameA < nameB) return sortAsc.value ? -1 : 1
      if (nameA > nameB) return sortAsc.value ? 1 : -1
      return 0
    } else {
      // For other columns, sort by that column first, then by designation as secondary sort
      const fieldA = (a[sortColumn.value] || '').toString().toLowerCase()
      const fieldB = (b[sortColumn.value] || '').toString().toLowerCase()
      
      if (fieldA !== fieldB) {
        if (fieldA < fieldB) return sortAsc.value ? -1 : 1
        if (fieldA > fieldB) return sortAsc.value ? 1 : -1
      }
      
      // Secondary sort by designation (always A to Z)
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    }
  })
})

const paginatedSoustraitants = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSoustraitants.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredSoustraitants.value.length / pageSize))

async function fetchSoustraitants() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('soustraitants/')
    soustraitants.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function fetchSecteurs() {
  try {
    const response = await axiosInstance.get('http://10.10.150.75:8000/api/secteurs/')
    secteurs.value = response.data
  } catch (e: any) {
    console.error('Erreur lors du chargement des secteurs:', e)
  }
}

// function handleFileSelect(event: Event) {
//   const target = event.target as HTMLInputElement
//   selectedFile.value = target.files?.[0] || null
// }

function handleUploadFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  uploadFileSelected.value = target.files?.[0] || null
}

function showUploadModal(soustraitant: Soustraitant) {
  soustraitantToUpload.value = soustraitant
  uploadFileSelected.value = null
}

async function addSoustraitant() {
  try {
    const formData = new FormData()
    formData.append('designationStt', newSoustraitant.value.designationStt)
    formData.append('description', newSoustraitant.value.description || '')
    formData.append('adresse', newSoustraitant.value.adresse || '')
    formData.append('telephone', newSoustraitant.value.telephone || '')
    formData.append('email', newSoustraitant.value.email || '')
    if (selectedFile.value) {
      formData.append('fichier', selectedFile.value)
    }

    if (newSoustraitant.value.secteurs_activite.length > 0) {
      newSoustraitant.value.secteurs_activite.forEach(secteurId => {
        formData.append('secteurs_activite', secteurId.toString())
      })
    }

    const res = await axiosInstance.post('soustraitants/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    soustraitants.value.push(res.data)
    showAddPopup.value = false
    newSoustraitant.value = { designationStt: '', description: '', adresse: '', telephone: '', email: '', secteurs_activite: [] }
    selectedFile.value = null
    validationErrors.value = { designationStt: '', adresse: '', telephone: '', email: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(soustraitant: Soustraitant) {
  soustraitantToDelete.value = soustraitant
}

function confirmUpdate(soustraitant: Soustraitant) {
  soustraitantToUpdate.value = { 
    ...soustraitant, 
    secteurs_activite: Array.isArray(soustraitant.secteurs_activite) ? [...soustraitant.secteurs_activite] : [] 
  }
}

async function updateSoustraitant() {
  if (!soustraitantToUpdate.value) return
  try {
    const formData = new FormData()
    formData.append('designationStt', soustraitantToUpdate.value.designationStt)
    formData.append('description', soustraitantToUpdate.value.description || '')
    formData.append('adresse', soustraitantToUpdate.value.adresse || '')
    formData.append('telephone', soustraitantToUpdate.value.telephone || '')
    formData.append('email', soustraitantToUpdate.value.email || '')
    if (soustraitantToUpdate.value.secteurs_activite && soustraitantToUpdate.value.secteurs_activite.length > 0) {
      soustraitantToUpdate.value.secteurs_activite.forEach(secteurId => {
        formData.append('secteurs_activite', secteurId.toString())
      })
    }

    await axiosInstance.put(`soustraitants/${soustraitantToUpdate.value.idSoustraitants}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const index = soustraitants.value.findIndex(s => s.idSoustraitants === soustraitantToUpdate.value!.idSoustraitants)
    if (index !== -1) {
      soustraitants.value[index] = { ...soustraitantToUpdate.value }
    }
    soustraitantToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteSoustraitant() {
  if (!soustraitantToDelete.value) return
  try {
    await axiosInstance.delete(`soustraitants/${soustraitantToDelete.value.idSoustraitants}/`)
    soustraitants.value = soustraitants.value.filter(s => s.idSoustraitants !== soustraitantToDelete.value!.idSoustraitants)
    soustraitantToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

// Validate required fields
function validateRequiredFields() {
  const errors = {
    designationStt: '',
    adresse: '',
    telephone: '',
    email: ''
  }
  
  let isValid = true
  
  if (!newSoustraitant.value.designationStt.trim()) {
    errors.designationStt = 'La désignation est requise'
    isValid = false
  }
  
  if (!newSoustraitant.value.adresse.trim()) {
    errors.adresse = 'L\'adresse est requise'
    // isValid = false
  }
  
  if (!newSoustraitant.value.telephone.trim()) {
    errors.telephone = 'Le téléphone est requis'
    // isValid = false
  }
  
  if (!newSoustraitant.value.email.trim()) {
    errors.email = 'L\'email est requis'
    // isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

// Validate and add Soustraitant
function validateAndAddSoustraitant() {
  if (validateRequiredFields()) {
    addSoustraitant()
  }
}

async function uploadFile() {
  if (!soustraitantToUpload.value || !uploadFileSelected.value) return
  try {
    const formData = new FormData()
    formData.append('fichier', uploadFileSelected.value)

    await axiosInstance.post(`soustraitants/${soustraitantToUpload.value.idSoustraitants}/upload-file/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    await fetchSoustraitants()
    soustraitantToUpload.value = null
    uploadFileSelected.value = null
  } catch (e: any) {
    alert('Erreur lors du téléchargement : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function viewFile(id: number) {
  const document = soustraitants.value.find(s => s.idSoustraitants === id)
  if (!document) return
  
  loadingConsulter.value = true
  loadingDocumentId.value = id
  
  try {
    const response = await axiosInstance.get(`soustraitants/${id}/view-file/`, {
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
  return secteurs.value.filter(secteur => !newSoustraitant.value.secteurs_activite.includes(secteur.id))
})

const availableUpdateSecteurs = computed(() => {
  if (!soustraitantToUpdate.value || !soustraitantToUpdate.value.secteurs_activite) return secteurs.value
  return secteurs.value.filter(secteur => !soustraitantToUpdate.value!.secteurs_activite!.includes(secteur.id))
})

function addSecteur(event: Event) {
  const target = event.target as HTMLSelectElement
  const secteurId = parseInt(target.value)
  if (secteurId && !newSoustraitant.value.secteurs_activite.includes(secteurId)) {
    newSoustraitant.value.secteurs_activite.push(secteurId)
  }
  target.value = ''
}

function removeSecteur(secteurId: number) {
  const index = newSoustraitant.value.secteurs_activite.indexOf(secteurId)
  if (index > -1) {
    newSoustraitant.value.secteurs_activite.splice(index, 1)
  }
}

function addUpdateSecteur(event: Event) {
  const target = event.target as HTMLSelectElement
  const secteurId = parseInt(target.value)
  if (secteurId && soustraitantToUpdate.value && soustraitantToUpdate.value.secteurs_activite && !soustraitantToUpdate.value.secteurs_activite.includes(secteurId)) {
    soustraitantToUpdate.value.secteurs_activite.push(secteurId)
  }
  target.value = ''
}

function removeUpdateSecteur(secteurId: number) {
  if (!soustraitantToUpdate.value || !soustraitantToUpdate.value.secteurs_activite) return
  const index = soustraitantToUpdate.value.secteurs_activite.indexOf(secteurId)
  if (index > -1) {
    soustraitantToUpdate.value.secteurs_activite.splice(index, 1)
  }
}

function exportCSV() {
  const headers = ['ID', 'Désignation', 'Description', 'Adresse', 'Téléphone', 'Email', 'Secteur d\'activité', 'Fichier']
  const rows = filteredSoustraitants.value.map(soustraitant => [
    soustraitant.idSoustraitants,
    soustraitant.designationStt,
    soustraitant.description || '',
    soustraitant.adresse || '',
    soustraitant.telephone || '',
    soustraitant.email || '',
    getSecteursNames(soustraitant.secteurs_activite),
    soustraitant.nomFichier || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'soustraitants.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchSecteurs()
  fetchSoustraitants()
})
</script>
<style scoped>
.page-wrapper {
  padding: 16px;
  margin-right: 20px; /* Adjust as needed */
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
  max-width: 150px;
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
  align-items: flex-start;
  flex-wrap: wrap;
}

.document-actions span {
  word-break: break-all;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
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
