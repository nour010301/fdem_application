<template>
  <div class="page-wrapper">
    <h1>Projets</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un projet..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredProjets.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('code')" class="sortable">
              Code
              <span v-if="sortColumn === 'code'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('description')" class="sortable">
              Description
              <span v-if="sortColumn === 'description'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('adresse')" class="sortable">
              Adresse
              <span v-if="sortColumn === 'adresse'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('wilaya')" class="sortable">
              Wilaya
              <span v-if="sortColumn === 'wilaya'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Fichier</th>
            <th>Fichier PAQ</th>
            <th>Fichier EGG</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="projet in paginatedProjets" :key="projet.code">
            <td>{{ projet.code }}</td>
            <td>{{ projet.description || '—' }}</td>
            <td>{{ projet.adresse || '—' }}</td>
            <td>{{ projet.wilaya || '—' }}</td>
            <td>
              <span v-if="projet.nomFichier">
                {{ projet.nomFichier }}
                <button @click="viewFile(projet.code)" class="view-file-btn" title="Voir le fichier">👁️</button>
              </span>
              <span v-else>—</span>
            </td>
            <td>
              <span v-if="projet.nomFichierPAQ">
                {{ projet.nomFichierPAQ }}
                <button @click="viewFilePAQ(projet.code)" class="view-file-btn" title="Voir le fichier PAQ">👁️</button>
              </span>
              <span v-else>—</span>
            </td>
            <td>
              <span v-if="projet.nomFichierEGG">
                {{ projet.nomFichierEGG }}
                <button @click="viewFileEGG(projet.code)" class="view-file-btn" title="Voir le fichier EGG">👁️</button>
              </span>
              <span v-else>—</span>
            </td>
            <td>
              <button class="update-button" @click="confirmUpdate(projet)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button v-if="userStore.canAccessBibliothequePages.value" class="upload-button" @click="showUploadModal(projet)" title="Gérer les fichiers">📁</button>
              <button class="delete-button" @click="confirmDelete(projet)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        <h2>Ajouter un Projet</h2>
        <div class="form-group">
          <label>Code *</label>
          <input 
            v-model="newProjet.code" 
            placeholder="Code" 
            :class="{ 'error': validationErrors.code }"
          />
          <div v-if="validationErrors.code" class="error-message">{{ validationErrors.code }}</div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newProjet.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="form-group">
          <label>Adresse</label>
          <input 
            v-model="newProjet.adresse" 
            placeholder="Adresse" 
          />
          <!-- <div v-if="validationErrors.adresse" class="error-message">{{ validationErrors.adresse }}</div> -->
        </div>
        <div class="form-group">
          <label>Wilaya</label>
          <select 
            v-model="newProjet.wilaya"
          >
            <option value="" disabled>Sélectionnez une wilaya</option>
            <option v-for="wilaya in wilayas" :key="wilaya" :value="wilaya">{{ wilaya }}</option>
          </select>
          <!-- <div v-if="validationErrors.wilaya" class="error-message">{{ validationErrors.wilaya }}</div> -->
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddProjet" :disabled="convertingFiles.add">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="projetToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ projetToDelete.code }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteProjet">Oui, supprimer</button>
          <button @click="projetToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="projetToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Projet</h2>
        <input v-model="projetToUpdate.code" placeholder="Code" />
        <textarea v-model="projetToUpdate.description" placeholder="Description (optionnelle)" />
        <input v-model="projetToUpdate.adresse" placeholder="Adresse" />
        <select v-model="projetToUpdate.wilaya">
          <option value="" disabled>Sélectionnez une wilaya</option>
          <option v-for="wilaya in wilayas" :key="wilaya" :value="wilaya">{{ wilaya }}</option>
        </select>
        <div class="modal-actions">
          <button @click="updateProjet">Modifier</button>
          <button @click="projetToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPLOAD FILES MODAL -->
    <div v-if="projetToUpload" class="modal-overlay">
      <div class="modal" style="max-width: 500px;">
        <h2>Gérer les fichiers pour {{ projetToUpload.code }}</h2>
        
        <div class="form-group">
          <label>📄 Fichier Principal</label>
          <input 
            type="file" 
            @change="handleFileSelect($event, 'fichier')"
            accept="*/*"
            :disabled="convertingFiles.fichier"
          />
          <small v-if="convertingFiles.fichier" style="color: #007bff;">Conversion en PDF en cours...</small>
          <small v-else-if="projetToUpload.nomFichier" style="color: #666;">Actuel: {{ projetToUpload.nomFichier }}</small>
          <small v-else style="color: #666;">Tous les types de fichiers seront automatiquement convertis en PDF</small>
        </div>
        
        <div class="form-group">
          <label>🟣 Fichier PAQ</label>
          <input 
            type="file" 
            @change="handleFileSelect($event, 'PAQ')"
            accept="*/*"
            :disabled="convertingFiles.PAQ"
          />
          <small v-if="convertingFiles.PAQ" style="color: #007bff;">Conversion en PDF en cours...</small>
          <small v-else-if="projetToUpload.nomFichierPAQ" style="color: #666;">Actuel: {{ projetToUpload.nomFichierPAQ }}</small>
          <small v-else style="color: #666;">Tous les types de fichiers seront automatiquement convertis en PDF</small>
        </div>
        
        <div class="form-group">
          <label>🟠 Fichier EGG</label>
          <input 
            type="file" 
            @change="handleFileSelect($event, 'EGG')"
            accept="*/*"
            :disabled="convertingFiles.EGG"
          />
          <small v-if="convertingFiles.EGG" style="color: #007bff;">Conversion en PDF en cours...</small>
          <small v-else-if="projetToUpload.nomFichierEGG" style="color: #666;">Actuel: {{ projetToUpload.nomFichierEGG }}</small>
          <small v-else style="color: #666;">Tous les types de fichiers seront automatiquement convertis en PDF</small>
        </div>
        
        <div class="modal-actions">
          <button @click="uploadFiles" :disabled="convertingFiles.fichier || convertingFiles.PAQ || convertingFiles.EGG">Télécharger</button>
          <button @click="projetToUpload = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>

  <!-- FILE VIEWER MODAL -->
  <div v-if="selectedDocument && selectedDocument.fichier" class="modal-overlay">
    <div class="modal pdf-modal">
      <!-- Modal Header with Close Button -->
      <div class="modal-header-fixed">
        <h2>Consulter Document</h2>
        <button @click="closeDocumentViewer" class="modal-close-btn">Fermer</button>
      </div>

      <div class="file-viewer-container">
        <!-- PDF Viewer -->
        <PdfViewer
          v-if="selectedDocument.fichier && getFileType(selectedDocument) === 'pdf'"
          :pdfUrl="selectedDocument.fichier"
          :canDownload="canDownload"
          :canPrint="canPrint"
          @download="handleDownloadAction"
          @print="handlePrintAction"
        />
        
        <!-- Image Viewer -->
        <ImageViewer
          v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'image'"
          :imageUrl="selectedDocument.fichier"
          :canDownload="canDownload"
          :canPrint="canPrint"
          @download="handleDownloadAction"
          @print="handlePrintAction"
        />
        
        <!-- Video Viewer -->
        <VideoViewer
          v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'video'"
          :videoUrl="selectedDocument.fichier"
          :canDownload="canDownload"
          @download="handleDownloadAction"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import PdfViewer from '../components/PdfViewer.vue'
