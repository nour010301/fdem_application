<template>
  <div class="page-wrapper">
    <h1>Subdivisions Niveau 3</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher une subdivision..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredSubdivs.length" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('idSubDivisionNv_3')" class="sortable">
              ID
              <span v-if="sortColumn === 'idSubDivisionNv_3'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('nom')" class="sortable">
              Nom
              <span v-if="sortColumn === 'nom'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('designation')" class="sortable">
              Désignation
              <span v-if="sortColumn === 'designation'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedSubdivs" :key="item.idSubDivisionNv_3">
            <td>{{ item.idSubDivisionNv_3 }}</td>
            <td>{{ item.nom }}</td>
            <td>{{ item.designation || '—' }}</td>
            <td>
              <button class="delete-button" @click="confirmDelete(item)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-result">Aucune subdivision trouvée.</div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1">Précédent</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">Suivant</button>
    </div>

    <!-- ADD POPUP -->
    <div v-if="showAddPopup" class="modal-overlay">
      <div class="modal">
        <h2>Ajouter une Subdivision</h2>
        <input v-model="newSubdivision.nom" placeholder="Nom" />
        <textarea v-model="newSubdivision.designation" placeholder="Désignation (optionnelle)" />
        <select v-model="newSubdivision.idSubDivisionNv_2">
          <option value="" disabled>Sélectionnez une subdivision Niveau 2</option>
          <option v-for="subdiv in subdivisionsNv2" :key="subdiv.idSubDivisionNv_2" :value="subdiv.idSubDivisionNv_2">
            {{ subdiv.nom }}
          </option>
        </select>
        <div class="modal-actions">
          <button @click="addSubdivision">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="subdivisionToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ subdivisionToDelete.nom }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteSubdivision">Oui, supprimer</button>
          <button @click="subdivisionToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import axiosInstance from '../axios'

interface SubdivisionNv3 {
  idSubDivisionNv_3: number
  nom: string
  designation: string | null
  idSubDivisionNv_2: number
}

interface SubdivisionNv2 {
  idSubDivisionNv_2: number
  nom: string
  designation: string | null
  subDiv: boolean
}

const data = ref<SubdivisionNv3[]>([])
const subdivisionsNv2 = ref<SubdivisionNv2[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<keyof SubdivisionNv3>('idSubDivisionNv_3')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newSubdivision = ref({ nom: '', designation: '', idSubDivisionNv_2: null })
const subdivisionToDelete = ref<SubdivisionNv3 | null>(null)

function toggleSort(column: keyof SubdivisionNv3) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredSubdivs = computed(() => {
  const s = search.value.trim().toLowerCase()
  return data.value
    .filter(item =>
      item.nom.toLowerCase().includes(s) ||
      item.designation?.toLowerCase().includes(s)
    )
    .sort((a, b) => {
      const valA = a[sortColumn.value]
      const valB = b[sortColumn.value]
      if (valA == null || valB == null) return 0
      return sortAsc.value
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
})

watch(search, () => {
  currentPage.value = 1
})

const paginatedSubdivs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSubdivs.value.slice(start, start + pageSize)
})

const totalPages = computed(() =>
  Math.ceil(filteredSubdivs.value.length / pageSize)
)

async function fetchData() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('/api/subdivision-nv3/')
    data.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function fetchSubdivisionsNv2() {
  try {
    const response = await axiosInstance.get('/api/subdivision-nv2/')
    subdivisionsNv2.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  }
}

async function addSubdivision() {
  try {
    const res = await axiosInstance.post('/api/subdivision-nv3/', newSubdivision.value)
    data.value.push(res.data)
    showAddPopup.value = false
    newSubdivision.value = { nom: '', designation: '', idSubDivisionNv_2: null }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(subdivision: SubdivisionNv3) {
  subdivisionToDelete.value = subdivision
}

async function deleteSubdivision() {
  if (!subdivisionToDelete.value) return
  try {
    await axiosInstance.delete(`/api/subdivision-nv3/${subdivisionToDelete.value.idSubDivisionNv_3}/`)
    data.value = data.value.filter(s => s.idSubDivisionNv_3 !== subdivisionToDelete.value!.idSubDivisionNv_3)
    subdivisionToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function exportCSV() {
  const headers = ['ID', 'Nom', 'Désignation']
  const rows = filteredSubdivs.value.map(item => [
    item.idSubDivisionNv_3,
    item.nom,
    item.designation || '—'
  ])
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')
  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csvContent))
  link.setAttribute('download', 'subdivision_nv3.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchData()
  fetchSubdivisionsNv2()
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

.table-wrapper {
  overflow-x: auto;
  padding-right: 1rem; /* Adds padding *inside* the scroll area on the right */
  margin-right: 1rem;  /* Adds white space *outside* the scroll box */
  background: white;   /* Makes scroll area background white (optional) */
  border-radius: 0.5rem;
}

.product-table {
  min-width: 800px;    /* Force scroll if screen is narrower than this */
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
