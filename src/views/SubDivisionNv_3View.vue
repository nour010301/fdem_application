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
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
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
            v-model="newSubdivision.selectedStructure"
            @change="onStructureChange"
            :class="{ 'error': validationErrors.selectedStructure }"
          >
            <option value="" disabled>Sélectionnez une structure</option>
            <option v-for="structure in structures" :key="structure.idStructure" :value="structure.idStructure">
              {{ structure.nom }}
            </option>
          </select>
          <div v-if="validationErrors.selectedStructure" class="error-message">{{ validationErrors.selectedStructure }}</div>
        </div>
        <div class="form-group">
          <label>Subdivision Niveau 1 *</label>
          <select 
            v-model="newSubdivision.selectedSubdivisionNv1"
            @change="onSubdivisionNv1Change"
            :class="{ 'error': validationErrors.selectedSubdivisionNv1 }"
            :disabled="!newSubdivision.selectedStructure"
          >
            <option value="" disabled>{{ !newSubdivision.selectedStructure ? 'Sélectionnez d\'abord une structure' : 'Sélectionnez une subdivision Niveau 1' }}</option>
            <option v-for="subdiv in filteredSubdivisionsNv1" :key="subdiv.idSubDivisionNv_1" :value="subdiv.idSubDivisionNv_1">
              {{ subdiv.nom }}
            </option>
          </select>
          <div v-if="validationErrors.selectedSubdivisionNv1" class="error-message">{{ validationErrors.selectedSubdivisionNv1 }}</div>
        </div>
        <div class="form-group">
          <label>Subdivision Niveau 2 *</label>
          <select 
            v-model="newSubdivision.idSubDivisionNv_2"
            :class="{ 'error': validationErrors.idSubDivisionNv_2 }"
            :disabled="!newSubdivision.selectedSubdivisionNv1"
          >
            <option value="" disabled>{{ !newSubdivision.selectedSubdivisionNv1 ? 'Sélectionnez d\'abord une subdivision Niveau 1' : 'Sélectionnez une subdivision Niveau 2' }}</option>
            <option v-for="subdiv in filteredSubdivisionsNv2" :key="subdiv.idSubDivisionNv_2" :value="subdiv.idSubDivisionNv_2">
              {{ subdiv.nom }}
            </option>
          </select>
          <div v-if="validationErrors.idSubDivisionNv_2" class="error-message">{{ validationErrors.idSubDivisionNv_2 }}</div>
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
        <select v-model="subdivisionToUpdate.idSubDivisionNv_2">
          <option value="" disabled>Sélectionnez une subdivision Niveau 2</option>
          <option v-for="subdiv in subdivisionsNv2" :key="subdiv.idSubDivisionNv_2" :value="subdiv.idSubDivisionNv_2">
            {{ subdiv.nom }}
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
  idSubDivisionNv_1: number
}

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

