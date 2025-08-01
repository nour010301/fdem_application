<template>
  <div class="page-wrapper">
    <h1>Structures</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher une structure..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur: {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredStructures.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('idStructure')" class="sortable">
              ID
              <span v-if="sortColumn === 'idStructure'">{{ sortAsc ? '▲' : '▼' }}</span>
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
          <tr v-for="structure in paginatedStructures" :key="structure.idStructure">
            <td>{{ structure.idStructure }}</td>
            <td>{{ structure.nom }}</td>
            <td>{{ structure.designation }}</td>
            <td>
              <button class="update-button" @click="confirmUpdate(structure)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button class="delete-button" @click="confirmDelete(structure)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-result">Aucune structure trouvée.</div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1">Précédent</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">Suivant</button>
    </div>

    <!-- ADD POPUP -->
    <div v-if="showAddPopup" class="modal-overlay">
      <div class="modal">
        <h2>Ajouter une Structure</h2>
        <input v-model="newStructure.nom" placeholder="Nom" />
        <textarea v-model="newStructure.designation" placeholder="Désignation" />
        <div class="modal-actions">
          <button @click="addStructure">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="structureToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ structureToDelete.nom }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteStructure">Oui, supprimer</button>
          <button @click="structureToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="structureToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Structure</h2>
        <input v-model="structureToUpdate.nom" placeholder="Nom" />
        <textarea v-model="structureToUpdate.designation" placeholder="Désignation" />
        <div class="modal-actions">
          <button @click="updateStructure">Modifier</button>
          <button @click="structureToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

interface Structure {
  idStructure: number
  nom: string
  designation: string
}

const structures = ref<Structure[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'idStructure' | 'nom' | 'designation'>('idStructure')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newStructure = ref({ nom: '', designation: '' })
const structureToDelete = ref<Structure | null>(null)
const structureToUpdate = ref<Structure | null>(null)

const userStore = useUserStore()

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredStructures = computed(() => {
  const s = search.value.toLowerCase().trim()
  return structures.value
    .filter(struct =>
      struct.nom.toLowerCase().includes(s) ||
      struct.designation.toLowerCase().includes(s) ||
      struct.idStructure.toString().includes(s)
    )
    .sort((a, b) => {
      const fieldA = a[sortColumn.value]
      const fieldB = b[sortColumn.value]
      return sortAsc.value
        ? (fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0)
        : (fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0)
    })
})

watch(search, () => currentPage.value = 1)

const paginatedStructures = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredStructures.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredStructures.value.length / pageSize))

async function fetchStructures() {
  loading.value = true
  error.value = null
  try {
    const res = await axiosInstance.get('structures/')
    structures.value = res.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addStructure() {
  try {
    const res = await axiosInstance.post('structures/', newStructure.value)
    structures.value.push(res.data)
    showAddPopup.value = false
    newStructure.value = { nom: '', designation: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(structure: Structure) {
  structureToDelete.value = structure
}

function confirmUpdate(structure: Structure) {
  structureToUpdate.value = { ...structure }
}

async function updateStructure() {
  if (!structureToUpdate.value) return
  try {
    const structureToSend = {
      nom: structureToUpdate.value.nom,
      designation: structureToUpdate.value.designation
    }
    await axiosInstance.put(`structures/${structureToUpdate.value.idStructure}/`, structureToSend)
    const index = structures.value.findIndex(s => s.idStructure === structureToUpdate.value!.idStructure)
    if (index !== -1) {
      structures.value[index] = { ...structureToUpdate.value }
    }
    structureToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteStructure() {
  if (!structureToDelete.value) return
  try {
    await axiosInstance.delete(`structures/${structureToDelete.value.idStructure}/`)
    structures.value = structures.value.filter(s => s.idStructure !== structureToDelete.value!.idStructure)
    structureToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function exportCSV() {
  const headers = ['ID Structure', 'Nom', 'Désignation']
  const rows = filteredStructures.value.map(s => [
    s.idStructure,
    s.nom,
    s.designation
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'structures.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchStructures()
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
</style>
