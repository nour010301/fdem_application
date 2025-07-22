<template>
  <div class="page-wrapper">
    <h1>Sections</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher une section..."
        class="search-input"
      />
      <button 
        @click="exportCSV" 
        class="export-button"
        :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }"
        :disabled="userStore.loading.value || !userStore.canExportCSV.value"
      >
        Exporter CSV
      </button>
      <button 
        @click="showAddPopup = true" 
        class="add-button"
        :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }"
        :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value"
      >
        + Ajouter
      </button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredSections.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('idSectionProduit')" class="sortable">
              ID
              <span v-if="sortColumn === 'idSectionProduit'">{{ sortAsc ? '▲' : '▼' }}</span>
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
          <tr v-for="section in paginatedSections" :key="section.idSectionProduit">
            <td>{{ section.idSectionProduit }}</td>
            <td>{{ section.nom }}</td>
            <td>{{ section.designation }}</td>
            <td>
              <button 
                class="update-button" 
                @click="confirmUpdate(section)"
                :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }"
                :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value"
                title="Modifier"
              >
                ✎
              </button>
              <button 
                class="delete-button" 
                @click="confirmDelete(section)"
                :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }"
                :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value"
                title="Supprimer"
              >
                ✕
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

    <!-- ADD POPUP -->
    <div v-if="showAddPopup" class="modal-overlay">
      <div class="modal">
        <h2>Ajouter une Section</h2>
        <input v-model="newSection.nom" placeholder="Nom" />
        <textarea v-model="newSection.designation" placeholder="Désignation" />
        <div class="modal-actions">
          <button @click="addSection">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="sectionToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ sectionToDelete.nom }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteSection">Oui, supprimer</button>
          <button @click="sectionToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="sectionToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Section</h2>
        <input v-model="sectionToUpdate.nom" placeholder="Nom" />
        <textarea v-model="sectionToUpdate.designation" placeholder="Désignation" />
        <div class="modal-actions">
          <button @click="updateSection">Modifier</button>
          <button @click="sectionToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

interface Section {
  idSectionProduit: number
  nom: string
  designation: string
}

const sections = ref<Section[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'idSectionProduit' | 'nom' | 'designation'>('idSectionProduit')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newSection = ref({ nom: '', designation: '' })
const sectionToDelete = ref<Section | null>(null)
const sectionToUpdate = ref<Section | null>(null)

// User store for role-based access control
const userStore = useUserStore()

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredSections = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = sections.value.filter((sec) =>
    sec.nom.toLowerCase().includes(s) || sec.designation.toLowerCase().includes(s)
  )

  return filtered.sort((a, b) => {
    const fieldA = a[sortColumn.value]
    const fieldB = b[sortColumn.value]

    if (fieldA < fieldB) return sortAsc.value ? -1 : 1
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1
    return 0
  })
})

const paginatedSections = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSections.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredSections.value.length / pageSize))

async function fetchSections() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('sections/')
    sections.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addSection() {
  try {
    const res = await axiosInstance.post('sections/', newSection.value)
    sections.value.push(res.data)
    showAddPopup.value = false
    newSection.value = { nom: '', designation: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(section: Section) {
  sectionToDelete.value = section
}

function confirmUpdate(section: Section) {
  sectionToUpdate.value = { ...section }
}

async function updateSection() {
  if (!sectionToUpdate.value) return
  try {
    const sectionToSend = {
      nom: sectionToUpdate.value.nom,
      designation: sectionToUpdate.value.designation
    }
    await axiosInstance.put(`sections/${sectionToUpdate.value.idSectionProduit}/`, sectionToSend)
    const index = sections.value.findIndex(s => s.idSectionProduit === sectionToUpdate.value!.idSectionProduit)
    if (index !== -1) {
      sections.value[index] = { ...sectionToUpdate.value }
    }
    sectionToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteSection() {
  if (!sectionToDelete.value) return
  try {
    await axiosInstance.delete(`sections/${sectionToDelete.value.idSectionProduit}/`)
    sections.value = sections.value.filter(s => s.idSectionProduit !== sectionToDelete.value!.idSectionProduit)
    sectionToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function exportCSV() {
  const headers = ['ID Section', 'Nom', 'Désignation']

  const rows = filteredSections.value.map(section => [
    section.idSectionProduit,
    section.nom,
    section.designation
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';')) // use semicolon separator
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'sections.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchSections()
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
  border-radius: 8px;
  background: white;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #192850;
  color: #fff;
  box-shadow: 0 2px 12px rgba(40, 55, 71, 0.12);
}
.product-table th,
.product-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #232f4b;
  text-align: left;
}
.product-table th {
  background: #22336e;
}

.no-result {
  padding: 1rem;
  text-align: center;
  color: #999;
}

.info {
  color: #2196F3;
  font-weight: bold;
}
.error {
  color: #f44336;
  font-weight: bold;
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
