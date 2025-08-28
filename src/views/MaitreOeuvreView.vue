<template>
  <div class="page-wrapper">
    <h1>Maîtres d'Œuvre</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un maître d'œuvre..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredMaitresOeuvre.length > 0" class="product-table">
        <thead>
          <tr>
            <!-- <th @click="toggleSort('idMaitreOeuvre')" class="sortable">
              ID
              <span v-if="sortColumn === 'idMaitreOeuvre'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th> -->
            <th @click="toggleSort('designationMO')" class="sortable">
              Désignation
              <span v-if="sortColumn === 'designationMO'">{{ sortAsc ? '▲' : '▼' }}</span>
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
          <tr v-for="maitreOeuvre in paginatedMaitresOeuvre" :key="maitreOeuvre.idMaitreOeuvre">
            <!-- <td>{{ maitreOeuvre.idMaitreOeuvre }}</td> -->
            <td>{{ maitreOeuvre.designationMO }}</td>
            <td>{{ maitreOeuvre.description || '—' }}</td>
            <td>{{ maitreOeuvre.adresse || '—' }}</td>
            <td>{{ maitreOeuvre.email || '—' }}</td>
            <td>
              <button class="update-button" @click="confirmUpdate(maitreOeuvre)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button class="delete-button" @click="confirmDelete(maitreOeuvre)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        <h2>Ajouter un Maître d'Œuvre</h2>
        <div class="form-group">
          <label>Désignation *</label>
          <input 
            v-model="newMaitreOeuvre.designationMO" 
            placeholder="Désignation" 
            :class="{ 'error': validationErrors.designationMO }"
          />
          <div v-if="validationErrors.designationMO" class="error-message">{{ validationErrors.designationMO }}</div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newMaitreOeuvre.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="form-group">
          <label>Adresse *</label>
          <input 
            v-model="newMaitreOeuvre.adresse" 
            placeholder="Adresse" 
            :class="{ 'error': validationErrors.adresse }"
          />
          <div v-if="validationErrors.adresse" class="error-message">{{ validationErrors.adresse }}</div>
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input 
            v-model="newMaitreOeuvre.email" 
            placeholder="Email" 
            :class="{ 'error': validationErrors.email }"
          />
          <div v-if="validationErrors.email" class="error-message">{{ validationErrors.email }}</div>
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddMaitreOeuvre">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="maitreOeuvreToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ maitreOeuvreToDelete.designationMO }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteMaitreOeuvre">Oui, supprimer</button>
          <button @click="maitreOeuvreToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="maitreOeuvreToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Maître d'Œuvre</h2>
        <input v-model="maitreOeuvreToUpdate.designationMO" placeholder="Désignation" />
        <textarea v-model="maitreOeuvreToUpdate.description" placeholder="Description (optionnelle)" />
        <input v-model="maitreOeuvreToUpdate.adresse" placeholder="Adresse" />
        <input v-model="maitreOeuvreToUpdate.email" placeholder="Email" />
        <div class="modal-actions">
          <button @click="updateMaitreOeuvre">Modifier</button>
          <button @click="maitreOeuvreToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

interface MaitreOeuvre {
  idMaitreOeuvre: number
  designationMO: string
  description: string
  adresse: string
  email: string
}

