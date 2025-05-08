<template>
  <div class="page-wrapper">
    <h1>Documents</h1>

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
        <thead>
          <tr>
            <th @click="toggleSort('idDocument')" class="sortable">
              ID
              <span v-if="sortColumn === 'idDocument'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Designation</th> <!-- New column for Designation -->
            <th>Type Produit</th>
            <th>Produit</th>
            <th>Structure</th>
            <th>Section</th>
            <th>Subdivision 1</th>
            <th>Subdivision 2</th>
            <th>Subdivision 3</th>
            <th>Actions</th>
            <th>Consulter Doc</th> <!-- Column for the button -->
          </tr>
        </thead>

        <tbody>
          <tr v-for="document in paginatedDocuments" :key="document.idDocument">
            <td>{{ document.idDocument }}</td>
            <td>{{ document.designation || '—' }}</td> <!-- Display Designation -->
            <td>{{ document.typeProduitDesignation || '—' }}</td>
            <td>{{ document.produitDesignation || '—' }}</td>
            <td>{{ document.structureNom || '—' }}</td>
            <td>{{ document.sectionNom || '—' }}</td>
            <td>{{ document.subDivisionNv1Nom || '—' }}</td>
            <td>{{ document.subDivisionNv2Nom || '—' }}</td>
            <td>{{ document.subDivisionNv3Nom || '—' }}</td>
            <td>
              <button class="delete-button" @click="confirmDelete(document)">Supprimer</button>
            </td>
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useRouter } from 'vue-router'

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
  designation?: string | null // Ensure designation is included
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

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredDocuments = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = documents.value.filter((doc) =>
    (doc.idDocument?.toString().includes(s) ?? false) ||
    (doc.typeProduitDesignation ?? '').toLowerCase().includes(s) ||
    (doc.produitDesignation ?? '').toLowerCase().includes(s) ||
    (doc.structureNom ?? '').toLowerCase().includes(s) ||
    (doc.sectionNom ?? '').toLowerCase().includes(s) ||
    (doc.subDivisionNv1Nom ?? '').toLowerCase().includes(s) ||
    (doc.subDivisionNv2Nom ?? '').toLowerCase().includes(s) ||
    (doc.subDivisionNv3Nom ?? '').toLowerCase().includes(s) ||
    (doc.designation ?? '').toLowerCase().includes(s) // Include designation in search
  )

  return filtered.sort((a, b) => {
    const fieldA = a[sortColumn.value] ?? ''
    const fieldB = b[sortColumn.value] ?? ''

    if (fieldA < fieldB) return sortAsc.value ? -1 : 1
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1
    return 0
  })
})

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredDocuments.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredDocuments.value.length / pageSize))

async function fetchDocuments() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('http://10.10.150.75:8000/api/documents/')
    documents.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

function confirmDelete(document: Document) {
  documentToDelete.value = document
}

async function deleteDocument() {
  if (!documentToDelete.value) return
  try {
    await axiosInstance.delete(`http://10.10.150.75:8000/api/documents/${documentToDelete.value.idDocument}/`)
    documents.value = documents.value.filter(d => d.idDocument !== documentToDelete.value!.idDocument)
    documentToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function redirectToAddDocument() {
  router.push('/add-document')
}

function viewDocument(document: Document) {
  if (document.fichier_pdf) {
    window.open(`http://10.10.150.75:8000${document.fichier_pdf}`, '_blank')
  }
}

onMounted(fetchDocuments)
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
</style>
