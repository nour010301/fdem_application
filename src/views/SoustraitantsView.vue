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
      <button @click="exportCSV" class="export-button">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredSoustraitants.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('idSoustraitants')" class="sortable">
              ID
              <span v-if="sortColumn === 'idSoustraitants'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="soustraitant in paginatedSoustraitants" :key="soustraitant.idSoustraitants">
            <td>{{ soustraitant.idSoustraitants }}</td>
            <td>{{ soustraitant.designationStt }}</td>
            <td>{{ soustraitant.description || '—' }}</td>
            <td>{{ soustraitant.adresse || '—' }}</td>
            <td>{{ soustraitant.telephone || '—' }}</td>
            <td>{{ soustraitant.email || '—' }}</td>
            <td>
              <button class="delete-button" @click="confirmDelete(soustraitant)">Supprimer</button>
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
        <input v-model="newSoustraitant.designationStt" placeholder="Désignation" />
        <textarea v-model="newSoustraitant.description" placeholder="Description (optionnelle)" />
        <input v-model="newSoustraitant.adresse" placeholder="Adresse" />
        <input v-model="newSoustraitant.telephone" placeholder="Téléphone" />
        <input v-model="newSoustraitant.email" placeholder="Email" />
        <div class="modal-actions">
          <button @click="addSoustraitant">Ajouter</button>
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
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'

interface Soustraitant {
  idSoustraitants: number
  designationStt: string
  description: string
  adresse: string
  telephone: string
  email: string
}

const soustraitants = ref<Soustraitant[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'idSoustraitants' | 'designationStt' | 'description' | 'adresse' | 'telephone' | 'email'>('idSoustraitants')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newSoustraitant = ref({ designationStt: '', description: '', adresse: '', telephone: '', email: '' })
const soustraitantToDelete = ref<Soustraitant | null>(null)

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
    const fieldA = a[sortColumn.value] ?? ''
    const fieldB = b[sortColumn.value] ?? ''

    if (fieldA < fieldB) return sortAsc.value ? -1 : 1
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1
    return 0
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
    const response = await axiosInstance.get('Soustraitants/')
    soustraitants.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addSoustraitant() {
  try {
    const res = await axiosInstance.post('Soustraitants/', newSoustraitant.value)
    soustraitants.value.push(res.data)
    showAddPopup.value = false
    newSoustraitant.value = { designationStt: '', description: '', adresse: '', telephone: '', email: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(soustraitant: Soustraitant) {
  soustraitantToDelete.value = soustraitant
}

async function deleteSoustraitant() {
  if (!soustraitantToDelete.value) return
  try {
    await axiosInstance.delete(`Soustraitants/${soustraitantToDelete.value.idSoustraitants}/`)
    soustraitants.value = soustraitants.value.filter(s => s.idSoustraitants !== soustraitantToDelete.value!.idSoustraitants)
    soustraitantToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function exportCSV() {
  const headers = ['ID', 'Désignation', 'Description', 'Adresse', 'Téléphone', 'Email']
  const rows = filteredSoustraitants.value.map(soustraitant => [
    soustraitant.idSoustraitants,
    soustraitant.designationStt,
    soustraitant.description || '',
    soustraitant.adresse || '',
    soustraitant.telephone || '',
    soustraitant.email || ''
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

onMounted(fetchSoustraitants)
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
</style>
