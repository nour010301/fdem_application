<template>
  <div class="page-wrapper">
    <h1>Directeurs</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un directeur..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredDirecteurs.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('idDirecteur')" class="sortable">
              ID
              <span v-if="sortColumn === 'idDirecteur'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('nomPrenomDirecteur')" class="sortable">
              Nom et Prénom
              <span v-if="sortColumn === 'nomPrenomDirecteur'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('fonction')" class="sortable">
              Fonction
              <span v-if="sortColumn === 'fonction'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('telephone')" class="sortable">
              Téléphone
              <span v-if="sortColumn === 'telephone'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="directeur in paginatedDirecteurs" :key="directeur.idDirecteur">
            <td>{{ directeur.idDirecteur }}</td>
            <td>{{ directeur.nomPrenomDirecteur }}</td>
            <td>{{ directeur.fonction || '—' }}</td>
            <td>{{ directeur.telephone || '—' }}</td>
            <td>
              <button class="delete-button" @click="confirmDelete(directeur)">Supprimer</button>
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
        <h2>Ajouter un Directeur</h2>
        <input v-model="newDirecteur.nomPrenomDirecteur" placeholder="Nom et Prénom" />
        <input v-model="newDirecteur.fonction" placeholder="Fonction" />
        <input v-model="newDirecteur.telephone" placeholder="Téléphone" />
        <div class="modal-actions">
          <button @click="addDirecteur">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="directeurToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ directeurToDelete.nomPrenomDirecteur }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteDirecteur">Oui, supprimer</button>
          <button @click="directeurToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'

interface Directeur {
  idDirecteur: number
  nomPrenomDirecteur: string
  fonction: string
  telephone: string
}

const directeurs = ref<Directeur[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'idDirecteur' | 'nomPrenomDirecteur' | 'fonction' | 'telephone'>('idDirecteur')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newDirecteur = ref({ nomPrenomDirecteur: '', fonction: '', telephone: '' })
const directeurToDelete = ref<Directeur | null>(null)

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredDirecteurs = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = directeurs.value.filter((directeur) =>
    directeur.nomPrenomDirecteur.toLowerCase().includes(s) ||
    (directeur.fonction?.toLowerCase().includes(s) ?? false) ||
    (directeur.telephone?.toLowerCase().includes(s) ?? false)
  )

  return filtered.sort((a, b) => {
    const fieldA = a[sortColumn.value] ?? ''
    const fieldB = b[sortColumn.value] ?? ''

    if (fieldA < fieldB) return sortAsc.value ? -1 : 1
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1
    return 0
  })
})

const paginatedDirecteurs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredDirecteurs.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredDirecteurs.value.length / pageSize))

async function fetchDirecteurs() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('directions-projets/')
    directeurs.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addDirecteur() {
  try {
    const res = await axiosInstance.post('directions-projets/', newDirecteur.value)
    directeurs.value.push(res.data)
    showAddPopup.value = false
    newDirecteur.value = { nomPrenomDirecteur: '', fonction: '', telephone: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(directeur: Directeur) {
  directeurToDelete.value = directeur
}

async function deleteDirecteur() {
  if (!directeurToDelete.value) return
  try {
    await axiosInstance.delete(`directions-projets/${directeurToDelete.value.idDirecteur}/`)
    directeurs.value = directeurs.value.filter(d => d.idDirecteur !== directeurToDelete.value!.idDirecteur)
    directeurToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function exportCSV() {
  const headers = ['ID', 'Nom et Prénom', 'Fonction', 'Téléphone']
  const rows = filteredDirecteurs.value.map(directeur => [
    directeur.idDirecteur,
    directeur.nomPrenomDirecteur,
    directeur.fonction || '',
    directeur.telephone || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'directeurs.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(fetchDirecteurs)
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
