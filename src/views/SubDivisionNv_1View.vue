<template>
  <div class="page-wrapper">
    <h1>Classes de documents</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher une subdivision..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur lors de la récupération: {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredSubdivs.length > 0" class="product-table">
        <thead>
          <tr>
            <!-- <th @click="toggleSort('idSubDivisionNv_1')" class="sortable">
              ID
              <span v-if="sortColumn === 'idSubDivisionNv_1'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th> -->
            <th @click="toggleSort('nom')" class="sortable">
              Nom
              <span v-if="sortColumn === 'nom'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('designation')" class="sortable">
              Désignation
              <span v-if="sortColumn === 'designation'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('idStructure')" class="sortable">
              ID Structure
              <span v-if="sortColumn === 'idStructure'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedSubdivs" :key="item.idSubDivisionNv_1">
            <!-- <td>{{ item.idSubDivisionNv_1 }}</td> -->
            <td>{{ item.nom }}</td>
            <td>{{ item.designation || '—' }}</td>
            <td>{{ item.idStructure }}</td>
            <td>
              <button class="update-button" @click="confirmUpdate(item)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button class="delete-button" @click="confirmDelete(item)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <div class="form-group">
          <label>Structure *</label>
          <select 
            v-model="newSubdivision.idStructure"
            :class="{ 'error': validationErrors.idStructure }"
          >
            <option value="" disabled>Sélectionnez une structure</option>
            <option v-for="structure in structures" :key="structure.idStructure" :value="structure.idStructure">
              {{ structure.nom }}
            </option>
          </select>
          <div v-if="validationErrors.idStructure" class="error-message">{{ validationErrors.idStructure }}</div>
        </div>
        <div class="form-group">
          <label>Nom *</label>
          <input 
            v-model="newSubdivision.nom" 
            placeholder="Nom" 
            :class="{ 'error': validationErrors.nom }"
          />
          <div v-if="validationErrors.nom" class="error-message">{{ validationErrors.nom }}</div>
        </div>
        <div class="form-group">
          <label>Désignation *</label>
          <textarea 
            v-model="newSubdivision.designation" 
            placeholder="Désignation" 
            :class="{ 'error': validationErrors.designation }"
          />
          <div v-if="validationErrors.designation" class="error-message">{{ validationErrors.designation }}</div>
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddSubdivision">Ajouter</button>
          <button @click="closeModal" class="cancel">Fermer</button>
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

    <!-- UPDATE MODAL -->
    <div v-if="subdivisionToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Subdivision</h2>
        <input v-model="subdivisionToUpdate.nom" placeholder="Nom" />
        <textarea v-model="subdivisionToUpdate.designation" placeholder="Désignation (optionnelle)" />
        <select v-model="subdivisionToUpdate.idStructure">
          <option value="" disabled>Sélectionnez une structure</option>
          <option v-for="structure in structures" :key="structure.idStructure" :value="structure.idStructure">
            {{ structure.nom }}
          </option>
        </select>
        <div class="modal-actions">
          <button @click="updateSubdivision">Modifier</button>
          <button @click="subdivisionToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

interface SubdivisionNv1 {
  idSubDivisionNv_1: number
  nom: string
  designation: string | null
  subDiv: boolean
  idStructure: number
}

interface Structure {
  idStructure: number
  nom: string
  designation: string
}

const data = ref<SubdivisionNv1[]>([])
const structures = ref<Structure[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'nom' | 'designation' | 'idStructure' | 'idSubDivisionNv_1'>('nom')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newSubdivision = ref({ nom: '', designation: '', idStructure: null })
const successMessage = ref('')

// Validation errors
const validationErrors = ref({
  nom: '',
  designation: '',
  idStructure: ''
})
const subdivisionToDelete = ref<SubdivisionNv1 | null>(null)
const subdivisionToUpdate = ref<SubdivisionNv1 | null>(null)

const userStore = useUserStore()

function toggleSort(column: 'nom' | 'designation' | 'idStructure' | 'idSubDivisionNv_1') {
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
      item.designation?.toLowerCase().includes(s) ||
      item.idStructure.toString().includes(s)
    )
    .sort((a, b) => {
      // Primary sort by nom (A to Z)
      const nameA = a.nom.toLowerCase()
      const nameB = b.nom.toLowerCase()
      
      if (sortColumn.value === 'nom') {
        // If sorting by nom column, respect user's sort direction
        if (nameA < nameB) return sortAsc.value ? -1 : 1
        if (nameA > nameB) return sortAsc.value ? 1 : -1
        return 0
      } else {
        // For other columns, sort by that column first, then by nom as secondary sort
        const fieldA = (a[sortColumn.value] || '').toString().toLowerCase()
        const fieldB = (b[sortColumn.value] || '').toString().toLowerCase()
        
        if (fieldA !== fieldB) {
          if (fieldA < fieldB) return sortAsc.value ? -1 : 1
          if (fieldA > fieldB) return sortAsc.value ? 1 : -1
        }
        
        // Secondary sort by nom (always A to Z)
        if (nameA < nameB) return -1
        if (nameA > nameB) return 1
        return 0
      }
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
    const response = await axiosInstance.get('subdivision-nv1/')
    data.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function fetchStructures() {
  try {
    const response = await axiosInstance.get('structures/')
    structures.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  }
}

async function addSubdivision() {
  try {
    const res = await axiosInstance.post('subdivision-nv1/', newSubdivision.value)
    data.value.push(res.data)
    
    // Show success message
    successMessage.value = 'Subdivision ajoutée avec succès !'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
    // Keep modal open, preserve structure selection, only clear nom and designation
    const preservedStructure = newSubdivision.value.idStructure
    newSubdivision.value = { nom: '', designation: '', idStructure: preservedStructure }
    validationErrors.value = { nom: '', designation: '', idStructure: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(subdivision: SubdivisionNv1) {
  subdivisionToDelete.value = subdivision
}

function confirmUpdate(subdivision: SubdivisionNv1) {
  subdivisionToUpdate.value = { ...subdivision }
}

async function updateSubdivision() {
  if (!subdivisionToUpdate.value) return
  try {
    const subdivisionToSend = {
      nom: subdivisionToUpdate.value.nom,
      designation: subdivisionToUpdate.value.designation,
      idStructure: subdivisionToUpdate.value.idStructure
    }
    await axiosInstance.put(`subdivision-nv1/${subdivisionToUpdate.value.idSubDivisionNv_1}/`, subdivisionToSend)
    const index = data.value.findIndex(s => s.idSubDivisionNv_1 === subdivisionToUpdate.value!.idSubDivisionNv_1)
    if (index !== -1) {
      data.value[index] = { ...subdivisionToUpdate.value }
    }
    subdivisionToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteSubdivision() {
  if (!subdivisionToDelete.value) return
  try {
    await axiosInstance.delete(`subdivision-nv1/${subdivisionToDelete.value.idSubDivisionNv_1}/`)
    data.value = data.value.filter(s => s.idSubDivisionNv_1 !== subdivisionToDelete.value!.idSubDivisionNv_1)
    subdivisionToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function exportCSV() {
  const headers = ['ID', 'Nom', 'Désignation', 'ID Structure']
  const rows = filteredSubdivs.value.map(item => [
    item.idSubDivisionNv_1,
    item.nom,
    item.designation || '—',
    item.idStructure
  ])
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')
  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csvContent))
  link.setAttribute('download', 'subdivision_nv1.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchData()
  fetchStructures()
})

// Validate required fields
function validateRequiredFields() {
  const errors = {
    nom: '',
    designation: '',
    idStructure: ''
  }
  
  let isValid = true
  
  if (!newSubdivision.value.nom.trim()) {
    errors.nom = 'Le nom est requis'
    isValid = false
  }
  
  if (!newSubdivision.value.designation.trim()) {
    errors.designation = 'La désignation est requise'
    isValid = false
  }
  
  if (!newSubdivision.value.idStructure) {
    errors.idStructure = 'La structure est requise'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

function closeModal() {
  showAddPopup.value = false
  newSubdivision.value = { nom: '', designation: '', idStructure: null }
  validationErrors.value = { nom: '', designation: '', idStructure: '' }
  successMessage.value = ''
}

// Validate and add subdivision
function validateAndAddSubdivision() {
  if (validateRequiredFields()) {
    addSubdivision()
  }
}
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
.form-group select.error,
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

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
  font-weight: 500;
}
</style>
