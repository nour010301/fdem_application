<template>
  <div class="page-wrapper">
    <h1>Documents</h1>

    <!-- Main Layout: Filters Left, Statistics Right -->
    <div class="main-layout">
      <!-- Left Side: Filters -->
      <div class="filters-section">
        <h2>Filtres</h2>
        <div class="filter-box">
          <select v-model="selectedTypeProduit" @change="onTypeProduitChange" :disabled="loadingFilters">
            <option value="">Type Produit</option>
            <option v-for="type in typesProduit" :key="type.idTypeProduit" :value="type.idTypeProduit">
              {{ type.designation }}
            </option>
          </select>
          <select v-model="selectedProduit" @change="onProduitChange" :disabled="loadingFilters || !selectedTypeProduit || !filteredProduits.length">
            <option value="">Produit</option>
            <option v-for="prod in filteredProduits" :key="prod.idProduit" :value="prod.idProduit">
              {{ prod.designation }}
            </option>
          </select>
          <select v-model="selectedStructure" @change="onStructureChange" :disabled="loadingFilters || !selectedProduit">
            <option value="">Structure</option>
            <option v-for="str in structures" :key="str.idStructure" :value="str.idStructure">
              {{ str.designation || str.nom }}
            </option>
          </select>
          <select v-model="selectedSection" @change="onSectionChange" :disabled="loadingFilters || !selectedStructure">
            <option value="">Section</option>
            <option v-for="s in sections" :key="s.idSectionProduit" :value="s.idSectionProduit">
              {{ s.designation }}
            </option>
          </select>
          <select v-model="selectedSubdivision1" @change="onSubdivision1Change" :disabled="loadingFilters || !selectedSection">
            <option value="">Subdivision 1</option>
            <option v-for="sub1 in subdivisions1" :key="sub1.idSubDivisionNv_1" :value="sub1.idSubDivisionNv_1">
              {{ sub1.nom }}
            </option>
          </select>
          <select v-model="selectedSubdivision2" @change="onSubdivision2Change" :disabled="loadingFilters || !selectedSubdivision1 || !filteredSubdivisions2.length">
            <option value="">Subdivision 2</option>
            <option v-for="sub2 in filteredSubdivisions2" :key="sub2.idSubDivisionNv_2.idSubDivisionNv_2" :value="sub2.idSubDivisionNv_2.idSubDivisionNv_2">
              {{ sub2.idSubDivisionNv_2.nom }}
            </option>
          </select>
          <select v-model="selectedSubdivision3" @change="onSubdivision3Change" :disabled="loadingFilters || !selectedSubdivision2 || !filteredSubdivisions3.length">
            <option value="">Subdivision 3</option>
            <option v-for="sub3 in filteredSubdivisions3" :key="sub3.idSubDivisionNv_3.idSubDivisionNv_3" :value="sub3.idSubDivisionNv_3.idSubDivisionNv_3">
              {{ sub3.idSubDivisionNv_3.nom }}
            </option>
          </select>
          
          <select v-if="canSeeValidationStats" v-model="selectedValidation" :disabled="loadingFilters">
            <option value="">Validation</option>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>

          <div class="filter-buttons">
            <button class="primary" @click="applyFilters" :disabled="loading || loadingConsulter">{{ loading ? "Filtrage..." : "Filtrer" }}</button>
            <button class="outline" @click="resetFilters" :disabled="loading || loadingConsulter">Annuler le filtre</button>
          </div>
        </div>
      </div>

      <!-- Right Side: Statistics -->
      <div class="statistics-section">
        <h2>Statistiques</h2>
        <div v-if="loadingStats" class="stats-loading">
          <div class="loading-spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
        <div v-else-if="statsError" class="stats-error">
          <p>Erreur lors du chargement des statistiques</p>
        </div>
        <div v-else class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">📄</div>
            <div class="stat-content">
              <h3>Total Documents</h3>
              <p class="stat-number">{{ statistics?.documents || 0 }}</p>
            </div>
          </div>
          <div v-if="userStore.userRole.value === userStore.ROLES.MISE_A_JOUR || userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide" class="stat-card valid">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>Documents Valides</h3>
              <p class="stat-number">{{ statistics?.['Documents valides'] || 0 }}</p>
            </div>
          </div>
          <div v-if="userStore.userRole.value === userStore.ROLES.MISE_A_JOUR || userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide" class="stat-card invalid">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <h3>Documents Non Valides</h3>
              <p class="stat-number">{{ statistics?.['Documents non valides'] || 0 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un document..."
        class="search-input"
      />
      <!-- <button 
        @click="redirectToAddDocument" 
        class="add-button"
        :class="{ 'disabled': !canAddDocuments || loadingConsulter }"
        :disabled="!canAddDocuments || loadingConsulter"
      >
        + Ajouter
      </button> -->
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filtersApplied && filteredDocuments.length > 0" class="product-table">
        <thead>
        <tr>
          <th @click="toggleSort('idDocument')" class="sortable">
            ID
            <span v-if="sortColumn === 'idDocument'">{{ sortAsc ? '▲' : '▼' }}</span>
          </th>
          <th>Description</th>
          <th>Type Produit</th>
          <th>Produit</th>
          <th>Structure</th>
          <th>Section</th>
          <th>Subdivision 1</th>
          <th>Subdivision 2</th>
          <th>Subdivision 3</th>
          <th v-if="canSeeCreatedBy">Créé par</th>
          <th>Fichier</th>
          <th>Plan</th>
          <th>Vidéo</th>
          <th>Photos</th>
          <th v-if="userStore.userRole.value === userStore.ROLES.MISE_A_JOUR || userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">Validation</th>
          <!-- <th>Actions</th> -->
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
            <td v-if="canSeeCreatedBy">{{ document.creerParUsername || '—' }}</td>
            <td>
              <div v-if="document.nomFichier" class="document-actions">
                <button @click="viewDocument(document, 'fichier')" class="file-btn" :disabled="loadingConsulter" title="Consulter">
                  <span v-if="loadingConsulter && loadingDocumentId === document.idDocument">...</span>
                  <span v-else>Consulter</span>
                </button>
                <button v-if="loadingConsulter && loadingDocumentId === document.idDocument" @click="cancelDocumentView(document.idDocument)" class="cancel-doc-btn" title="Annuler">
                  ✕
                </button>
              </div>
              <span v-else class="no-file">—</span>
            </td>
             <td>
              <button v-if="document.plan" @click="downloadPlan(document)" class="file-btn" :disabled="!canDownloadPlan" title="Télécharger plan">
                Télécharger
              </button>
              <span v-else class="no-file">—</span>
            </td>
            <td>
              <div v-if="document.video" class="document-actions">
                <button @click="viewDocument(document, 'video')" class="file-btn" :disabled="loadingConsulter" title="Voir vidéo">
                  <span v-if="loadingConsulter && loadingDocumentId === document.idDocument">...</span>
                  <span v-else>Voir vidéo</span>
                </button>
                <button v-if="loadingConsulter && loadingDocumentId === document.idDocument" @click="cancelDocumentView(document.idDocument)" class="cancel-doc-btn" title="Annuler">
                  ✕
                </button>
              </div>
              <span v-else class="no-file">—</span>
            </td>
            <td>
              <div v-if="document.nomPhotos" class="document-actions">
                <button @click="viewDocument(document, 'photos')" class="file-btn" :disabled="loadingConsulter" title="Voir photos">
                  <span v-if="loadingConsulter && loadingDocumentId === document.idDocument">...</span>
                  <span v-else>🖼️ Voir</span>
                </button>
                <button v-if="loadingConsulter && loadingDocumentId === document.idDocument" @click="cancelDocumentView(document.idDocument)" class="cancel-doc-btn" title="Annuler">
                  ✕
                </button>
              </div>
              <span v-else class="no-file">—</span>
            </td>
            <td v-if="userStore.userRole.value === userStore.ROLES.MISE_A_JOUR || userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">
              <span v-if="document.valide === true" class="valide-status valid">Oui</span>
              <div v-else-if="userStore.user.value?.valide" class="validation-actions">
                <span class="valide-status invalid">Non</span>
                <button 
                  @click="confirmValidation(document)" 
                  class="import-btn"
                  title="Valider ce document"
                >
                  Valider
                </button>
              </div>
              <span v-else class="valide-status invalid">Non</span>
            </td>
            <!-- <td class="action-buttons">
              <button 
                v-if="canDeleteDocuments" 
                class="action-btn delete-btn" 
                @click="confirmDelete(document)" 
                title="Supprimer"
              >
                🗑️
              </button>
              <button class="action-btn update-btn" @click="confirmUpdate(document)" :disabled="!canAddDocuments" title="Modifier">
                ✎
              </button>
              <button class="action-btn move-btn" @click="confirmMove(document)" :disabled="!canAddDocuments" title="Déplacer">
                ↗
              </button>
            </td> -->
          </tr>
        </tbody>
      </table>
      <div v-else-if="filtersApplied" class="no-result">Aucun résultat trouvé.</div>
      <div v-else class="no-result">Veuillez utiliser les filtres pour afficher les documents.</div>
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

    <!-- VALIDATION CONFIRMATION MODAL -->
    <div v-if="documentToValidate" class="modal-overlay">
      <div class="modal validation-modal">
        <div class="modal-header">
          <h2><i class="fas fa-check-circle"></i> Validation du document</h2>
          <button @click="documentToValidate = null" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="validation-info">
            <div class="document-details">
              <h3>Informations du document</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">ID:</span>
                  <span class="value">{{ documentToValidate.idDocument }}</span>
                </div>
                <div class="detail-item" v-if="documentToValidate.designation">
                  <span class="label">Description:</span>
                  <span class="value">{{ documentToValidate.designation }}</span>
                </div>
                <div class="detail-item" v-if="documentToValidate.typeProduitDesignation">
                  <span class="label">Type Produit:</span>
                  <span class="value">{{ documentToValidate.typeProduitDesignation }}</span>
                </div>
                <div class="detail-item" v-if="documentToValidate.produitDesignation">
                  <span class="label">Produit:</span>
                  <span class="value">{{ documentToValidate.produitDesignation }}</span>
                </div>
                <div class="detail-item" v-if="documentToValidate.structureNom">
                  <span class="label">Structure:</span>
                  <span class="value">{{ documentToValidate.structureNom }}</span>
                </div>
              </div>
            </div>
            
            <div class="confirmation-message">
              <i class="fas fa-question-circle"></i>
              <p>Êtes-vous sûr de vouloir valider ce document ?</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="documentToValidate = null" class="btn-cancel">Annuler</button>
          <button @click="validateDocument" class="btn-validate"><i class="fas fa-check"></i> Valider</button>
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
              <select v-model="documentToMove.idProduit" @change="onMoveProduitChange">
                <option value="">Sélectionner un produit</option>
                <option v-for="prod in filteredMoveProduits" :key="prod.idProduit" :value="prod.idProduit">
                  {{ prod.designation }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Structure</label>
              <select v-model="documentToMove.idStructure" @change="onMoveStructureChange" :disabled="!documentToMove.idProduit || !filteredMoveStructures.length">
                <option value="">Sélectionner une structure</option>
                <option v-for="str in filteredMoveStructures" :key="str.idStructure" :value="str.idStructure">
                  {{ str.designation || str.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Section</label>
              <select v-model="documentToMove.idSection" @change="onMoveSectionChange" :disabled="!documentToMove.idStructure || !filteredMoveSections.length">
                <option value="">Sélectionner une section</option>
                <option v-for="s in filteredMoveSections" :key="s.idSectionProduit" :value="s.idSectionProduit">
                  {{ s.designation }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 1</label>
              <select v-model="documentToMove.idSubDivisionNv_1" @change="onMoveSubdivision1Change">
                <option value="">Sélectionner subdivision 1</option>
                <option v-for="sub1 in filteredMoveSubdivisions1" :key="sub1.idSubDivisionNv_1" :value="sub1.idSubDivisionNv_1">
                  {{ sub1.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 2</label>
              <select v-model="documentToMove.idSubDivisionNv_2" @change="onMoveSubdivision2Change">
                <option value="">Sélectionner subdivision 2</option>
                <option v-for="sub2 in filteredMoveSubdivisions2" :key="sub2.idSubDivisionNv_2" :value="sub2.idSubDivisionNv_2">
                  {{ sub2.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 3</label>
              <select v-model="documentToMove.idSubDivisionNv_3" @change="onMoveSubdivision3Change">
                <option value="">Sélectionner subdivision 3</option>
                <option v-for="sub3 in filteredMoveSubdivisions3" :key="sub3.idSubDivisionNv_3" :value="sub3.idSubDivisionNv_3">
                  {{ sub3.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 4</label>
              <select v-model="documentToMove.idSubDivisionNv_4">
                <option value="">Sélectionner subdivision 4</option>
                <option v-for="sub4 in filteredMoveSubdivisions4" :key="sub4.idSubDivisionNv_4" :value="sub4.idSubDivisionNv_4">
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
          <!-- PDF Viewer -->
          <PdfViewer
            v-if="selectedDocument.fichier && getFileType(selectedDocument) === 'pdf'"
            :pdfUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idDocument"
            @download="handleDownloadAction"
            @print="handlePrintAction"
          />
          
          <!-- Image Viewer -->
          <ImageViewer
            v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'image'"
            :imageUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idDocument"
            @download="handleDownloadAction"
            @print="handlePrintAction"
          />
          
          <!-- Video Viewer -->
          <VideoViewer
            v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'video'"
            :videoUrl="selectedDocument.fichier"
            :documentId="selectedDocument.idDocument"
            @download="handleDownloadAction"
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
// import { useRouter } from 'vue-router'
import PdfViewer from '../components/PdfViewer.vue'
import ImageViewer from '../components/ImageViewer.vue'
import VideoViewer from '../components/VideoViewer.vue'
import { useUserStore } from '../store/userStore'
import { logUserAction, LOG_ACTIONS } from '../services/logService'

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
  nomFichier?: string | null
  video?: string | null
  photos?: string | null
  nomPhotos?: string | null
  detectedType?: string
  creerPar?: number | null
  creerParUsername?: string | null
  plan?: string | null
  valide?: boolean | null
}

const documents = ref<Document[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const filtersApplied = ref(false)
const search = ref('')
const currentPage = ref(1)
const pageSize = 10
const sortColumn = ref<'idDocument' | 'typeProduitDesignation' | 'produitDesignation'>('idDocument')
const sortAsc = ref(true)
const documentToDelete = ref<Document | null>(null)
const documentToUpdate = ref<Document | null>(null)
const documentToMove = ref<Document | null>(null)
const documentToValidate = ref<Document | null>(null)
const selectedFile = ref<File | null>(null)
const multipleImages = ref<File[]>([])
const showImageToPdfOption = ref(false)
// const router = useRouter()
const selectedDocument = ref<Document | null>(null)
const loadingConsulter = ref(false)
const loadingDocumentId = ref<number | null>(null)
const documentAbortControllers = ref<Map<number, AbortController>>(new Map())

// Statistics state
const statistics = ref<any>(null)
const loadingStats = ref(false)
const statsError = ref(false)

// User store for role-based access control
const userStore = useUserStore()

// Computed property to check if user can access "ajouter" buttons
// Users with CONSULTATION profile (3) can only consult, not add
// const canAddDocuments = computed(() => {
//   return userStore.userRole.value !== userStore.ROLES.CONSULTATION
// })

// Computed property to check if user can see "Créé par" column
// Only ADMIN_INFORMATIQUE (profile 2) can see this column
const canSeeCreatedBy = computed(() => {
  return userStore.isAdminInformatique.value
})

// Computed property to check if user can download plans
// Users with plan permission or admin informatique can download plans
const canDownloadPlan = computed(() => {
  return userStore.user.value?.profil === 2 || userStore.user.value?.plan || false
})

// Computed property to check if user can see validation statistics
// Same condition as validation column in table
const canSeeValidationStats = computed(() => {
  return userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide
})

// Computed property to check if user can delete documents
// Only users with suppression permission can delete documents
// const canDeleteDocuments = computed(() => {
//   return userStore.user.value?.suppression || false
// })



// --- Filters State ---
const typesProduit = ref<any[]>([])
const produits = ref<any[]>([])
const sections = ref<any[]>([])
const structures = ref<any[]>([])
const subdivisions1 = ref<any[]>([])
const subdivisions2 = ref<any[]>([])
const subdivisions3 = ref<any[]>([])
const subdivisions4 = ref<any[]>([])
const allSubDivs1Et2 = ref<any[]>([])
const allSubDivs2Et3 = ref<any[]>([])
const allSubDivs3Et4 = ref<any[]>([])


const selectedTypeProduit = ref<string | number | "">("")
const selectedProduit = ref<string | number | "">("")
const selectedSection = ref<string | number | "">("")
const selectedStructure = ref<string | number | "">("")
const selectedSubdivision1 = ref<string | number | "">("")
const selectedSubdivision2 = ref<string | number | "">("")
const selectedSubdivision3 = ref<string | number | "">("")
const selectedSubdivision4 = ref<string | number | "">("")
const selectedDocumentType = ref<string | number | "">("")
const selectedValidation = ref<string | "">("")

const loadingFilters = ref(false)

// --- Filter Fetch Helpers ---
async function loadFilterOptions() {
  loadingFilters.value = true
  try {
    const [typesRes, structuresRes, subDivsRes, subDivs3Res, subDivs4Res] = await Promise.all([
      axiosInstance.get('types/'),
      axiosInstance.get('structures/'),
      axiosInstance.get('subdiv1et2/'),
      axiosInstance.get('subdiv2et3/'),
      axiosInstance.get('subdiv3et4/')
    ]);
    typesProduit.value = typesRes.data;
    structures.value = structuresRes.data;
    allSubDivs1Et2.value = subDivsRes.data;
    allSubDivs2Et3.value = subDivs3Res.data;
    allSubDivs3Et4.value = subDivs4Res.data;
  } catch (error) {
    console.error('Error loading filter options:', error);
  } finally {
    loadingFilters.value = false;
  }
}

// Computed properties for cascading filters
const filteredProduits = computed(() => {
  if (!selectedTypeProduit.value) return produits.value
  return produits.value.filter(prod => prod.idTypeProduit == selectedTypeProduit.value)
})

const filteredSubdivisions2 = computed(() => {
  if (!selectedSubdivision1.value) return []
  return allSubDivs1Et2.value.filter(
    item => item.idSubDivisionNv_1.idSubDivisionNv_1 === selectedSubdivision1.value
  )
})

const filteredSubdivisions3 = computed(() => {
  if (!selectedSubdivision2.value) return []
  return allSubDivs2Et3.value.filter(
    item => item.idSubDivisionNv_2.idSubDivisionNv_2 === selectedSubdivision2.value
  )
})

// Cascading filter change handlers
async function onTypeProduitChange() {
  selectedProduit.value = ""
  selectedSection.value = ""
  selectedStructure.value = ""
  selectedSubdivision1.value = ""
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
  
  produits.value = []
  sections.value = []
  subdivisions1.value = []
  
  // Clear right-side content and reset states
  clearRightSideContent()
  
  if (selectedTypeProduit.value) {
    try {
      const [produitsRes, sectionsRes] = await Promise.all([
        axiosInstance.get(`produits/by-type/${selectedTypeProduit.value}/`),
        axiosInstance.get(`sections/by-type/${selectedTypeProduit.value}/`)
      ])
      produits.value = produitsRes.data
      sections.value = sectionsRes.data
    } catch (error) {
      console.error('Error loading produits/sections:', error)
    }
  }
}

function onProduitChange() {
  selectedStructure.value = ""
  selectedSection.value = ""
  selectedSubdivision1.value = ""
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
  
  // Clear right-side content and reset states
  clearRightSideContent()
}

async function onStructureChange() {
  selectedSection.value = ""
  selectedSubdivision1.value = ""
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
  
  subdivisions1.value = []
  
  // Clear right-side content and reset states
  clearRightSideContent()
  
  if (selectedStructure.value) {
    try {
      const res = await axiosInstance.get(`subdivision-nv1/by-structure/${selectedStructure.value}/`)
      subdivisions1.value = res.data
    } catch (error) {
      console.error('Error loading subdivisions1:', error)
    }
  }
}

function onSectionChange() {
  selectedSubdivision1.value = ""
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
  
  // Clear right-side content and reset states
  clearRightSideContent()
}

function onSubdivision1Change() {
  selectedSubdivision2.value = ""
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
  
  // Clear right-side content and reset states
  clearRightSideContent()
}

function onSubdivision2Change() {
  selectedSubdivision3.value = ""
  selectedSubdivision4.value = ""
  
  // Clear right-side content and reset states
  clearRightSideContent()
}

function onSubdivision3Change() {
  selectedSubdivision4.value = ""
  
  // Clear right-side content and reset states
  clearRightSideContent()
}



// --- Filtering Documents ---
async function applyFilters() {
  loading.value = true
  error.value = null
  filtersApplied.value = true
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
    if (selectedValidation.value !== "") params.valide = selectedValidation.value;

    const response = await axiosInstance.get('documentsFilter/', { params });
    // Handle case where API returns {message: "Aucun document trouvé."} instead of empty array
    documents.value = Array.isArray(response.data) ? response.data : [];
    currentPage.value = 1;
  } catch (e: any) {
    error.value = e?.message || "Erreur lors du filtrage"
    documents.value = []; // Ensure documents is always an array
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
  selectedDocumentType.value = ""
  selectedValidation.value = ""
  filtersApplied.value = false
  documents.value = []
  
  // Clear right-side content and reset states
  clearRightSideContent()
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
  let filtered = documents.value;
  
  // Apply validation filter for users with profile ID 3 (CONSULTATION) who don't have validation permission
  // Profile ID 4 (MISE_A_JOUR) can see all documents regardless of validation status
  if (userStore.userRole.value === userStore.ROLES.CONSULTATION && !userStore.user.value?.valide) {
    filtered = filtered.filter(doc => doc.valide === true);
  }
  // Apply search filter
  const s = search.value.trim().toLowerCase();
  if (s) {
    filtered = filtered.filter((doc) => {
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
    });
  }
  
  // Apply sorting
  return filtered.sort((a, b) => {
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
//  function confirmDelete(document: Document) { documentToDelete.value = document }
async function deleteDocument() {
  if (!documentToDelete.value) return
  try {
    // Log the delete action
    await logUserAction(documentToDelete.value.idDocument, LOG_ACTIONS.DELETE)
    
    await axiosInstance.delete(`documents/${documentToDelete.value.idDocument}/`)
    documents.value = documents.value.filter(d => d.idDocument !== documentToDelete.value!.idDocument)
    documentToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}
// Toast notification system
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const toasts = ref<Toast[]>([])
let toastId = 0

function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast: Toast = {
    id: ++toastId,
    message,
    type
  }
  toasts.value.push(toast)
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    removeToast(toast.id)
  }, 4000)
}

function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// function redirectToAddDocument() { router.push('/add-document') }
async function viewDocument(document: Document, fileType: 'fichier' | 'video' | 'photos' = 'fichier') {
  loadingConsulter.value = true
  loadingDocumentId.value = document.idDocument
  showToast('Veuillez patienter, le document se charge...', 'success')
  // Log the consult action
  await logUserAction(document.idDocument, LOG_ACTIONS.CONSULT_FILE)
  
  // Create abort controller for this document
  const abortController = new AbortController()
  documentAbortControllers.value.set(document.idDocument, abortController)
  
  try {
    if (fileType === 'video' && document.video) {
      // For video, use the direct URL from API response
      selectedDocument.value = {
        ...document,
        fichier: document.video,
        detectedType: 'video'
      }
    } else if (fileType === 'photos') {
      // For photos, use the view-photos endpoint
      const response = await axiosInstance.get(`documents/view-photos/${document.idDocument}/`, {
        signal: abortController.signal,
        responseType: 'blob'
      })
      
      if (response.status === 200) {
        const blob = response.data
        const fileUrl = URL.createObjectURL(blob)
        
        selectedDocument.value = {
          ...document,
          fichier: fileUrl,
          detectedType: 'pdf'
        }
      }
    } else {
      // For fichier, use the view-file endpoint
      const response = await fetch(`http://10.10.150.75:8000/api/documents/view-file/${document.idDocument}/`, {
        signal: abortController.signal
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const fileUrl = URL.createObjectURL(blob)
        
        // Detect file type from blob content-type
        let detectedType = 'pdf'
        if (blob.type.startsWith('image/')) {
          detectedType = 'image'
        }
        
        selectedDocument.value = {
          ...document,
          fichier: fileUrl,
          detectedType: detectedType
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Document loading cancelled')
    } else {
      console.error('Error loading document:', error)
      alert('Erreur lors du chargement du document')
    }
  } finally {
    loadingConsulter.value = false
    loadingDocumentId.value = null
    documentAbortControllers.value.delete(document.idDocument)
  }
}

function cancelDocumentView(documentId: number) {
  const controller = documentAbortControllers.value.get(documentId)
  if (controller) {
    controller.abort()
    documentAbortControllers.value.delete(documentId)
    loadingConsulter.value = false
    loadingDocumentId.value = null
  }
}

// function confirmUpdate(document: Document) {
//   documentToUpdate.value = { ...document }
//   selectedFile.value = null
//   multipleImages.value = []
//   showImageToPdfOption.value = false
// }

function getFileName(filePath: string): string {
  if (!filePath) return 'Aucun fichier'
  return filePath.split('/').pop() || filePath
}

// function confirmMove(document: Document) {
//   documentToMove.value = { 
//     ...document,
//     // Ensure all subdivision properties exist
//     idSubDivisionNv_1: document.idSubDivisionNv_1 || null,
//     idSubDivisionNv_2: document.idSubDivisionNv_2 || null,
//     idSubDivisionNv_3: document.idSubDivisionNv_3 || null,
//     idSubDivisionNv_4: document.idSubDivisionNv_4 || null
//   }
//   console.log('Initialized documentToMove:', documentToMove.value)
// }

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

// Computed properties for move modal cascading filters
const filteredMoveProduits = computed(() => {
  if (!documentToMove.value?.idTypeProduit) return produits.value
  return produits.value.filter(prod => prod.idTypeProduit == documentToMove.value?.idTypeProduit)
})

const filteredMoveStructures = computed(() => {
  if (!documentToMove.value?.idProduit) return structures.value
  return structures.value.filter(str => str.idProduit == documentToMove.value?.idProduit)
})

const filteredMoveSections = computed(() => {
  if (!documentToMove.value?.idStructure) return sections.value
  return sections.value.filter(sec => sec.idStructure == documentToMove.value?.idStructure)
})

const filteredMoveSubdivisions1 = computed(() => {
  if (!documentToMove.value?.idSection) return subdivisions1.value
  return subdivisions1.value.filter(sub => sub.idSectionProduit == documentToMove.value?.idSection)
})

const filteredMoveSubdivisions2 = computed(() => {
  if (!documentToMove.value?.idSubDivisionNv_1) return subdivisions2.value
  return subdivisions2.value.filter(sub => sub.idSubDivisionNv_1 == documentToMove.value?.idSubDivisionNv_1)
})

const filteredMoveSubdivisions3 = computed(() => {
  if (!documentToMove.value?.idSubDivisionNv_2) return subdivisions3.value
  return subdivisions3.value.filter(sub => sub.idSubDivisionNv_2 == documentToMove.value?.idSubDivisionNv_2)
})

const filteredMoveSubdivisions4 = computed(() => {
  if (!documentToMove.value?.idSubDivisionNv_3) return subdivisions4.value
  return subdivisions4.value.filter(sub => sub.idSubDivisionNv_3 == documentToMove.value?.idSubDivisionNv_3)
})

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

function onMoveProduitChange() {
  if (documentToMove.value) {
    documentToMove.value.idStructure = null
    documentToMove.value.idSection = null
    documentToMove.value.idSubDivisionNv_1 = null
    documentToMove.value.idSubDivisionNv_2 = null
    documentToMove.value.idSubDivisionNv_3 = null
    documentToMove.value.idSubDivisionNv_4 = null
  }
}

function onMoveStructureChange() {
  if (documentToMove.value) {
    documentToMove.value.idSection = null
    documentToMove.value.idSubDivisionNv_1 = null
    documentToMove.value.idSubDivisionNv_2 = null
    documentToMove.value.idSubDivisionNv_3 = null
    documentToMove.value.idSubDivisionNv_4 = null
  }
}

function onMoveSectionChange() {
  if (documentToMove.value) {
    documentToMove.value.idSubDivisionNv_1 = null
    documentToMove.value.idSubDivisionNv_2 = null
    documentToMove.value.idSubDivisionNv_3 = null
    documentToMove.value.idSubDivisionNv_4 = null
  }
}

function onMoveSubdivision1Change() {
  if (documentToMove.value) {
    documentToMove.value.idSubDivisionNv_2 = null
    documentToMove.value.idSubDivisionNv_3 = null
    documentToMove.value.idSubDivisionNv_4 = null
  }
}

function onMoveSubdivision2Change() {
  if (documentToMove.value) {
    documentToMove.value.idSubDivisionNv_3 = null
    documentToMove.value.idSubDivisionNv_4 = null
  }
}

function onMoveSubdivision3Change() {
  if (documentToMove.value) {
    documentToMove.value.idSubDivisionNv_4 = null
  }
}

async function updateDocument() {
  if (!documentToUpdate.value) return
  try {
    // Update designation if changed
    if (documentToUpdate.value.designation !== undefined) {
      const designationData = new FormData()
      designationData.append('designation', documentToUpdate.value.designation || '')
      
      await axiosInstance.put(`documents/${documentToUpdate.value.idDocument}/`, designationData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    
    // Upload file if selected
    let fileToUpload = selectedFile.value
    
    // If multiple images are selected, convert them to PDF
    if (multipleImages.value.length > 0 && !selectedFile.value) {
      fileToUpload = await convertImagesToPdf()
    }
    
    if (fileToUpload) {
      const fileData = new FormData()
      fileData.append('fichier', fileToUpload)
      
      await axiosInstance.post(`documents/${documentToUpdate.value.idDocument}/upload-file/`, fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    
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
    console.log('Document to move full object:', JSON.stringify(documentToMove.value, null, 2))
    console.log('idSubDivisionNv_4 specifically:', documentToMove.value.idSubDivisionNv_4)
    
    const formData = new FormData()
    
    // Add all fields to form data, including empty ones as empty strings
    formData.append('idTypeProduit', documentToMove.value.idTypeProduit?.toString() || '')
    formData.append('idProduit', documentToMove.value.idProduit?.toString() || '')
    formData.append('idStructure', documentToMove.value.idStructure?.toString() || '')
    formData.append('idSection', documentToMove.value.idSection?.toString() || '')
    formData.append('idSubDivisionNv_1', documentToMove.value.idSubDivisionNv_1?.toString() || '')
    formData.append('idSubDivisionNv_2', documentToMove.value.idSubDivisionNv_2?.toString() || '')
    formData.append('idSubDivisionNv_3', documentToMove.value.idSubDivisionNv_3?.toString() || '')
    formData.append('idSubDivisionNv_4', documentToMove.value.idSubDivisionNv_4?.toString() || '')
    
    // Debug: Log all form data entries
    for (let [key, value] of formData.entries()) {
      console.log(key, value)
    }
    
    await axiosInstance.post(`documents/${documentToMove.value.idDocument}/move/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    await fetchDocuments()
    documentToMove.value = null
  } catch (e: any) {
    alert('Erreur lors du déplacement : ' + (e?.message || 'Erreur inconnue'))
  }
}

function getFileType(document: any): string {
  // Use detected type if available
  if (document.detectedType) {
    return document.detectedType
  }
  
  if (!document.fichier) return 'pdf'
  
  const url = document.fichier.toLowerCase()
  if (url.includes('png') || url.includes('jpg') || url.includes('jpeg') || url.includes('gif')) return 'image'
  if (url.includes('mp4') || url.includes('mov') || url.includes('avi')) return 'video'
  return 'pdf'
}





function closeDocumentViewer() {
  if (selectedDocument.value?.fichier) {
    URL.revokeObjectURL(selectedDocument.value.fichier)
  }
  selectedDocument.value = null
}

// Validation functions
function confirmValidation(document: Document) {
  documentToValidate.value = document
}

async function validateDocument() {
  if (!documentToValidate.value) return
  try {
    await axiosInstance.put(`documents/create-two-file/${documentToValidate.value.idDocument}/`)
    
    // Update the document in the local array
    const index = documents.value.findIndex(d => d.idDocument === documentToValidate.value!.idDocument)
    if (index !== -1) {
      documents.value[index].valide = true
    }
    
    documentToValidate.value = null
  } catch (e: any) {
    alert('Erreur lors de la validation : ' + (e?.message || 'Erreur inconnue'))
  }
}

// Fetch statistics from API

async function fetchStatistics() {
  loadingStats.value = true
  statsError.value = false
  try {
    const response = await axiosInstance.get('statistics/')
    statistics.value = response.data.statistics
  } catch (error) {
    console.error('Error fetching statistics:', error)
    statsError.value = true
  } finally {
    loadingStats.value = false
  }
}


// Helper function to clear all right-side content and reset states
function clearRightSideContent() {
  // Close document viewer if open
  if (selectedDocument.value) {
    closeDocumentViewer()
  }
  
  // Clear any modals that might be open
  documentToDelete.value = null
  documentToUpdate.value = null
  documentToMove.value = null
  documentToValidate.value = null
  
  // Clear file selections
  selectedFile.value = null
  multipleImages.value = []
  showImageToPdfOption.value = false
  
  // Reset filters applied state to force re-filtering
  if (filtersApplied.value) {
    documents.value = []
  }
}

// Handle download action from viewer components
async function handleDownloadAction(documentId: number) {
  await logUserAction(documentId, LOG_ACTIONS.DOWNLOAD_FILE)
}

// Handle print action from viewer components
async function handlePrintAction(documentId: number) {
  await logUserAction(documentId, LOG_ACTIONS.PRINT_FILE)
}

// Download plan function
async function downloadPlan(doc: Document) {
  if (!doc.plan || !canDownloadPlan.value) {
    console.warn('Plan download not allowed: missing plan or insufficient permissions')
    return
  }
  
  try {
    // Log the download action
    await logUserAction(doc.idDocument, LOG_ACTIONS.DOWNLOAD_FILE)
    
    const response = await fetch(doc.plan)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `plan-${doc.idDocument}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Plan download failed:', error)
    alert('Erreur lors du téléchargement du plan')
  }
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  await loadFilterOptions()
  await fetchStatistics()
  loading.value = false
})
</script>


<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
/* your previous styling and enhancements for .filter-box and new buttons */
.page-wrapper {
  padding: 16px;
  margin-right: 20px;
}

h1 {
  font-size: 1.6rem;
  margin-bottom: 1rem;
}

/* Main Layout */
.main-layout {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.filters-section {
  flex: 3;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filters-section h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.statistics-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.statistics-section h2 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

/* Statistics Cards */
.stats-grid {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 6px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  border: 1px solid #e1e8ed;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.stat-content {
  width: 100%;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.65rem;
  font-weight: 500;
  color: #6b7280;
}

.stat-number {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-card.total {
  border-left: 3px solid #3b82f6;
}

.stat-card.valid {
  border-left: 3px solid #10b981;
}

.stat-card.invalid {
  border-left: 3px solid #ef4444;
}

/* Loading and Error States */
.stats-loading {
  text-align: center;
  padding: 1rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e1e8ed;
  border-top: 2px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stats-loading p {
  margin: 0;
  color: #6b7280;
  font-size: 0.75rem;
}

.stats-error {
  text-align: center;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.stats-error p {
  margin: 0;
  color: #dc2626;
  font-size: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filters-section,
  .statistics-section {
    flex: none;
  }
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

.view-button.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.view-button:disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
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
/* .pdf-modal {
  max-width: 95vw !important;
  max-height: 95vh !important;
  width: auto !important;
  height: auto !important;
  padding: 1rem !important;
} */
 .pdf-modal {
  max-width: 95vw;
  max-height: 95vh;
  width: fit-content;
  height: fit-content;
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
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0.5rem;
  background: white;
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  align-items: end;
}

.filter-box select {
  padding: 6px 8px;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  background: #f8f9fa;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  width: 100%;
  height: 32px;
}

.filter-box select:focus {
  outline: none;
  border-color: #3b77fa;
  background: white;
  box-shadow: 0 0 0 2px rgba(59, 119, 250, 0.1);
}

.filter-buttons {
  display: contents;
}

.filter-box .primary {
  padding: 6px 12px;
  border: none;
  background: linear-gradient(135deg, #3b77fa, #2563eb);
  color: white;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 32px;
  white-space: nowrap;
}

.filter-box .primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 119, 250, 0.3);
}

.filter-box .primary:disabled {
  background: #a3aed6;
  cursor: not-allowed;
  transform: none;
}

.filter-box .outline {
  padding: 6px 8px;
  border: 1px solid #3b77fa;
  background: white;
  color: #3b77fa;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 32px;
  white-space: nowrap;
}

.filter-box .outline:hover:not(:disabled) {
  background: #3b77fa;
  color: white;
  transform: translateY(-1px);
}

.filter-box .outline:disabled {
  color: #aaa;
  border-color: #eee;
  cursor: not-allowed;
  transform: none;
}





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
  /* overflow-y: auto; */
   overflow: auto;
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

.image-viewer, .video-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.document-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  display: block;
  margin: 0 auto 1rem auto;
}

.document-video {
  max-width: 100%;
  max-height: 80vh;
  display: block;
  margin: 0 auto 1rem auto;
}

.image-actions, .video-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  min-width: 2.5rem;
  min-height: 2.5rem;
}

.btn:hover:not(.btn-disabled) {
  background-color: #2563eb;
}

.btn-disabled {
  background-color: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.plan-download-btn {
  background-color: #ff9800 !important;
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.plan-download-btn:hover:not(.btn-disabled) {
  background-color: #f57c00 !important;
}

/* File type indicators and action buttons */
.file-indicator {
  font-size: 1.2em;
  color: #43E97B;
}

.no-file {
  color: #888;
  font-style: italic;
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

.action-buttons {
  display: flex;
  gap: 0.3em;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  background: none;
  border: 1px solid #232f4b;
  border-radius: 4px;
  padding: 0.3em 0.5em;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1px;
}

.view-btn {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.view-btn:hover:not(:disabled) {
  background: #1976d2;
  transform: scale(1.1);
}

.download-btn {
  background: #43E97B;
  color: #111;
  border-color: #43E97B;
}

.download-btn:hover:not(:disabled) {
  background: #3bc96a;
  transform: scale(1.1);
}

.delete-btn {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
  transform: scale(1.1);
}

.update-btn {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.update-btn:hover:not(:disabled) {
  background: #138496;
  transform: scale(1.1);
}

.move-btn {
  background: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

.move-btn:hover:not(:disabled) {
  background: #e0a800;
  transform: scale(1.1);
}

.action-btn:disabled {
  background: #888 !important;
  color: #ccc !important;
  cursor: not-allowed !important;
  opacity: 0.6;
  transform: none !important;
}

.document-actions {
  display: flex;
  gap: 0.3em;
  align-items: center;
}

.cancel-doc-btn {
  background: #E53935 !important;
  color: white !important;
  border-color: #E53935 !important;
  min-width: 28px !important;
  font-size: 0.9em;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-doc-btn:hover {
  background: #d32f2f !important;
  transform: scale(1.1);
}

/* Validation Status Styles */
.valide-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
}

.valide-status.valid {
  min-width: 80px;
}

.valide-status.valid {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.valide-status.invalid {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);
  padding: 4px 8px;
  min-width: 80px;
}

.validation-actions .valide-status.invalid {
  padding: 2px 6px;
  min-width: auto;
}

.validation-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.import-btn {
  padding: 6px 12px;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.import-btn:hover {
  background: linear-gradient(135deg, #218838, #1e7e34);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.6);
}

.validation-modal {
  max-width: 600px !important;
  width: 90vw !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.validation-modal .modal-header {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

.validation-info {
  padding: 20px 0;
}

.document-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #2196F3;
}

.document-details h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item .label {
  font-weight: 600;
  color: #495057;
  min-width: 80px;
}

.detail-item .value {
  color: #2c3e50;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  flex: 1;
}

.confirmation-message {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #e3f2fd, #f0f8ff);
  border-radius: 8px;
  border: 1px solid #2196F3;
}

.confirmation-message i {
  font-size: 2rem;
  color: #2196F3;
  margin-bottom: 10px;
}

.confirmation-message p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
}

.btn-validate {
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

.btn-validate:hover {
  background: linear-gradient(135deg, #1976D2, #1565C0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
  .update-modal, .validation-modal {
    width: 95vw !important;
    margin: 10px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-header h2 {
    font-size: 1.2rem;
  }
}
</style>