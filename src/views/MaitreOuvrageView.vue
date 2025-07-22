<template>
  <div class="page-wrapper">
    <h1>Maîtres d'Ouvrage</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un maître d'ouvrage..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredMaitresOuvrage.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('idMaitreOuvrage')" class="sortable">
              ID
              <span v-if="sortColumn === 'idMaitreOuvrage'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('designationMOg')" class="sortable">
              Désignation
              <span v-if="sortColumn === 'designationMOg'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('description')" class="sortable">
              Description
              <span v-if="sortColumn === 'description'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('adresse')" class="sortable">
              Adresse
              <span v-if="sortColumn === 'adresse'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('email')" class="sortable">
              Email
              <span v-if="sortColumn === 'email'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="maitreOuvrage in paginatedMaitresOuvrage" :key="maitreOuvrage.idMaitreOuvrage">
            <td>{{ maitreOuvrage.idMaitreOuvrage }}</td>
            <td>{{ maitreOuvrage.designationMOg }}</td>
            <td>{{ maitreOuvrage.description || '—' }}</td>
            <td>{{ maitreOuvrage.adresse || '—' }}</td>
            <td>{{ maitreOuvrage.email || '—' }}</td>
            <td>
              <button class="update-button" @click="confirmUpdate(maitreOuvrage)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button class="delete-button" @click="confirmDelete(maitreOuvrage)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        <h2>Ajouter un Maître d'Ouvrage</h2>
        <input v-model="newMaitreOuvrage.designationMOg" placeholder="Désignation" />
        <textarea v-model="newMaitreOuvrage.description" placeholder="Description (optionnelle)" />
        <input v-model="newMaitreOuvrage.adresse" placeholder="Adresse" />
        <input v-model="newMaitreOuvrage.email" placeholder="Email" />
        <div class="modal-actions">
          <button @click="addMaitreOuvrage">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="maitreOuvrageToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ maitreOuvrageToDelete.designationMOg }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteMaitreOuvrage">Oui, supprimer</button>
          <button @click="maitreOuvrageToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="maitreOuvrageToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Maître d'Ouvrage</h2>
        <input v-model="maitreOuvrageToUpdate.designationMOg" placeholder="Désignation" />
        <textarea v-model="maitreOuvrageToUpdate.description" placeholder="Description (optionnelle)" />
        <input v-model="maitreOuvrageToUpdate.adresse" placeholder="Adresse" />
        <input v-model="maitreOuvrageToUpdate.email" placeholder="Email" />
        <div class="modal-actions">
          <button @click="updateMaitreOuvrage">Modifier</button>
          <button @click="maitreOuvrageToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

interface MaitreOuvrage {
  idMaitreOuvrage: number
  designationMOg: string
  description: string
  adresse: string
  email: string
}

const maitresOuvrage = ref<MaitreOuvrage[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'idMaitreOuvrage' | 'designationMOg' | 'description' | 'adresse' | 'email'>('idMaitreOuvrage')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newMaitreOuvrage = ref({ designationMOg: '', description: '', adresse: '', email: '' })
const maitreOuvrageToDelete = ref<MaitreOuvrage | null>(null)
const maitreOuvrageToUpdate = ref<MaitreOuvrage | null>(null)

const userStore = useUserStore()

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredMaitresOuvrage = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = maitresOuvrage.value.filter((maitreOuvrage) =>
    maitreOuvrage.designationMOg.toLowerCase().includes(s) ||
    (maitreOuvrage.description?.toLowerCase().includes(s) ?? false) ||
    (maitreOuvrage.adresse?.toLowerCase().includes(s) ?? false) ||
    (maitreOuvrage.email?.toLowerCase().includes(s) ?? false)
  )

  return filtered.sort((a, b) => {
    const fieldA = a[sortColumn.value] ?? ''
    const fieldB = b[sortColumn.value] ?? ''

    if (fieldA < fieldB) return sortAsc.value ? -1 : 1
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1
    return 0
  })
})

const paginatedMaitresOuvrage = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMaitresOuvrage.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredMaitresOuvrage.value.length / pageSize))

async function fetchMaitresOuvrage() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('maitres-ouvrage/')
    maitresOuvrage.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addMaitreOuvrage() {
  try {
    const res = await axiosInstance.post('maitres-ouvrage/', newMaitreOuvrage.value)
    maitresOuvrage.value.push(res.data)
    showAddPopup.value = false
    newMaitreOuvrage.value = { designationMOg: '', description: '', adresse: '', email: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(maitreOuvrage: MaitreOuvrage) {
  maitreOuvrageToDelete.value = maitreOuvrage
}

function confirmUpdate(maitreOuvrage: MaitreOuvrage) {
  maitreOuvrageToUpdate.value = { ...maitreOuvrage }
}

async function updateMaitreOuvrage() {
  if (!maitreOuvrageToUpdate.value) return
  try {
    const maitreOuvrageToSend = {
      designationMOg: maitreOuvrageToUpdate.value.designationMOg,
      description: maitreOuvrageToUpdate.value.description,
      adresse: maitreOuvrageToUpdate.value.adresse,
      email: maitreOuvrageToUpdate.value.email
    }
    await axiosInstance.put(`maitres-ouvrage/${maitreOuvrageToUpdate.value.idMaitreOuvrage}/`, maitreOuvrageToSend)
    const index = maitresOuvrage.value.findIndex(m => m.idMaitreOuvrage === maitreOuvrageToUpdate.value!.idMaitreOuvrage)
    if (index !== -1) {
      maitresOuvrage.value[index] = { ...maitreOuvrageToUpdate.value }
    }
    maitreOuvrageToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteMaitreOuvrage() {
  if (!maitreOuvrageToDelete.value) return
  try {
    await axiosInstance.delete(`maitres-ouvrage/${maitreOuvrageToDelete.value.idMaitreOuvrage}/`)
    maitresOuvrage.value = maitresOuvrage.value.filter(m => m.idMaitreOuvrage !== maitreOuvrageToDelete.value!.idMaitreOuvrage)
    maitreOuvrageToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function exportCSV() {
  const headers = ['ID', 'Désignation', 'Description', 'Adresse', 'Email']
  const rows = filteredMaitresOuvrage.value.map(maitreOuvrage => [
    maitreOuvrage.idMaitreOuvrage,
    maitreOuvrage.designationMOg,
    maitreOuvrage.description || '',
    maitreOuvrage.adresse || '',
    maitreOuvrage.email || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'maitres_ouvrage.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchMaitresOuvrage()
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