import ImageViewer from '../components/ImageViewer.vue'
import VideoViewer from '../components/VideoViewer.vue'
import { useUserStore } from '../store/userStore'
import { FileConverter } from '../utils/fileConverter'

interface Document {
  idDocument: number | string
  fichier?: string | null
  video?: string | null
  plan?: string | null
  photos?: string | null
  detectedType?: string
}

interface Projet {
  code: string
  description: string
  adresse: string | null
  wilaya: string | null
  nomFichier: string | null
  nomFichierPAQ: string | null
  nomFichierEGG: string | null
  date_suppression: string | null
}

const projets = ref<Projet[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'code' | 'description' | 'adresse' | 'wilaya'>('code')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newProjet = ref({ code: '', description: '', adresse: '', wilaya: '' })
const selectedFile = ref<File | null>(null)
const projetToDelete = ref<Projet | null>(null)
const projetToUpdate = ref<Projet | null>(null)
const projetToUpload = ref<Projet | null>(null)
const selectedFiles = ref<{
  fichier: File | null
  PAQ: File | null
  EGG: File | null
}>({
  fichier: null,
  PAQ: null,
  EGG: null
})

// Loading states for PDF conversion
const convertingFiles = ref({
  fichier: false,
  PAQ: false,
  EGG: false,
  add: false
})

// Validation errors
const validationErrors = ref({
  code: '',
  adresse: '',
  wilaya: ''
})

const userStore = useUserStore()
const selectedDocument = ref<Document | null>(null)
const loadingViewDocument = ref<Record<string, boolean>>({})

// Computed properties for permissions
const canDownload = computed(() => {
  return userStore.canDownloadDocuments.value
})

const canPrint = computed(() => {
  return userStore.canPrintDocuments.value
})

const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
  "Ghardaïa", "Relizane"
]

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredProjets = computed(() => {
  const s = search.value.trim().toLowerCase();

  const filtered = projets.value.filter((projet) =>
    (projet.code ?? '').toLowerCase().includes(s) ||
    (projet.description ?? '').toLowerCase().includes(s) ||
    (projet.adresse ?? '').toLowerCase().includes(s) ||
    (projet.wilaya ?? '').toLowerCase().includes(s)
  );

  return filtered.sort((a, b) => {
    // Primary sort by code (A to Z)
    const nameA = a.code.toLowerCase()
    const nameB = b.code.toLowerCase()
    
    if (sortColumn.value === 'code') {
      // If sorting by code column, respect user's sort direction
      if (nameA < nameB) return sortAsc.value ? -1 : 1
      if (nameA > nameB) return sortAsc.value ? 1 : -1
      return 0
    } else {
      // For other columns, sort by that column first, then by code as secondary sort
      const fieldA = (a[sortColumn.value] || '').toString().toLowerCase()
      const fieldB = (b[sortColumn.value] || '').toString().toLowerCase()
      
      if (fieldA !== fieldB) {
        if (fieldA < fieldB) return sortAsc.value ? -1 : 1
        if (fieldA > fieldB) return sortAsc.value ? 1 : -1
      }
      
      // Secondary sort by code (always A to Z)
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    }
  });
});

