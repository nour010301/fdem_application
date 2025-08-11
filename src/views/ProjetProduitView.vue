<template>
  <div class="page-wrapper">
    <h1>Projets</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un projet..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredProjets.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('code')" class="sortable">
              Code
              <span v-if="sortColumn === 'code'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('description')" class="sortable">
              Description
              <span v-if="sortColumn === 'description'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('adresse')" class="sortable">
              Adresse
              <span v-if="sortColumn === 'adresse'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('wilaya')" class="sortable">
              Wilaya
              <span v-if="sortColumn === 'wilaya'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="projet in paginatedProjets" :key="projet.code">
            <td>{{ projet.code }}</td>
            <td>{{ projet.description || '—' }}</td>
            <td>{{ projet.adresse || '—' }}</td>
            <td>{{ projet.wilaya || '—' }}</td>
            <td>
              <button class="update-button" @click="confirmUpdate(projet)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button class="delete-button" @click="confirmDelete(projet)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        <h2>Ajouter un Projet</h2>
        <div class="form-group">
          <label>Code *</label>
          <input 
            v-model="newProjet.code" 
            placeholder="Code" 
            :class="{ 'error': validationErrors.code }"
          />
          <div v-if="validationErrors.code" class="error-message">{{ validationErrors.code }}</div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newProjet.description" placeholder="Description (optionnelle)" />
        </div>
        <div class="form-group">
          <label>Adresse *</label>
          <input 
            v-model="newProjet.adresse" 
            placeholder="Adresse" 
            :class="{ 'error': validationErrors.adresse }"
          />
          <div v-if="validationErrors.adresse" class="error-message">{{ validationErrors.adresse }}</div>
        </div>
        <div class="form-group">
          <label>Wilaya *</label>
          <select 
            v-model="newProjet.wilaya"
            :class="{ 'error': validationErrors.wilaya }"
          >
            <option value="" disabled>Sélectionnez une wilaya</option>
            <option v-for="wilaya in wilayas" :key="wilaya" :value="wilaya">{{ wilaya }}</option>
          </select>
          <div v-if="validationErrors.wilaya" class="error-message">{{ validationErrors.wilaya }}</div>
        </div>
        <div class="modal-actions">
          <button @click="validateAndAddProjet">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="projetToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ projetToDelete.code }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteProjet">Oui, supprimer</button>
          <button @click="projetToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="projetToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Projet</h2>
        <input v-model="projetToUpdate.code" placeholder="Code" />
        <textarea v-model="projetToUpdate.description" placeholder="Description (optionnelle)" />
        <input v-model="projetToUpdate.adresse" placeholder="Adresse" />
        <select v-model="projetToUpdate.wilaya">
          <option value="" disabled>Sélectionnez une wilaya</option>
          <option v-for="wilaya in wilayas" :key="wilaya" :value="wilaya">{{ wilaya }}</option>
        </select>
        <div class="modal-actions">
          <button @click="updateProjet">Modifier</button>
          <button @click="projetToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

interface Projet {
  code: string
  description: string
  adresse: string | null
  wilaya: string | null
}

const projets = ref<Projet[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'code' | 'description' | 'adresse' | 'wilaya'>('code')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newProjet = ref({ code: '', description: '', adresse: '', wilaya: '' })
const projetToDelete = ref<Projet | null>(null)
const projetToUpdate = ref<Projet | null>(null)

// Validation errors
const validationErrors = ref({
  code: '',
  adresse: '',
  wilaya: ''
})

const userStore = useUserStore()

const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
  "Ghardaïa", "Relizane"
]

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredProjets = computed(() => {
  const s = search.value.trim().toLowerCase();

  const filtered = projets.value.filter((projet) =>
    (projet.code ?? '').toLowerCase().includes(s) ||
    (projet.description ?? '').toLowerCase().includes(s) ||
    (projet.adresse ?? '').toLowerCase().includes(s) ||
    (projet.wilaya ?? '').toLowerCase().includes(s)
  );

  return filtered.sort((a, b) => {
    const fieldA = a[sortColumn.value] ?? '';
    const fieldB = b[sortColumn.value] ?? '';

    if (fieldA < fieldB) return sortAsc.value ? -1 : 1;
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1;
    return 0;
  });
});

const paginatedProjets = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProjets.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredProjets.value.length / pageSize))

async function fetchProjets() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('projets/')
    projets.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addProjet() {
  try {
    const res = await axiosInstance.post('projets/', newProjet.value)
    projets.value.push(res.data)
    showAddPopup.value = false
    newProjet.value = { code: '', description: '', adresse: '', wilaya: '' }
    validationErrors.value = { code: '', adresse: '', wilaya: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(projet: Projet) {
  projetToDelete.value = projet
}

function confirmUpdate(projet: Projet) {
  projetToUpdate.value = { ...projet }
}

async function updateProjet() {
  if (!projetToUpdate.value) return
  try {
    const projetToSend = {
      code: projetToUpdate.value.code,
      description: projetToUpdate.value.description,
      adresse: projetToUpdate.value.adresse,
      wilaya: projetToUpdate.value.wilaya
    }
    await axiosInstance.put(`projets/${projetToUpdate.value.code}/`, projetToSend)
    const index = projets.value.findIndex(p => p.code === projetToUpdate.value!.code)
    if (index !== -1) {
      projets.value[index] = { ...projetToUpdate.value }
    }
    projetToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteProjet() {
  if (!projetToDelete.value) return
  try {
    await axiosInstance.delete(`projets/${projetToDelete.value.code}/`)
    projets.value = projets.value.filter(p => p.code !== projetToDelete.value!.code)
    projetToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

// Validate required fields
function validateRequiredFields() {
  const errors = {
    code: '',
    adresse: '',
    wilaya: ''
  }
  
  let isValid = true
  
  if (!newProjet.value.code.trim()) {
    errors.code = 'Le code est requis'
    isValid = false
  }
  
  if (!newProjet.value.adresse.trim()) {
    errors.adresse = 'L\'adresse est requise'
    isValid = false
  }
  
  if (!newProjet.value.wilaya) {
    errors.wilaya = 'La wilaya est requise'
    isValid = false
  }
  
  validationErrors.value = errors
  return isValid
}

// Validate and add Projet
function validateAndAddProjet() {
  if (validateRequiredFields()) {
    addProjet()
  }
}

function exportCSV() {
  const headers = ['Code', 'Description', 'Adresse', 'Wilaya']
  const rows = filteredProjets.value.map(projet => [
    projet.code,
    projet.description || '',
    projet.adresse || '',
    projet.wilaya || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'projets.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchProjets()
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
</style>