const data = ref<SubdivisionNv3[]>([])
const subdivisionsNv2 = ref<SubdivisionNv2[]>([])
const subdivisionsNv1 = ref<SubdivisionNv1[]>([])
const structures = ref<Structure[]>([])
const filteredSubdivisionsNv1 = ref<SubdivisionNv1[]>([])
const filteredSubdivisionsNv2 = ref<SubdivisionNv2[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<keyof SubdivisionNv3>('idSubDivisionNv_3')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newSubdivision = ref({ nom: '', designation: '', idSubDivisionNv_2: null, selectedStructure: null, selectedSubdivisionNv1: null })
const successMessage = ref('')

// Validation errors
const validationErrors = ref({
  nom: '',
  designation: '',
  idSubDivisionNv_2: '',
  selectedStructure: '',
  selectedSubdivisionNv1: ''
})
const subdivisionToDelete = ref<SubdivisionNv3 | null>(null)
const subdivisionToUpdate = ref<SubdivisionNv3 | null>(null)

const userStore = useUserStore()

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
    const response = await axiosInstance.get('subdivision-nv3/')
    data.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function fetchSubdivisionsNv2() {
  try {
    const response = await axiosInstance.get('subdivision-nv2/')
    subdivisionsNv2.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  }
}

async function fetchSubdivisionsNv1() {
  try {
    const response = await axiosInstance.get('subdivision-nv1/')
    subdivisionsNv1.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
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

function onStructureChange() {
  // Filter subdivisions nv1 based on selected structure
  if (newSubdivision.value.selectedStructure) {
    filteredSubdivisionsNv1.value = subdivisionsNv1.value.filter(
      subdiv => subdiv.idStructure === newSubdivision.value.selectedStructure
    )
  } else {
    filteredSubdivisionsNv1.value = []
  }
  // Reset subdivision nv1 and nv2 selections when structure changes
  newSubdivision.value.selectedSubdivisionNv1 = null
  newSubdivision.value.idSubDivisionNv_2 = null
  filteredSubdivisionsNv2.value = []
}

async function onSubdivisionNv1Change() {
  // Reset subdivision nv2 selection when subdivision nv1 changes
  newSubdivision.value.idSubDivisionNv_2 = null
  filteredSubdivisionsNv2.value = []
  
  // Filter subdivisions nv2 based on selected subdivision nv1 from already loaded data
  if (newSubdivision.value.selectedSubdivisionNv1) {
    try {
      // Use the same pattern as Documents.vue - filter from allSubDivs1Et2
      const response = await axiosInstance.get('subdiv1et2/')
      const allSubDivs1Et2 = response.data
      filteredSubdivisionsNv2.value = allSubDivs1Et2.filter(
        item => item.idSubDivisionNv_1.idSubDivisionNv_1 === newSubdivision.value.selectedSubdivisionNv1
      ).map(item => ({
        idSubDivisionNv_2: item.idSubDivisionNv_2.idSubDivisionNv_2,
        nom: item.idSubDivisionNv_2.nom,
        designation: item.idSubDivisionNv_2.designation
      }))
    } catch (e: any) {
      console.error('Error fetching subdivisions nv2:', e)
      filteredSubdivisionsNv2.value = []
    }
  }
}

async function addSubdivision() {
  try {
    const res = await axiosInstance.post('subdivision-nv3/', newSubdivision.value)
    data.value.push(res.data)
    
    // Show success message
    successMessage.value = 'Subdivision ajoutée avec succès !'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
    // Keep modal open, preserve all selections, only clear nom and designation
    const preservedStructure = newSubdivision.value.selectedStructure
    const preservedSubdivNv1 = newSubdivision.value.selectedSubdivisionNv1
    const preservedSubdivNv2 = newSubdivision.value.idSubDivisionNv_2
    newSubdivision.value = { nom: '', designation: '', idSubDivisionNv_2: preservedSubdivNv2, selectedStructure: preservedStructure, selectedSubdivisionNv1: preservedSubdivNv1 }
    validationErrors.value = { nom: '', designation: '', idSubDivisionNv_2: '', selectedStructure: '', selectedSubdivisionNv1: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(subdivision: SubdivisionNv3) {
  subdivisionToDelete.value = subdivision
}

function confirmUpdate(subdivision: SubdivisionNv3) {
  subdivisionToUpdate.value = { ...subdivision }
}

async function updateSubdivision() {
  if (!subdivisionToUpdate.value) return
  try {
    const subdivisionToSend = {
      nom: subdivisionToUpdate.value.nom,
      designation: subdivisionToUpdate.value.designation,
      idSubDivisionNv_2: subdivisionToUpdate.value.idSubDivisionNv_2
    }
    await axiosInstance.put(`subdivision-nv3/${subdivisionToUpdate.value.idSubDivisionNv_3}/`, subdivisionToSend)
    const index = data.value.findIndex(s => s.idSubDivisionNv_3 === subdivisionToUpdate.value!.idSubDivisionNv_3)
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
    await axiosInstance.delete(`subdivision-nv3/${subdivisionToDelete.value.idSubDivisionNv_3}/`)
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

function closeModal() {
  showAddPopup.value = false
  newSubdivision.value = { nom: '', designation: '', idSubDivisionNv_2: null, selectedStructure: null, selectedSubdivisionNv1: null }
  validationErrors.value = { nom: '', designation: '', idSubDivisionNv_2: '', selectedStructure: '', selectedSubdivisionNv1: '' }
  successMessage.value = ''
  filteredSubdivisionsNv1.value = []
  filteredSubdivisionsNv2.value = []
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchData()
  fetchSubdivisionsNv2()
  fetchSubdivisionsNv1()
  fetchStructures()
})

// Validate required fields
function validateRequiredFields() {
  const errors = {
    nom: '',
    designation: '',
    idSubDivisionNv_2: ''
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
  
  if (!newSubdivision.value.selectedStructure) {
    errors.selectedStructure = 'La structure est requise'
    isValid = false
  }
  
  if (!newSubdivision.value.selectedSubdivisionNv1) {
    errors.selectedSubdivisionNv1 = 'La subdivision Niveau 1 est requise'
    isValid = false
  }
  
  if (!newSubdivision.value.idSubDivisionNv_2) {
    errors.idSubDivisionNv_2 = 'La subdivision Niveau 2 est requise'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
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