const paginatedProjets = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProjets.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredProjets.value.length / pageSize))

async function fetchProjets() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('projets/')
    projets.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function handleFileSelect(event: Event, type?: 'fichier' | 'PAQ' | 'EGG') {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    // Show loading state
    if (type) {
      convertingFiles.value[type] = true
    } else {
      convertingFiles.value.add = true
    }
    
    // Convert file to PDF
    const result = await FileConverter.convertToPdf(file)
    
    if (result.success && result.pdfFile) {
      if (type) {
        selectedFiles.value[type] = result.pdfFile
      } else {
        selectedFile.value = result.pdfFile
      }
    } else {
      alert(`Erreur lors de la conversion: ${result.error}`)
      // Clear the input
      target.value = ''
    }
  } catch (error) {
    alert('Erreur lors de la conversion du fichier')
    target.value = ''
  } finally {
    // Hide loading state
    if (type) {
      convertingFiles.value[type] = false
    } else {
      convertingFiles.value.add = false
    }
  }
}

function showUploadModal(projet: Projet) {
  projetToUpload.value = projet
  selectedFiles.value = { fichier: null, PAQ: null, EGG: null }
}

async function addProjet() {
  try {
    const formData = new FormData()
    formData.append('code', newProjet.value.code)
    formData.append('description', newProjet.value.description || '')
    formData.append('adresse', newProjet.value.adresse || '')
    formData.append('wilaya', newProjet.value.wilaya || '')
    if (selectedFile.value) {
      formData.append('fichier', selectedFile.value)
    }

    const res = await axiosInstance.post('projets/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    projets.value.push(res.data)
    showAddPopup.value = false
    newProjet.value = { code: '', description: '', adresse: '', wilaya: '' }
    selectedFile.value = null
    validationErrors.value = { code: '', adresse: '', wilaya: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(projet: Projet) {
  projetToDelete.value = projet
}

function confirmUpdate(projet: Projet) {
  projetToUpdate.value = { ...projet }
}

async function updateProjet() {
  if (!projetToUpdate.value) return
  try {
    const formData = new FormData()
    formData.append('code', projetToUpdate.value.code)
    formData.append('description', projetToUpdate.value.description || '')
    formData.append('adresse', projetToUpdate.value.adresse || '')
    formData.append('wilaya', projetToUpdate.value.wilaya || '')

    await axiosInstance.put(`projets/${projetToUpdate.value.code}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const index = projets.value.findIndex(p => p.code === projetToUpdate.value!.code)
    if (index !== -1) {
      projets.value[index] = { ...projetToUpdate.value }
    }
    projetToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteProjet() {
  if (!projetToDelete.value) return
  try {
    await axiosInstance.delete(`projets/${projetToDelete.value.code}/`)
    projets.value = projets.value.filter(p => p.code !== projetToDelete.value!.code)
    projetToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

// Validate required fields
function validateRequiredFields() {
  const errors = {
    code: '',
    adresse: '',
    wilaya: ''
  }
  
  let isValid = true
  
  if (!newProjet.value.code.trim()) {
    errors.code = 'Le code est requis'
    isValid = false
  }
  
  if (!newProjet.value.adresse.trim()) {
    errors.adresse = 'L\'adresse est requise'
    // isValid = false
  }
  
  if (!newProjet.value.wilaya) {
    errors.wilaya = 'La wilaya est requise'
    // isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

// Validate and add Projet
function validateAndAddProjet() {
  if (validateRequiredFields()) {
    addProjet()
  }
}

async function uploadFiles() {
  if (!projetToUpload.value) return
  
  const uploads = []
  
  try {
    // Upload regular file
    if (selectedFiles.value.fichier) {
      const formData = new FormData()
      formData.append('fichier', selectedFiles.value.fichier)
      uploads.push(
        axiosInstance.post(`projets/${projetToUpload.value.code}/upload-file/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      )
    }
    
    // Upload PAQ file
    if (selectedFiles.value.PAQ) {
      const formData = new FormData()
      formData.append('fichierPAQ', selectedFiles.value.PAQ)
      uploads.push(
        axiosInstance.post(`projets/${projetToUpload.value.code}/upload-file-PAQ/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      )
    }
    
    // Upload EGG file
    if (selectedFiles.value.EGG) {
      const formData = new FormData()
      formData.append('fichierEGG', selectedFiles.value.EGG)
      uploads.push(
        axiosInstance.post(`projets/${projetToUpload.value.code}/upload-file-EGG/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      )
    }
    
    if (uploads.length === 0) {
      alert('Veuillez sélectionner au moins un fichier')
      return
    }
    
    await Promise.all(uploads)
    await fetchProjets()
    projetToUpload.value = null
  } catch (e: any) {
    alert('Erreur lors du téléchargement : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function viewFile(code: string) {
  loadingViewDocument.value[`projet_${code}`] = true
  
  try {
    const response = await axiosInstance.get(`projets/${code}/view-file/`, {
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
        idDocument: `projet_${code}`,
        fichier: fileUrl,
        detectedType: detectedType
      }
    }
  } catch (e: any) {
    alert('Erreur lors de l\'ouverture du fichier : ' + (e?.message || 'Erreur inconnue'))
  } finally {
    loadingViewDocument.value[`projet_${code}`] = false
  }
}


async function viewFilePAQ(code: string) {
  loadingViewDocument.value[`paq_${code}`] = true
  
  try {
    const response = await axiosInstance.get(`projets/${code}/view-file-PAQ/`, {
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
        idDocument: `paq_${code}`,
        fichier: fileUrl,
        detectedType: detectedType
      }
    }
  } catch (e: any) {
    alert('Erreur lors de l\'ouverture du fichier PAQ : ' + (e?.message || 'Erreur inconnue'))
  } finally {
    loadingViewDocument.value[`paq_${code}`] = false
  }
}

async function viewFileEGG(code: string) {
  loadingViewDocument.value[`egg_${code}`] = true
  
  try {
    const response = await axiosInstance.get(`projets/${code}/view-file-EGG/`, {
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
        idDocument: `egg_${code}`,
        fichier: fileUrl,
        detectedType: detectedType
      }
    }
  } catch (e: any) {
    alert('Erreur lors de l\'ouverture du fichier EGG : ' + (e?.message || 'Erreur inconnue'))
  } finally {
    loadingViewDocument.value[`egg_${code}`] = false
  }
}

function exportCSV() {
  const headers = ['Code', 'Description', 'Adresse', 'Wilaya', 'Fichier', 'Fichier PAQ', 'Fichier EGG']
  const rows = filteredProjets.value.map(projet => [
    projet.code,
    projet.description || '',
    projet.adresse || '',
    projet.wilaya || '',
    projet.nomFichier || '',
    projet.nomFichierPAQ || '',
    projet.nomFichierEGG || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'projets.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Helper functions for document viewing
function closeDocumentViewer() {
  if (selectedDocument.value?.fichier) {
    window.URL.revokeObjectURL(selectedDocument.value.fichier)
  }
  selectedDocument.value = null
}

function getFileType(document: Document): string {
  if (document.detectedType) {
    return document.detectedType
  }
  return 'pdf' // Default to PDF
}

function handleDownloadAction(documentId: string | number) {
  // Handle download action if needed
  console.log('Download action for document:', documentId)
}

function handlePrintAction(documentId: string | number) {
  // Handle print action if needed
  console.log('Print action for document:', documentId)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchProjets()
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
.form-group select.error,
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 95vw;
  max-height: 95vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.pdf-modal {
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header-fixed {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  flex-shrink: 0;
}

.modal-header-fixed h2 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.modal-close-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.modal-close-btn:hover {
  background: #c82333;
}

.file-viewer-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
