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
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div class="form-group">
          <label>Types de Produit *</label>
          <div class="checkbox-list" :class="{ 'error': validationErrors.types }">
            <label v-for="type in types" :key="type.idTypeProduit" 
                   class="checkbox-item"
                   :class="{ 'checked': newSection.types.includes(type.idTypeProduit) }">
              <input type="checkbox" 
                     :value="type.idTypeProduit"
                     @change="toggleType(type.idTypeProduit)" 
                     :checked="newSection.types.includes(type.idTypeProduit)">
              {{ type.designation }}
            </label>
          </div>
          <div v-if="validationErrors.types" class="error-message">{{ validationErrors.types }}</div>
        </div>
        <div class="form-group">
          <label>Nom *</label>
          <input 
            v-model="newSection.nom" 
            placeholder="Nom" 
            :class="{ 'error': validationErrors.nom }"
          />
          <div v-if="validationErrors.nom" class="error-message">{{ validationErrors.nom }}</div>
        </div>
        <div class="form-group">
          <label>Désignation *</label>
          <textarea 
            v-model="newSection.designation" 
            placeholder="Désignation" 
            :class="{ 'error': validationErrors.designation }"
          />
          <div v-if="validationErrors.designation" class="error-message">{{ validationErrors.designation }}</div>
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddSection">Ajouter</button>
          <button @click="closeModal" class="cancel">Fermer</button>
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

interface TypeProduit {
  idTypeProduit: number
  designation: string
  description: string
}

interface Section {
  idSectionProduit: number
  nom: string
  designation: string
}

const sections = ref<Section[]>([])
const types = ref<TypeProduit[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'idSectionProduit' | 'nom' | 'designation'>('idSectionProduit')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newSection = ref<{
  types: number[]
  nom: string
  designation: string
}>({
  types: [],
  nom: '',
  designation: ''
})
const sectionToDelete = ref<Section | null>(null)
const sectionToUpdate = ref<Section | null>(null)

// Validation errors
const validationErrors = ref({
  types: '',
  nom: '',
  designation: ''
})

// Success message
const successMessage = ref('')

// User store for role-based access control
const userStore = useUserStore()

async function fetchTypes() {
  try {
    const res = await axiosInstance.get('types/')
    types.value = res.data
  } catch (e) {
    console.error('Erreur lors du chargement des types', e)
  }
}

// function getTypeDesignation(typeId: number): string {
//   const type = types.value.find(t => t.idTypeProduit === typeId)
//   return type ? type.designation : 'Type inconnu'
// }

function toggleType(typeId: number) {
  const index = newSection.value.types.indexOf(typeId)
  if (index > -1) {
    newSection.value.types.splice(index, 1)
  } else {
    newSection.value.types.push(typeId)
  }
}

// function removeType(typeId: number) {
//   const index = newSection.value.types.indexOf(typeId)
//   if (index > -1) {
//     newSection.value.types.splice(index, 1)
//   }
// }

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
    const sectionToSend = {
      nom: newSection.value.nom,
      designation: newSection.value.designation,
      types: newSection.value.types
    }
    const res = await axiosInstance.post('sections/', sectionToSend)
    sections.value.push(res.data)
    // Keep modal open and preserve types, only clear nom and designation
    const selectedTypes = [...newSection.value.types]
    newSection.value = { types: selectedTypes, nom: '', designation: '' }
    validationErrors.value = { types: '', nom: '', designation: '' }
    successMessage.value = 'Section ajoutée avec succès!'
    setTimeout(() => successMessage.value = '', 3000)
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

// Validate required fields
function validateRequiredFields() {
  const errors = {
    types: '',
    nom: '',
    designation: ''
  }
  
  let isValid = true
  
  if (newSection.value.types.length === 0) {
    errors.types = 'Au moins un type de produit est requis'
    isValid = false
  }
  
  if (!newSection.value.nom.trim()) {
    errors.nom = 'Le nom est requis'
    isValid = false
  }
  
  if (!newSection.value.designation.trim()) {
    errors.designation = 'La désignation est requise'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

// Validate and add Section
function validateAndAddSection() {
  if (validateRequiredFields()) {
    addSection()
  }
}

// Close modal and reset all fields
function closeModal() {
  showAddPopup.value = false
  newSection.value = { types: [], nom: '', designation: '' }
  validationErrors.value = { types: '', nom: '', designation: '' }
  successMessage.value = ''
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
  fetchTypes()
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
  max-width: 600px;
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

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
}

.checkbox-list {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  text-align: left;
}

.checkbox-list.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

.checkbox-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.1rem 0.8rem;
  border-radius: 0;
  background: #f8f9fa;
  border: none;
  border-bottom: 1px solid #e9ecef;
  transition: all 0.2s;
  margin: 0;
}

.checkbox-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.checkbox-item.checked {
  background: #e8f5e8;
  color: #2e7d32;
  font-weight: 500;
  border-color: #c8e6c9;
}

.checkbox-item input[type="checkbox"] {
  margin-right: 0.8rem;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-item label {
  color: #333;
  cursor: pointer;
  flex: 1;
  font-weight: normal;
  margin: 0;
}
</style>
