<template>
  <div class="page-wrapper">
    <h1>Produits</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un produit..."
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
    <div v-else-if="error" class="error">Erreur lors de la récupération des produits: {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="!loading && !error && filteredProduits.length > 0" class="product-table">
        <thead>
          <tr>
            <!-- <th @click="toggleSort('idProduit')" class="sortable">
              ID
              <span v-if="sortColumn === 'idProduit'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th> -->
            <th @click="toggleSort('typeProduitDesignation')" class="sortable">
             Type de Produit
              <span v-if="sortColumn === 'typeProduitDesignation'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('designation')" class="sortable">
             Produit
              <span v-if="sortColumn === 'designation'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('description')" class="sortable">
              Description
              <span v-if="sortColumn === 'description'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="produit in paginatedProduits" :key="produit.idProduit">
            <!-- <td>{{ produit.idProduit }}</td> -->
            <td>{{ produit.typeProduitDesignation || '—' }}</td>
            <td>{{ produit.designation }}</td>
            <td>{{ produit.description || '—' }}</td>
            <td>
              <button 
                class="update-button" 
                @click="confirmUpdate(produit)"
                :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }"
                :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value"
                title="Modifier"
              >
                ✎
              </button>
              <button 
                class="delete-button" 
                @click="confirmDelete(produit)"
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

      <div v-else class="no-result">Aucun produit trouvé.</div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1">Précédent</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">Suivant</button>
    </div>

    <div v-if="showAddPopup" class="modal-overlay">
      <div class="modal">
        <h2>Ajouter un Produit</h2>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div class="form-group">
          <label>Type de Produit *</label>
          <select 
            v-model="newProduit.idTypeProduit"
            :class="{ 'error': validationErrors.idTypeProduit }"
          >
            <option disabled value="">-- Type de Produit --</option>
            <option v-for="type in types" :key="type.idTypeProduit" :value="type.idTypeProduit">
              {{ type.designation }}
            </option>
          </select>
          <div v-if="validationErrors.idTypeProduit" class="error-message">{{ validationErrors.idTypeProduit }}</div>
        </div>
        <div class="form-group">
          <label>Désignation *</label>
          <input 
            v-model="newProduit.designation" 
            placeholder="Désignation" 
            :class="{ 'error': validationErrors.designation }"
          />
          <div v-if="validationErrors.designation" class="error-message">{{ validationErrors.designation }}</div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newProduit.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddProduit">Ajouter</button>
          <button @click="closeModal" class="cancel">Fermer</button>
        </div>
      </div>
    </div>
    <div v-if="produitToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ produitToDelete.designation }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteProduit">Oui, supprimer</button>
          <button @click="produitToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="produitToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Produit</h2>
        <select v-model="produitToUpdate.idTypeProduit">
          <option disabled value="">-- Type de Produit --</option>
          <option v-for="type in types" :key="type.idTypeProduit" :value="type.idTypeProduit">
            {{ type.designation }}
          </option>
        </select>
        <input v-model="produitToUpdate.designation" placeholder="Désignation" />
        <textarea v-model="produitToUpdate.description" placeholder="Description (optionnelle)" />
        <div class="modal-actions">
          <button @click="updateProduit">Modifier</button>
          <button @click="produitToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { watch } from 'vue'
import { useUserStore } from '../store/userStore'

interface TypeProduit {
  idTypeProduit: number
  designation: string
  description: string
}

interface Produit {
  idProduit: number
  idTypeProduit: number
  typeProduitDesignation: string
  designation: string
  description: string
}

