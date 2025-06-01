<template>
  <div class="page-wrapper">
    <h1>Documents</h1>

    <!-- Filter Box -->
    <div class="filter-box">
      <select v-model="selectedTypeProduit" @change="fetchProduits" :disabled="loadingFilters">
        <option value="">Type Produit</option>
        <option v-for="type in typesProduit" :key="type.idTypeProduit" :value="type.idTypeProduit">
          {{ type.designation }}
        </option>
      </select>
      <select v-model="selectedProduit" :disabled="loadingFilters || !produits.length">
        <option value="">Produit</option>
        <option v-for="prod in produits" :key="prod.idProduit" :value="prod.idProduit">
          {{ prod.designation }}
        </option>
      </select>
      <select v-model="selectedSection" :disabled="loadingFilters">
        <option value="">Section</option>
        <option v-for="s in sections" :key="s.idSectionProduit" :value="s.idSectionProduit">
          {{ s.designation }}
        </option>
      </select>
      <select v-model="selectedStructure" :disabled="loadingFilters">
        <option value="">Structure</option>
        <option v-for="str in structures" :key="str.idStructure" :value="str.idStructure">
          {{ str.designation || str.nom }}
        </option>
      </select>
      <select v-model="selectedSubdivision1" :disabled="loadingFilters">
        <option value="">Subdivision 1</option>
        <option v-for="sub1 in subdivisions1" :key="sub1.idSubDivisionNv_1" :value="sub1.idSubDivisionNv_1">
          {{ sub1.nom }}
        </option>
      </select>
      <select v-model="selectedSubdivision2" :disabled="loadingFilters">
        <option value="">Subdivision 2</option>
        <option v-for="sub2 in subdivisions2" :key="sub2.idSubDivisionNv_2" :value="sub2.idSubDivisionNv_2">
          {{ sub2.nom }}
        </option>
      </select>
      <select v-model="selectedSubdivision3" :disabled="loadingFilters">
        <option value="">Subdivision 3</option>
        <option v-for="sub3 in subdivisions3" :key="sub3.idSubDivisionNv_3" :value="sub3.idSubDivisionNv_3">
          {{ sub3.nom }}
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
      <button @click="redirectToAddDocument" class="add-button">+ Ajouter</button>
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
          <!-- <th>Actions</th> -->
          <th>Consulter Doc</th>
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
            <!-- <td>
              <button class="delete-button" @click="confirmDelete(document)">Supprimer</button>
            </td> -->
            <td>
              <button class="view-button" @click="viewDocument(document)">Consulter Doc</button>
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

    <!-- PDF VIEWER MODAL -->
    <div v-if="selectedDocument" class="modal-overlay">
      <div class="modal">
        <h2>Consulter Document</h2>
        <PdfViewer :pdfUrl="`http://10.10.150.75:8000${selectedDocument.fichier_pdf}`" />
        <div class="modal-actions">
          <button @click="selectedDocument = null" class="cancel">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>



<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useRouter } from 'vue-router'
import PdfViewer from '../components/PdfViewer.vue' // Import the PdfViewer component

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
  typeProduitDesignation?: string | null
  produitDesignation?: string | null
  structureNom?: string | null
  sectionNom?: string | null
  subDivisionNv1Nom?: string | null
  subDivisionNv2Nom?: string | null
  subDivisionNv3Nom?: string | null
  designation?: string | null
  chemin?: string | null
  version?: string | null
  dateCreation?: string | null
  dateModification?: string | null
  fichier_pdf?: string | null
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
const router = useRouter()
const selectedDocument = ref<Document | null>(null)

// --- Filters State ---
const typesProduit = ref<any[]>([])
const produits = ref<any[]>([])
const sections = ref<any[]>([])
const structures = ref<any[]>([])
const subdivisions1 = ref<any[]>([])
const subdivisions2 = ref<any[]>([])
const subdivisions3 = ref<any[]>([])

const selectedTypeProduit = ref<string | number | "">("")
const selectedProduit = ref<string | number | "">("")
const selectedSection = ref<string | number | "">("")
const selectedStructure = ref<string | number | "">("")
const selectedSubdivision1 = ref<string | number | "">("")
const selectedSubdivision2 = ref<string | number | "">("")
const selectedSubdivision3 = ref<string | number | "">("")

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
    sub3Res
  ] = await Promise.all([
    axiosInstance.get('types/'),
    axiosInstance.get('produits/'),
    axiosInstance.get('sections/'),
    axiosInstance.get('structures/'),
    axiosInstance.get('subdivision-nv1/'),
    axiosInstance.get('subdivision-nv2/'),
    axiosInstance.get('subdivision-nv3/')
  ]);
  typesProduit.value = typesRes.data;
  produits.value = produitsRes.data;
  sections.value = sectionsRes.data;
  structures.value = structuresRes.data;
  subdivisions1.value = sub1Res.data;
  subdivisions2.value = sub2Res.data;
  subdivisions3.value = sub3Res.data;
  loadingFilters.value = false;
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
function viewDocument(document: Document) {
  selectedDocument.value = document
}

onMounted(async () => {
  await loadFilterOptions()
  await fetchDocuments()
})
</script>


<style scoped>
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
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.modal-actions button {
  margin-left: 10px;
}
</style>