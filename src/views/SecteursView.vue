<template>
  <div class="page-wrapper">
    <h1>Secteurs d'Activités</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un secteur..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredSecteurs.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('secteur')" class="sortable">
              Secteur
              <span v-if="sortColumn === 'secteur'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('description')" class="sortable">
              Description
              <span v-if="sortColumn === 'description'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="secteur in paginatedSecteurs" :key="secteur.id">
            <td>{{ secteur.secteur }}</td>
            <td>{{ secteur.description || '—' }}</td>
            <td>
              <button class="update-button" @click="confirmUpdate(secteur)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button class="delete-button" @click="confirmDelete(secteur)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        <h2>Ajouter un Secteur d'Activité</h2>
        <div class="form-group">
          <label>Secteur *</label>
          <input 
            v-model="newSecteur.secteur" 
            placeholder="Secteur" 
            :class="{ 'error': validationErrors.secteur }"
          />
          <div v-if="validationErrors.secteur" class="error-message">{{ validationErrors.secteur }}</div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newSecteur.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddSecteur">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="secteurToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ secteurToDelete.secteur }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteSecteur">Oui, supprimer</button>
          <button @click="secteurToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="secteurToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Secteur d'Activité</h2>
        <input v-model="secteurToUpdate.secteur" placeholder="Secteur" />
        <textarea v-model="secteurToUpdate.description" placeholder="Description (optionnelle)" />
        <div class="modal-actions">
          <button @click="updateSecteur">Modifier</button>
          <button @click="secteurToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

interface Secteur {
  id: number
  secteur: string
  description: string | null
  date_suppression: string | null
}

const secteurs = ref<Secteur[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'secteur' | 'description'>('secteur')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newSecteur = ref({ secteur: '', description: '' })
const secteurToDelete = ref<Secteur | null>(null)
const secteurToUpdate = ref<Secteur | null>(null)

const validationErrors = ref({
  secteur: ''
})

const userStore = useUserStore()

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredSecteurs = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = secteurs.value.filter((secteur) =>
    secteur.secteur.toLowerCase().includes(s) ||
    (secteur.description?.toLowerCase().includes(s) ?? false)
  )

  return filtered.sort((a, b) => {
    const nameA = a.secteur.toLowerCase()
    const nameB = b.secteur.toLowerCase()
    
    if (sortColumn.value === 'secteur') {
      if (nameA < nameB) return sortAsc.value ? -1 : 1
      if (nameA > nameB) return sortAsc.value ? 1 : -1
      return 0
    } else {
      const fieldA = (a[sortColumn.value] || '').toString().toLowerCase()
      const fieldB = (b[sortColumn.value] || '').toString().toLowerCase()
      
      if (fieldA !== fieldB) {
        if (fieldA < fieldB) return sortAsc.value ? -1 : 1
        if (fieldA > fieldB) return sortAsc.value ? 1 : -1
      }
      
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    }
  })
})

const paginatedSecteurs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSecteurs.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredSecteurs.value.length / pageSize))

async function fetchSecteurs() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('secteurs/')
    secteurs.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addSecteur() {
  try {
    const res = await axiosInstance.post('secteurs/', {
      secteur: newSecteur.value.secteur,
      description: newSecteur.value.description || null
    })
    secteurs.value.push(res.data)
    showAddPopup.value = false
    newSecteur.value = { secteur: '', description: '' }
  } catch (e: any) {
    alert('Erreur lors de l\'ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(secteur: Secteur) {
  secteurToDelete.value = secteur
}

function confirmUpdate(secteur: Secteur) {
  secteurToUpdate.value = { ...secteur }
}

async function updateSecteur() {
  if (!secteurToUpdate.value) return
  try {
    await axiosInstance.put(`secteurs/${secteurToUpdate.value.id}/`, {
      secteur: secteurToUpdate.value.secteur,
      description: secteurToUpdate.value.description || null
    })
    const index = secteurs.value.findIndex(s => s.id === secteurToUpdate.value!.id)
    if (index !== -1) {
      secteurs.value[index] = { ...secteurToUpdate.value }
    }
    secteurToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteSecteur() {
  if (!secteurToDelete.value) return
  try {
    await axiosInstance.delete(`secteurs/${secteurToDelete.value.id}/`)
    secteurs.value = secteurs.value.filter(s => s.id !== secteurToDelete.value!.id)
    secteurToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function validateRequiredFields() {
  const errors = {
    secteur: ''
  }
  
  let isValid = true
  
  if (!newSecteur.value.secteur.trim()) {
    errors.secteur = 'Le secteur est requis'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

function validateAndAddSecteur() {
  if (validateRequiredFields()) {
    addSecteur()
  }
}

function exportCSV() {
  const headers = ['ID', 'Secteur', 'Description']
  const rows = filteredSecteurs.value.map(secteur => [
    secteur.id,
    secteur.secteur,
    secteur.description || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'secteurs_activites.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchSecteurs()
})
</script>

<style scoped>
.page-wrapper {
  padding: 16px;
  margin-right: 20px;
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
  max-width: 200px;
  word-wrap: break-word;
  white-space: normal;
  vertical-align: top;
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

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-group input.error,
.form-group textarea.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

.error-message {
  color: #e74c3c;
  font-size: 0.85em;
  margin-top: 0.3em;
  font-weight: 500;
}
</style>