const produits = ref<Produit[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'typeProduitDesignation' | 'designation' | 'description'>('designation')

const sortAsc = ref(true)

const produitToDelete = ref<Produit | null>(null)
const produitToUpdate = ref<Produit | null>(null)
const types = ref<TypeProduit[]>([])

const showAddPopup = ref(false)

const newProduit = ref<{
  idTypeProduit: number | null
  designation: string
  description: string
}>({
  idTypeProduit: null,
  designation: '',
  description: ''
})

// Validation errors
const validationErrors = ref({
  idTypeProduit: '',
  designation: ''
})

// User store for role-based access control
const userStore = useUserStore()

// Success message
const successMessage = ref('')

async function fetchTypes() {
  try {
    const res = await axiosInstance.get('types/')
    types.value = res.data
  } catch (e) {
    console.error('Erreur lors du chargement des types', e)
  }
}

async function fetchTypeDetails(idTypeProduit: number): Promise<TypeProduit> {
  try {
    const res = await axiosInstance.get(`types/${idTypeProduit}/detail/`)
    return res.data
  } catch (e) {
    console.error(`Erreur lors du chargement des détails du type ${idTypeProduit}`, e)
    throw e
  }
}

async function fetchProduits() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('Allproduits/')
    const produitsWithTypes = await Promise.all(
      response.data.map(async (produit: Produit) => {
        const typeDetails = await fetchTypeDetails(produit.idTypeProduit)
        return {
          ...produit,
          typeProduitDesignation: typeDetails.designation
        }
      })
    )
    produits.value = produitsWithTypes
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredProduits = computed(() => {
  const s = search.value.trim().toLowerCase()
  console.log('Search term:', s)  // Log search term for debugging
  const filtered = produits.value.filter((prod) => {
    const idProduitMatch = prod.idProduit.toString().includes(s)
    const designationMatch = prod.designation.toLowerCase().includes(s)
    const typeProduitMatch = prod.typeProduitDesignation.toLowerCase().includes(s)

    // Log each match condition
    console.log(`Checking product ${prod.idProduit}:`, { idProduitMatch, designationMatch, typeProduitMatch })

    return idProduitMatch || designationMatch || typeProduitMatch
  })

  console.log('Filtered results:', filtered)  // Log filtered products for debugging

  return filtered.sort((a, b) => {
    // Primary sort by designation (A to Z)
    const nameA = a.designation.toLowerCase()
    const nameB = b.designation.toLowerCase()
    
    if (sortColumn.value === 'designation') {
      // If sorting by designation column, respect user's sort direction
      if (nameA < nameB) return sortAsc.value ? -1 : 1
      if (nameA > nameB) return sortAsc.value ? 1 : -1
      return 0
    } else {
      // For other columns, sort by that column first, then by designation as secondary sort
      const fieldA = sortColumn.value === 'typeProduitDesignation'
        ? (a.typeProduitDesignation || '').toString().toLowerCase()
        : (a[sortColumn.value] || '').toString().toLowerCase()
      const fieldB = sortColumn.value === 'typeProduitDesignation'
        ? (b.typeProduitDesignation || '').toString().toLowerCase()
        : (b[sortColumn.value] || '').toString().toLowerCase()
      
      if (fieldA !== fieldB) {
        if (fieldA < fieldB) return sortAsc.value ? -1 : 1
        if (fieldA > fieldB) return sortAsc.value ? 1 : -1
      }
      
      // Secondary sort by designation (always A to Z)
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    }
  })
})

// Reset to page 1 every time the search term changes
watch(search, () => {
  currentPage.value = 1
})

const paginatedProduits = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProduits.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredProduits.value.length / pageSize))

async function addProduit() {
  try {
    const produitToSend = {
      idTypeProduit: newProduit.value.idTypeProduit,
      designation: newProduit.value.designation,
      description: newProduit.value.description
    }
    const res = await axiosInstance.post('produits/', produitToSend)
    const typeDetails = await fetchTypeDetails(newProduit.value.idTypeProduit!)
    produits.value.push({
      ...res.data,
      typeProduitDesignation: typeDetails.designation
    })
    // Keep modal open and preserve idTypeProduit, only clear designation and description
    const selectedTypeId = newProduit.value.idTypeProduit
    newProduit.value = { idTypeProduit: selectedTypeId, designation: '', description: '' }
    validationErrors.value = { idTypeProduit: '', designation: '' }
    successMessage.value = 'Produit ajouté avec succès!'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(produit: Produit) {
  produitToDelete.value = produit
}

function confirmUpdate(produit: Produit) {
  produitToUpdate.value = { ...produit }
}

async function updateProduit() {
  if (!produitToUpdate.value) return
  try {
    const produitToSend = {
      idTypeProduit: produitToUpdate.value.idTypeProduit,
      designation: produitToUpdate.value.designation,
      description: produitToUpdate.value.description
    }
    await axiosInstance.put(`produits/${produitToUpdate.value.idProduit}/`, produitToSend)
    const index = produits.value.findIndex(p => p.idProduit === produitToUpdate.value!.idProduit)
    if (index !== -1) {
      const typeDetails = await fetchTypeDetails(produitToUpdate.value.idTypeProduit)
      produits.value[index] = {
        ...produitToUpdate.value,
        typeProduitDesignation: typeDetails.designation
      }
    }
    produitToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteProduit() {
  if (!produitToDelete.value) return
  try {
    await axiosInstance.delete(`produits/${produitToDelete.value.idProduit}/`)
    produits.value = produits.value.filter(p => p.idProduit !== produitToDelete.value?.idProduit)
    produitToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

// Validate required fields
function validateRequiredFields() {
  const errors = {
    idTypeProduit: '',
    designation: ''
  }
  
  let isValid = true
  
  if (!newProduit.value.idTypeProduit) {
    errors.idTypeProduit = 'Le type de produit est requis'
    isValid = false
  }
  
  if (!newProduit.value.designation.trim()) {
    errors.designation = 'La désignation est requise'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

// Validate and add Produit
function validateAndAddProduit() {
  if (validateRequiredFields()) {
    addProduit()
  }
}

// Close modal and reset all fields
function closeModal() {
  showAddPopup.value = false
  newProduit.value = { idTypeProduit: null, designation: '', description: '' }
  validationErrors.value = { idTypeProduit: '', designation: '' }
  successMessage.value = ''
}

function exportCSV() {
  const headers = ['ID Produit', 'Type Désignation', 'Désignation', 'Description']

  const rows = filteredProduits.value.map(produit => [
    produit.idProduit,
    produit.typeProduitDesignation,
    produit.designation,
    produit.description || '—'
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `${value}`).join(';')) // use semicolon separator
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'produits.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchProduits()
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

.export-button.disabled {
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
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
}
</style>