const maitresOeuvre = ref<MaitreOeuvre[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'idMaitreOeuvre' | 'designationMO' | 'description' | 'adresse' | 'email'>('idMaitreOeuvre')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newMaitreOeuvre = ref({ designationMO: '', description: '', adresse: '', email: '' })
const maitreOeuvreToDelete = ref<MaitreOeuvre | null>(null)
const maitreOeuvreToUpdate = ref<MaitreOeuvre | null>(null)

// Validation errors
const validationErrors = ref({
  designationMO: '',
  adresse: '',
  email: ''
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

const filteredMaitresOeuvre = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = maitresOeuvre.value.filter((maitreOeuvre) =>
    maitreOeuvre.designationMO.toLowerCase().includes(s) ||
    (maitreOeuvre.description?.toLowerCase().includes(s) ?? false) ||
    (maitreOeuvre.adresse?.toLowerCase().includes(s) ?? false) ||
    (maitreOeuvre.email?.toLowerCase().includes(s) ?? false)
  )

  return filtered.sort((a, b) => {
    const fieldA = a[sortColumn.value] ?? ''
    const fieldB = b[sortColumn.value] ?? ''

    if (fieldA < fieldB) return sortAsc.value ? -1 : 1
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1
    return 0
  })
})

const paginatedMaitresOeuvre = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMaitresOeuvre.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredMaitresOeuvre.value.length / pageSize))

async function fetchMaitresOeuvre() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('maitres-oeuvre/')
    maitresOeuvre.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addMaitreOeuvre() {
  try {
    const res = await axiosInstance.post('maitres-oeuvre/', newMaitreOeuvre.value)
    maitresOeuvre.value.push(res.data)
    showAddPopup.value = false
    newMaitreOeuvre.value = { designationMO: '', description: '', adresse: '', email: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(maitreOeuvre: MaitreOeuvre) {
  maitreOeuvreToDelete.value = maitreOeuvre
}

function confirmUpdate(maitreOeuvre: MaitreOeuvre) {
  maitreOeuvreToUpdate.value = { ...maitreOeuvre }
}

async function updateMaitreOeuvre() {
  if (!maitreOeuvreToUpdate.value) return
  try {
    const maitreOeuvreToSend = {
      designationMO: maitreOeuvreToUpdate.value.designationMO,
      description: maitreOeuvreToUpdate.value.description,
      adresse: maitreOeuvreToUpdate.value.adresse,
      email: maitreOeuvreToUpdate.value.email
    }
    await axiosInstance.put(`maitres-oeuvre/${maitreOeuvreToUpdate.value.idMaitreOeuvre}/`, maitreOeuvreToSend)
    const index = maitresOeuvre.value.findIndex(m => m.idMaitreOeuvre === maitreOeuvreToUpdate.value!.idMaitreOeuvre)
    if (index !== -1) {
      maitresOeuvre.value[index] = { ...maitreOeuvreToUpdate.value }
    }
    maitreOeuvreToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteMaitreOeuvre() {
  if (!maitreOeuvreToDelete.value) return
  try {
    await axiosInstance.delete(`maitres-oeuvre/${maitreOeuvreToDelete.value.idMaitreOeuvre}/`)
    maitresOeuvre.value = maitresOeuvre.value.filter(m => m.idMaitreOeuvre !== maitreOeuvreToDelete.value!.idMaitreOeuvre)
    maitreOeuvreToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

// Validate required fields
function validateRequiredFields() {
  const errors = {
    designationMO: '',
    adresse: '',
    email: ''
  }
  
  let isValid = true
  
  if (!newMaitreOeuvre.value.designationMO.trim()) {
    errors.designationMO = 'La désignation est requise'
    isValid = false
  }
  
  if (!newMaitreOeuvre.value.adresse.trim()) {
    errors.adresse = 'L\'adresse est requise'
    isValid = false
  }
  
  if (!newMaitreOeuvre.value.email.trim()) {
    errors.email = 'L\'email est requis'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

// Validate and add MaitreOeuvre
function validateAndAddMaitreOeuvre() {
  if (validateRequiredFields()) {
    addMaitreOeuvre()
  }
}

function exportCSV() {
  const headers = ['ID', 'Désignation', 'Description', 'Adresse', 'Email']
  const rows = filteredMaitresOeuvre.value.map(maitreOeuvre => [
    maitreOeuvre.idMaitreOeuvre,
    maitreOeuvre.designationMO,
    maitreOeuvre.description || '',
    maitreOeuvre.adresse || '',
    maitreOeuvre.email || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'maitres_oeuvre.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchMaitresOeuvre()
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
