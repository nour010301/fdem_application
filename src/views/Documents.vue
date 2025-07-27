<template>
  <div class="page-wrapper">
    <h1>Documents</h1>

    <!-- Filter Box -->
    <div class="filter-box">
      <select v-model="selectedTypeProduit" @change="onTypeProduitChange" :disabled="loadingFilters">
        <option value="">Type Produit</option>
        <option v-for="type in typesProduit" :key="type.idTypeProduit" :value="type.idTypeProduit">
          {{ type.designation }}
        </option>
      </select>
      <select v-model="selectedProduit" @change="onProduitChange" :disabled="loadingFilters || !produits.length">
        <option value="">Produit</option>
        <option v-for="prod in produits" :key="prod.idProduit" :value="prod.idProduit">
          {{ prod.designation }}
        </option>
      </select>
      <select v-model="selectedSection" @change="onSectionChange" :disabled="loadingFilters">
        <option value="">Section</option>
        <option v-for="s in sections" :key="s.idSectionProduit" :value="s.idSectionProduit">
          {{ s.designation }}
        </option>
      </select>
      <select v-model="selectedStructure" @change="onStructureChange" :disabled="loadingFilters">
        <option value="">Structure</option>
        <option v-for="str in structures" :key="str.idStructure" :value="str.idStructure">
          {{ str.designation || str.nom }}
        </option>
      </select>
      <select v-model="selectedSubdivision1" @change="onSubdivision1Change" :disabled="loadingFilters">
        <option value="">Subdivision 1</option>
        <option v-for="sub1 in subdivisions1" :key="sub1.idSubDivisionNv_1" :value="sub1.idSubDivisionNv_1">
          {{ sub1.nom }}
        </option>
      </select>
      <select v-model="selectedSubdivision2" @change="onSubdivision2Change" :disabled="loadingFilters">
        <option value="">Subdivision 2</option>
        <option v-for="sub2 in subdivisions2" :key="sub2.idSubDivisionNv_2" :value="sub2.idSubDivisionNv_2">
          {{ sub2.nom }}
        </option>
      </select>
      <select v-model="selectedSubdivision3" @change="onSubdivision3Change" :disabled="loadingFilters">
        <option value="">Subdivision 3</option>
        <option v-for="sub3 in subdivisions3" :key="sub3.idSubDivisionNv_3" :value="sub3.idSubDivisionNv_3">
          {{ sub3.nom }}
        </option>
      </select>
      <select v-model="selectedSubdivision4" :disabled="loadingFilters">
        <option value="">Subdivision 4</option>
        <option v-for="sub4 in subdivisions4" :key="sub4.idSubDivisionNv_4" :value="sub4.idSubDivisionNv_4">
          {{ sub4.nom }}
        </option>
      </select>
      <button class="primary" @click="applyFilters" :disabled="loading">{{ loading ? "Filtrage..." : "Filtrer" }}</button>
      <button class="outline" @click="resetFilters" :disabled="loading">Annuler le filtre</button>
    </div>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un document..."
        class="search-input"
      />
      <button 
        @click="redirectToAddDocument" 
        class="add-button"
        :class="{ 'disabled': !canAddDocuments }"
        :disabled="!canAddDocuments"
      >
        + Ajouter
      </button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredDocuments.length > 0" class="product-table">
        <!-- ... your thead/tr/td code from before ... -->
        <thead>
        <tr>
          <th @click="toggleSort('idDocument')" class="sortable">
            ID
            <span v-if="sortColumn === 'idDocument'">{{ sortAsc ? '▲' : '▼' }}</span>
          </th>
          <th>Designation</th>
          <th>Type Produit</th>
          <th>Produit</th>
          <th>Structure</th>
          <th>Section</th>
          <th>Subdivision 1</th>
          <th>Subdivision 2</th>
          <th>Subdivision 3</th>
          <th>Subdivision 4</th>
          <!-- <th>Actions</th> -->
          <th>Consulter</th>
        </tr>
        </thead>
        <tbody>
          <tr v-for="document in paginatedDocuments" :key="document.idDocument">
            <td>{{ document.idDocument }}</td>
            <td>{{ document.designation || '—' }}</td>
            <td>{{ document.typeProduitDesignation || '—' }}</td>
            <td>{{ document.produitDesignation || '—' }}</td>
            <td>{{ document.structureNom || '—' }}</td>
            <td>{{ document.sectionNom || '—' }}</td>
            <td>{{ document.subDivisionNv1Nom || '—' }}</td>
            <td>{{ document.subDivisionNv2Nom || '—' }}</td>
            <td>{{ document.subDivisionNv3Nom || '—' }}</td>
            <td>{{ document.subDivisionNv4Nom || '—' }}</td>
            <!-- <td>
              <button class="delete-button" @click="confirmDelete(document)">Supprimer</button>
            </td> -->
            <td>
              <button class="view-button" @click="viewDocument(document)">Consulter</button>
              <button 
                class="update-button" 
                @click="confirmUpdate(document)"
                :class="{ 'disabled': !canAddDocuments }"
                :disabled="!canAddDocuments"
                title="Modifier"
              >
                ✎
              </button>
              <button 
                class="move-button" 
                @click="confirmMove(document)"
                :class="{ 'disabled': !canAddDocuments }"
                :disabled="!canAddDocuments"
                title="Déplacer"
              >
                ↗
              </button>
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

    <!-- DELETE CONFIRMATION -->
    <div v-if="documentToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression du document ID <strong>{{ documentToDelete.idDocument }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteDocument">Oui, supprimer</button>
          <button @click="documentToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>



    <!-- UPDATE MODAL -->
    <div v-if="documentToUpdate" class="modal-overlay">
      <div class="modal update-modal">
        <div class="modal-header">
          <h2><i class="fas fa-edit"></i> Modifier Document</h2>
          <button @click="documentToUpdate = null" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Fichier actuel</label>
              <div class="current-file-info" v-if="documentToUpdate?.fichier">
                <span>{{ getFileName(documentToUpdate.fichier) }}</span>
              </div>
              <div v-else class="no-file-info">Aucun fichier</div>
            </div>
            
            <div class="form-group">
              <label>Désignation</label>
              <input v-model="documentToUpdate.designation" placeholder="Désignation du document" />
            </div>
            
            <div class="form-group">
              <label>Remplacer par un fichier unique</label>
              <input type="file" @change="onFileSelect" accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi" />
              <div v-if="selectedFile" class="file-info">
                <span>Fichier sélectionné: {{ selectedFile.name }}</span>
                <button @click="selectedFile = null" type="button" class="remove-file">Retirer</button>
              </div>
            </div>
            
            <div class="form-group">
              <label>Ou sélectionner plusieurs images (pour créer un PDF)</label>
              <input type="file" multiple accept="image/*" @change="onMultipleImagesChange" />
              <div v-if="multipleImages.length > 0" class="images-preview">
                <h4>Images sélectionnées ({{ multipleImages.length }}):</h4>
                <div class="image-list">
                  <div v-for="(image, index) in multipleImages" :key="index" class="image-item">
                    <span>{{ image.name }}</span>
                    <button @click="removeImage(index)" type="button" class="remove-image">×</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="documentToUpdate = null" class="btn-cancel">Annuler</button>
          <button @click="updateDocument" class="btn-update"><i class="fas fa-save"></i> Modifier</button>
        </div>
      </div>
    </div>

    <!-- MOVE MODAL -->
    <div v-if="documentToMove" class="modal-overlay">
      <div class="modal move-modal">
        <div class="modal-header">
          <h2><i class="fas fa-arrows-alt"></i> Déplacer Document</h2>
          <button @click="documentToMove = null" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Type Produit</label>
              <select v-model="documentToMove.idTypeProduit" @change="onMoveTypeProduitChange">
                <option value="">Sélectionner un type produit</option>
                <option v-for="type in typesProduit" :key="type.idTypeProduit" :value="type.idTypeProduit">
                  {{ type.designation }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Produit</label>
              <select v-model="documentToMove.idProduit">
                <option value="">Sélectionner un produit</option>
                <option v-for="prod in produits" :key="prod.idProduit" :value="prod.idProduit">
                  {{ prod.designation }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Structure</label>
              <select v-model="documentToMove.idStructure">
                <option value="">Sélectionner une structure</option>
                <option v-for="str in structures" :key="str.idStructure" :value="str.idStructure">
                  {{ str.designation || str.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Section</label>
              <select v-model="documentToMove.idSection">
                <option value="">Sélectionner une section</option>
                <option v-for="s in sections" :key="s.idSectionProduit" :value="s.idSectionProduit">
                  {{ s.designation }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 1</label>
              <select v-model="documentToMove.idSubDivisionNv_1">
                <option value="">Sélectionner subdivision 1</option>
                <option v-for="sub1 in subdivisions1" :key="sub1.idSubDivisionNv_1" :value="sub1.idSubDivisionNv_1">
                  {{ sub1.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 2</label>
              <select v-model="documentToMove.idSubDivisionNv_2">
                <option value="">Sélectionner subdivision 2</option>
                <option v-for="sub2 in subdivisions2" :key="sub2.idSubDivisionNv_2" :value="sub2.idSubDivisionNv_2">
                  {{ sub2.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 3</label>
              <select v-model="documentToMove.idSubDivisionNv_3">
                <option value="">Sélectionner subdivision 3</option>
                <option v-for="sub3 in subdivisions3" :key="sub3.idSubDivisionNv_3" :value="sub3.idSubDivisionNv_3">
                  {{ sub3.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 4</label>
              <select v-model="documentToMove.idSubDivisionNv_4">
                <option value="">Sélectionner subdivision 4</option>
                <option v-for="sub4 in subdivisions4" :key="sub4.idSubDivisionNv_4" :value="sub4.idSubDivisionNv_4">
                  {{ sub4.nom }}
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="documentToMove = null" class="btn-cancel">Annuler</button>
          <button @click="moveDocument" class="btn-move"><i class="fas fa-arrows-alt"></i> Déplacer</button>
        </div>
      </div>
    </div>

    <!-- FILE VIEWER MODAL -->
    <div v-if="selectedDocument && selectedDocument.fichier" class="modal-overlay">
      <div class="modal pdf-modal">
        <h2>Consulter Document</h2>
        
        <div class="file-viewer-container">
          <PdfViewer
            v-if="selectedDocument.fichier"
            :pdfUrl="selectedDocument.fichier"
            :canDownload="userStore.user.value?.profil === 2 || userStore.user.value?.telechargement || false"
            :canPrint="userStore.user.value?.profil === 2 || userStore.user.value?.impression || false"
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
import { useRouter } from 'vue-router'
import PdfViewer from '../components/PdfViewer.vue'
import { useUserStore } from '../store/userStore'

// State for table and basic features (search, sort, etc.)
interface Document {
  idDocument: number
  idTypeProduit?: number | null
  idProduit?: number | null
  idStructure?: number | null
  idSection?: number | null
  idSubDivisionNv_1?: number | null
  idSubDivisionNv_2?: number | null
  idSubDivisionNv_3?: number | null
  idSubDivisionNv_4?: number | null
  typeProduitDesignation?: string | null
  produitDesignation?: string | null
  structureNom?: string | null
  sectionNom?: string | null
  subDivisionNv1Nom?: string | null
  subDivisionNv2Nom?: string | null
  subDivisionNv3Nom?: string | null
  subDivisionNv4Nom?: string | null
  designation?: string | null
  chemin?: string | null
  version?: string | null
  dateCreation?: string | null
  dateModification?: string | null
  fichier?: string | null
}

const documents = ref<Document[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const currentPage = ref(1)
const pageSize = 10
const sortColumn = ref<'idDocument' | 'typeProduitDesignation' | 'produitDesignation'>('idDocument')
const sortAsc = ref(true)
const documentToDelete = ref<Document | null>(null)
const documentToUpdate = ref<Document | null>(null)
const documentToMove = ref<Document | null>(null)
const selectedFile = ref<File | null>(null)
const multipleImages = ref<File[]>([])
const showImageToPdfOption = ref(false)
const router = useRouter()
const selectedDocument = ref<Document | null>(null)


// User store for role-based access control
const userStore = useUserStore()

// Computed property to check if user can access "ajouter" buttons
// Users with CONSULTATION profile (3) can only consult, not add
const canAddDocuments = computed(() => {
  return userStore.userRole.value !== userStore.ROLES.CONSULTATION
})



// --- Filters State ---
const typesProduit = ref<any[]>([])
const produits = ref<any[]>([])
const sections = ref<any[]>([])
const structures = ref<any[]>([])
const subdivisions1 = ref<any[]>([])
const subdivisions2 = ref<any[]>([])
const subdivisions3 = ref<any[]>([])
const subdivisions4 = ref<any[]>([])

const selectedTypeProduit = ref<string | number | "">("")
const selectedProduit = ref<string | number | "">("")
const selectedSection = ref<string | number | "">("")
const selectedStructure = ref<string | number | "">("")
const selectedSubdivision1 = ref<string | number | "">("")
const selectedSubdivision2 = ref<string | number | "">("")
const selectedSubdivision3 = ref<string | number | "">("")
const selectedSubdivision4 = ref<string | number | "">("")

const loadingFilters = ref(false)

// --- Filter Fetch Helpers ---
async function loadFilterOptions() {
  loadingFilters.value = true
  const [
    typesRes,
    produitsRes,
    sectionsRes,
    structuresRes,
    sub1Res,
    sub2Res,
    sub3Res,
    sub4Res
  ] = await Promise.all([
    axiosInstance.get('types/'),
    axiosInstance.get('produits/'),
    axiosInstance.get('sections/'),
    axiosInstance.get('structures/'),
    axiosInstance.get('subdivision-nv1/'),
    axiosInstance.get('subdivision-nv2/'),
    axiosInstance.get('subdivision-nv3/'),
    axiosInstance.get('subdivision-nv4/')
  ]);
  typesProduit.value = typesRes.data;
  produits.value = produitsRes.data;
  sections.value = sectionsRes.data;
  structures.value = structuresRes.data;
  subdivisions1.value = sub1Res.data;
  subdivisions2.value = sub2Res.data;
  subdivisions3.value = sub3Res.data;
  subdivisions4.value = sub4Res.data;
  loadingFilters.value = false;
}

// Cascading filter change handlers
function onTypeProduitChange() {
  // Reset all subsequent filters
  selectedProduit.value = ""
  selectedSection.value = ""
  selectedStructure.value = ""
  selectedSubdivision1.value = ""
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
  fetchProduits()
}

function onProduitChange() {
  // Reset all subsequent filters
  selectedSection.value = ""
  selectedStructure.value = ""
  selectedSubdivision1.value = ""
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
}

function onSectionChange() {
  // Reset all subsequent filters
  selectedStructure.value = ""
  selectedSubdivision1.value = ""
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
}

function onStructureChange() {
  // Reset all subsequent filters
  selectedSubdivision1.value = ""
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
}

function onSubdivision1Change() {
  // Reset all subsequent filters
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
}

function onSubdivision2Change() {
  // Reset all subsequent filters
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
}

function onSubdivision3Change() {
  // Reset all subsequent filters
  selectedSubdivision4.value = ""
}

async function fetchProduits() {
  // refetch produits when TypeProduit changes (optional: filter only relevant produits)
  if (!selectedTypeProduit.value) {
    const res = await axiosInstance.get('produits/')
    produits.value = res.data
  } else {
    const res = await axiosInstance.get('produits/', {
      params: { idTypeProduit: selectedTypeProduit.value }
    })
    produits.value = res.data.filter((prod: any) => prod.idTypeProduit === selectedTypeProduit.value)
  }
}

// --- Filtering Documents ---
async function applyFilters() {
  loading.value = true
  error.value = null
  try {
    const params: Record<string, string | number> = {};
    if (selectedTypeProduit.value) params.idTypeProduit = selectedTypeProduit.value;
    if (selectedProduit.value) params.idProduit = selectedProduit.value;
    if (selectedSection.value) params.idSection = selectedSection.value;
    if (selectedStructure.value) params.idStructure = selectedStructure.value;
    if (selectedSubdivision1.value) params.idSubDivisionNv_1 = selectedSubdivision1.value;
    if (selectedSubdivision2.value) params.idSubDivisionNv_2 = selectedSubdivision2.value;
    if (selectedSubdivision3.value) params.idSubDivisionNv_3 = selectedSubdivision3.value;
    if (selectedSubdivision4.value) params.idSubDivisionNv_4 = selectedSubdivision4.value;
    const response = await axiosInstance.get('documentsFilter/', { params });
    documents.value = response.data;
    currentPage.value = 1;
  } catch (e: any) {
    error.value = e?.message || "Erreur lors du filtrage"
  } finally {
    loading.value = false
  }
}

async function resetFilters() {
  selectedTypeProduit.value = ""
  selectedProduit.value = ""
  selectedSection.value = ""
  selectedStructure.value = ""
  selectedSubdivision1.value = ""
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
  await fetchDocuments()
}

// --- Table Logic (same as before, but uses documents.value for filtered) ---
function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

// const filteredDocuments = computed(() => {
//   const s = search.value.trim().toLowerCase()
//   const filtered = documents.value.filter((doc) =>
//     (doc.idDocument?.toString().includes(s) ?? false) ||
//     (doc.typeProduitDesignation ?? '').toLowerCase().includes(s) ||
//     (doc.produitDesignation ?? '').toLowerCase().includes(s) ||
//     (doc.structureNom ?? '').toLowerCase().includes(s) ||
//     (doc.sectionNom ?? '').toLowerCase().includes(s) ||
//     (doc.subDivisionNv1Nom ?? '').toLowerCase().includes(s) ||
//     (doc.subDivisionNv2Nom ?? '').toLowerCase().includes(s) ||
//     (doc.subDivisionNv3Nom ?? '').toLowerCase().includes(s) ||
//     (doc.designation ?? '').toLowerCase().includes(s)
//   )
//   return filtered.sort((a, b) => {
//     const fieldA = a[sortColumn.value] ?? ''
//     const fieldB = b[sortColumn.value] ?? ''
//     if (fieldA < fieldB) return sortAsc.value ? -1 : 1
//     if (fieldA > fieldB) return sortAsc.value ? 1 : -1
//     return 0
//   })
// })



const filteredDocuments = computed(() => {
  const s = search.value.trim().toLowerCase();
  if (!s) return documents.value; // Return all documents if search term is empty

  return documents.value.filter((doc) => {
    return (
      (doc.idDocument?.toString().toLowerCase().includes(s) || false) ||
      (doc.typeProduitDesignation?.toLowerCase().includes(s) || false) ||
      (doc.produitDesignation?.toLowerCase().includes(s) || false) ||
      (doc.structureNom?.toLowerCase().includes(s) || false) ||
      (doc.sectionNom?.toLowerCase().includes(s) || false) ||
      (doc.subDivisionNv1Nom?.toLowerCase().includes(s) || false) ||
      (doc.subDivisionNv2Nom?.toLowerCase().includes(s) || false) ||
      (doc.subDivisionNv3Nom?.toLowerCase().includes(s) || false) ||
      (doc.subDivisionNv4Nom?.toLowerCase().includes(s) || false) ||
      (doc.designation?.toLowerCase().includes(s) || false)
    );
  }).sort((a, b) => {
    const fieldA = a[sortColumn.value] ?? '';
    const fieldB = b[sortColumn.value] ?? '';
    if (fieldA < fieldB) return sortAsc.value ? -1 : 1;
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1;
    return 0;
  });
});






const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredDocuments.value.slice(start, start + pageSize)
})
const totalPages = computed(() => Math.ceil(filteredDocuments.value.length / pageSize))

// --- Data CRUD (same as your code) ---
async function fetchDocuments() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('documents/')
    documents.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}
// function confirmDelete(document: Document) { documentToDelete.value = document }
async function deleteDocument() {
  if (!documentToDelete.value) return
  try {
    await axiosInstance.delete(`documents/${documentToDelete.value.idDocument}/`)
    documents.value = documents.value.filter(d => d.idDocument !== documentToDelete.value!.idDocument)
    documentToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}
function redirectToAddDocument() { router.push('/add-document') }
async function viewDocument(document: Document) {
  try {
    const response = await fetch(`http://10.10.150.75:8000/api/documents/view-file/${document.idDocument}/`)
    const blob = await response.blob()
    const fileUrl = URL.createObjectURL(blob)
    
    selectedDocument.value = {
      ...document,
      fichier: fileUrl
    }
  } catch (error) {
    console.error('Error loading document:', error)
    alert('Erreur lors du chargement du document')
  }
}

function confirmUpdate(document: Document) {
  documentToUpdate.value = { ...document }
  selectedFile.value = null
  multipleImages.value = []
  showImageToPdfOption.value = false
}

function getFileName(filePath: string): string {
  if (!filePath) return 'Aucun fichier'
  return filePath.split('/').pop() || filePath
}

function confirmMove(document: Document) {
  documentToMove.value = { ...document }
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    // Clear multiple images if single file is selected
    multipleImages.value = []
    showImageToPdfOption.value = false
  }
}

function onMultipleImagesChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    multipleImages.value = Array.from(target.files).filter(file => 
      file.type.startsWith('image/')
    )
    showImageToPdfOption.value = multipleImages.value.length > 0
    // Clear single file if multiple images are selected
    if (multipleImages.value.length > 0) {
      selectedFile.value = null
    }
  }
}

function removeImage(index: number) {
  multipleImages.value.splice(index, 1)
  showImageToPdfOption.value = multipleImages.value.length > 0
}

async function convertImagesToPdf(): Promise<File> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF('p', 'mm', 'a4')
  
  for (let i = 0; i < multipleImages.value.length; i++) {
    const file = multipleImages.value[i]
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    await new Promise((resolve) => {
      img.onload = () => {
        const pageWidth = 210
        const pageHeight = 297
        const margin = 10
        const maxWidth = pageWidth - (margin * 2)
        const maxHeight = pageHeight - (margin * 2)
        
        const scale = 2
        let { width, height } = img
        
        const widthRatio = maxWidth / width
        const heightRatio = maxHeight / height
        const ratio = Math.min(widthRatio, heightRatio)
        
        const finalWidth = width * ratio
        const finalHeight = height * ratio
        
        canvas.width = width * scale
        canvas.height = height * scale
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
        
        ctx.scale(scale, scale)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        ctx.drawImage(img, 0, 0, width, height)
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        
        if (i > 0) pdf.addPage()
        
        const x = (pageWidth - finalWidth) / 2
        const y = (pageHeight - finalHeight) / 2
        
        pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight)
        resolve(null)
      }
      img.src = URL.createObjectURL(file)
    })
  }
  
  const pdfBlob = pdf.output('blob')
  return new File([pdfBlob], `${documentToUpdate.value?.designation || 'images'}.pdf`, { type: 'application/pdf' })
}

function onMoveTypeProduitChange() {
  if (documentToMove.value) {
    documentToMove.value.idProduit = null
    documentToMove.value.idSection = null
    documentToMove.value.idStructure = null
    documentToMove.value.idSubDivisionNv_1 = null
    documentToMove.value.idSubDivisionNv_2 = null
    documentToMove.value.idSubDivisionNv_3 = null
    documentToMove.value.idSubDivisionNv_4 = null
  }
}

async function updateDocument() {
  if (!documentToUpdate.value) return
  try {
    const formData = new FormData()
    formData.append('designation', documentToUpdate.value.designation || '')
    
    let fileToUpload = selectedFile.value
    
    // If multiple images are selected, convert them to PDF
    if (multipleImages.value.length > 0 && !selectedFile.value) {
      fileToUpload = await convertImagesToPdf()
    }
    
    if (fileToUpload) {
      formData.append('fichier', fileToUpload)
    }
    
    await axiosInstance.put(`documents/${documentToUpdate.value.idDocument}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    await fetchDocuments()
    documentToUpdate.value = null
    selectedFile.value = null
    multipleImages.value = []
    showImageToPdfOption.value = false
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function moveDocument() {
  if (!documentToMove.value) return
  try {
    await axiosInstance.put(`documents/${documentToMove.value.idDocument}/`, {
      idTypeProduit: documentToMove.value.idTypeProduit,
      idProduit: documentToMove.value.idProduit,
      idStructure: documentToMove.value.idStructure,
      idSection: documentToMove.value.idSection,
      idSubDivisionNv_1: documentToMove.value.idSubDivisionNv_1,
      idSubDivisionNv_2: documentToMove.value.idSubDivisionNv_2,
      idSubDivisionNv_3: documentToMove.value.idSubDivisionNv_3,
      idSubDivisionNv_4: documentToMove.value.idSubDivisionNv_4
    })
    
    await fetchDocuments()
    documentToMove.value = null
  } catch (e: any) {
    alert('Erreur lors du déplacement : ' + (e?.message || 'Erreur inconnue'))
  }
}

function closeDocumentViewer() {
  if (selectedDocument.value?.fichier) {
    URL.revokeObjectURL(selectedDocument.value.fichier)
  }
  selectedDocument.value = null
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  await loadFilterOptions()
  await fetchDocuments()
})
</script>


<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
/* your previous styling and enhancements for .filter-box and new buttons */
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
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.delete-button:hover {
  background: #c82333;
}

.delete-button.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.view-button {
  padding: 5px 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.view-button:hover {
  background: #0056b3;
}

.update-button {
  padding: 5px 10px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 5px;
  font-weight: bold;
}
.update-button:hover {
  background: #138496;
}

.update-button.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.move-button {
  padding: 5px 10px;
  background: #ffc107;
  color: #212529;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 5px;
  font-weight: bold;
}
.move-button:hover {
  background: #e0a800;
}

.move-button.disabled {
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

/* Specific styles for PDF viewer modal */
.pdf-modal {
  max-width: 90vw !important;
  max-height: 90vh !important;
  width: auto !important;
  height: auto !important;
  padding: 1rem !important;
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
.filter-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin: 18px 0 24px 0;
  background: #f7fafc;
  border-radius: 8px;
  padding: 18px 16px;
  box-shadow: 0 2px 12px rgba(80, 106, 159, 0.09);
}
.filter-box select {
  padding: 8px 10px;
  border: 1px solid #b5bfd9;
  border-radius: 4px;
  min-width: 160px;
  background: #fff;
  font-size: 1rem;
}
.filter-box .primary {
  padding: 8px 16px;
  border: none;
  background-color: #3b77fa;
  color: #fff;
  border-radius: 4px;
  font-weight: 500;
  transition: 0.2s;
  box-shadow: 0 2px 8px #3b77fa22;
  margin-left: 1rem;
}
.filter-box .primary:disabled { background-color: #a3aed6; cursor: not-allowed; }
.filter-box .outline {
  padding: 8px 16px;
  border: 1.2px solid #3b77fa;
  background: #fff;
  color: #3b77fa;
  border-radius: 4px;
  font-weight: 500;
  margin-left: 0.5rem;
  box-shadow: 0 2px 8px #f0f4fa;
}
.filter-box .outline:disabled { color: #aaa; border-color: #eee; }



.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.modal-actions button {
  margin-left: 10px;
}

.file-viewer-container {
  width: 100%;
  height: auto;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 10px 0;
}

/* Enhanced Update Modal Styles */
.update-modal {
  max-width: 800px !important;
  width: 90vw !important;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196F3;
  background: white;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.btn-cancel {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-update {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-update:hover {
  background: linear-gradient(135deg, #1976D2, #1565C0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-move {
  padding: 12px 24px;
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: #212529;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-move:hover {
  background: linear-gradient(135deg, #e0a800, #d39e00);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.move-modal {
  max-width: 800px !important;
  width: 90vw !important;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.form-group input[type="file"] {
  padding: 8px;
  border: 2px dashed #e1e8ed;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
}

.form-group input[type="file"]:hover {
  border-color: #2196F3;
  background: white;
}

.form-group small {
  color: #28a745;
  font-weight: 500;
  margin-top: 5px;
  display: block;
}

.current-file-info {
  padding: 8px 12px;
  background: #e8f5e8;
  border: 1px solid #28a745;
  border-radius: 4px;
  color: #155724;
  font-weight: 500;
}

.no-file-info {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #6c757d;
  font-style: italic;
}

.file-info {
  margin-top: 0.5em;
  display: flex;
  align-items: center;
  gap: 1em;
  color: #28a745;
  font-weight: 500;
}

.remove-file {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.8em;
}

.remove-file:hover {
  background: #c82333;
}

.images-preview {
  margin-top: 1em;
  padding: 1em;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  border: 1px solid #2196F3;
}

.images-preview h4 {
  color: #2196F3;
  margin-bottom: 0.5em;
  font-size: 1rem;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.image-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #2c3e50;
}

.remove-image {
  background: #E53935;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-image:hover {
  background: #d32f2f;
}

/* Responsive design */
@media (max-width: 768px) {
  .update-modal {
    width: 95vw !important;
    margin: 10px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-header h2 {
    font-size: 1.2rem;
  }
}
</style>