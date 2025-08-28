<template>
  <div class="page-wrapper">
    <h1>Bureaux d'Études</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un bureau d'études..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredBEs.length > 0" class="product-table">
        <thead>
          <tr>
            <!-- <th @click="toggleSort('idBET')" class="sortable">
              ID
              <span v-if="sortColumn === 'idBET'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th> -->
            <th @click="toggleSort('nom')" class="sortable">
              Nom
              <span v-if="sortColumn === 'nom'">{{ sortAsc ? '▲' : '▼' }}</span>
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
          <tr v-for="be in paginatedBEs" :key="be.idBET">
            <!-- <td>{{ be.idBET }}</td> -->
            <td>{{ be.nom }}</td>
            <td>{{ be.description || '—' }}</td>
            <td>{{ be.adresse || '—' }}</td>
            <td>{{ be.telephone || '—' }}</td>
            <td>{{ be.email || '—' }}</td>
            <td>
              <button class="update-button" @click="confirmUpdate(be)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button class="delete-button" @click="confirmDelete(be)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        <h2>Ajouter un Bureau d'Études</h2>
        <div class="form-group">
          <label>Nom *</label>
          <input 
            v-model="newBE.nom" 
            placeholder="Nom" 
            :class="{ 'error': validationErrors.nom }"
          />
          <div v-if="validationErrors.nom" class="error-message">{{ validationErrors.nom }}</div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newBE.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="form-group">
          <label>Adresse *</label>
          <input 
            v-model="newBE.adresse" 
            placeholder="Adresse" 
            :class="{ 'error': validationErrors.adresse }"
          />
          <div v-if="validationErrors.adresse" class="error-message">{{ validationErrors.adresse }}</div>
        </div>
        <div class="form-group">
          <label>Téléphone *</label>
          <input 
            v-model="newBE.telephone" 
            placeholder="Téléphone" 
            :class="{ 'error': validationErrors.telephone }"
          />
          <div v-if="validationErrors.telephone" class="error-message">{{ validationErrors.telephone }}</div>
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input 
            v-model="newBE.email" 
            placeholder="Email" 
            :class="{ 'error': validationErrors.email }"
          />
          <div v-if="validationErrors.email" class="error-message">{{ validationErrors.email }}</div>
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddBE">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="beToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ beToDelete.nom }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteBE">Oui, supprimer</button>
          <button @click="beToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="beToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Bureau d'Études</h2>
        <input v-model="beToUpdate.nom" placeholder="Nom" />
        <textarea v-model="beToUpdate.description" placeholder="Description (optionnelle)" />
        <input v-model="beToUpdate.adresse" placeholder="Adresse" />
        <input v-model="beToUpdate.telephone" placeholder="Téléphone" />
        <input v-model="beToUpdate.email" placeholder="Email" />
        <div class="modal-actions">
          <button @click="updateBE">Modifier</button>
          <button @click="beToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

interface BureauEtude {
  idBET: number
  nom: string
  description: string
  adresse: string
  telephone: string
  email: string
}

const bes = ref<BureauEtude[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'idBET' | 'nom' | 'description' | 'adresse' | 'telephone' | 'email'>('idBET')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newBE = ref({ nom: '', description: '', adresse: '', telephone: '', email: '' })
const beToDelete = ref<BureauEtude | null>(null)
const beToUpdate = ref<BureauEtude | null>(null)

// Validation errors
const validationErrors = ref({
  nom: '',
  adresse: '',
  telephone: '',
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

const filteredBEs = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = bes.value.filter((be) =>
    be.nom.toLowerCase().includes(s) ||
    (be.description?.toLowerCase().includes(s) ?? false) ||
    (be.adresse?.toLowerCase().includes(s) ?? false) ||
    (be.telephone?.toLowerCase().includes(s) ?? false) ||
    (be.email?.toLowerCase().includes(s) ?? false)
  )

  return filtered.sort((a, b) => {
    const fieldA = a[sortColumn.value]
    const fieldB = b[sortColumn.value]

    if (fieldA < fieldB) return sortAsc.value ? -1 : 1
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1
    return 0
  })
})

const paginatedBEs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredBEs.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredBEs.value.length / pageSize))

async function fetchBEs() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('bureaux-etudes/')
    bes.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addBE() {
  try {
    const res = await axiosInstance.post('bureaux-etudes/', newBE.value)
    bes.value.push(res.data)
    showAddPopup.value = false
    newBE.value = { nom: '', description: '', adresse: '', telephone: '', email: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(be: BureauEtude) {
  beToDelete.value = be
}

function confirmUpdate(be: BureauEtude) {
  beToUpdate.value = { ...be }
}

async function updateBE() {
  if (!beToUpdate.value) return
  try {
    const beToSend = {
      nom: beToUpdate.value.nom,
      description: beToUpdate.value.description,
      adresse: beToUpdate.value.adresse,
      telephone: beToUpdate.value.telephone,
      email: beToUpdate.value.email
    }
    await axiosInstance.put(`bureaux-etudes/${beToUpdate.value.idBET}/`, beToSend)
    const index = bes.value.findIndex(b => b.idBET === beToUpdate.value!.idBET)
    if (index !== -1) {
      bes.value[index] = { ...beToUpdate.value }
    }
    beToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteBE() {
  if (!beToDelete.value) return
  try {
    await axiosInstance.delete(`bureaux-etudes/${beToDelete.value.idBET}/`)
    bes.value = bes.value.filter(b => b.idBET !== beToDelete.value!.idBET)
    beToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

// Validate required fields
function validateRequiredFields() {
  const errors = {
    nom: '',
    adresse: '',
    telephone: '',
    email: ''
  }
  
  let isValid = true
  
  if (!newBE.value.nom.trim()) {
    errors.nom = 'Le nom est requis'
    isValid = false
  }
  
  if (!newBE.value.adresse.trim()) {
    errors.adresse = 'L\'adresse est requise'
    isValid = false
  }
  
  if (!newBE.value.telephone.trim()) {
    errors.telephone = 'Le téléphone est requis'
    isValid = false
  }
  
  if (!newBE.value.email.trim()) {
    errors.email = 'L\'email est requis'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

// Validate and add BE
function validateAndAddBE() {
  if (validateRequiredFields()) {
    addBE()
  }
}

function exportCSV() {
  const headers = ['ID', 'Nom', 'Description', 'Adresse', 'Téléphone', 'Email']
  const rows = filteredBEs.value.map(be => [
    be.idBET,
    be.nom,
    be.description || '',
    be.adresse || '',
    be.telephone || '',
    be.email || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'bureaux_etudes.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchBEs()
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
