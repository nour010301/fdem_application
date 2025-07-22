<template>
  <div class="page-wrapper">
    <h1>Fournisseurs</h1>

    <div class="controls">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un fournisseur..."
        class="search-input"
      />
      <button @click="exportCSV" class="export-button" :class="{ 'disabled': userStore.loading.value || !userStore.canExportCSV.value }" :disabled="userStore.loading.value || !userStore.canExportCSV.value">Exporter CSV</button>
      <button @click="showAddPopup = true" class="add-button" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value">+ Ajouter</button>
    </div>

    <div v-if="loading" class="info">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error }}</div>

    <div class="table-wrapper">
      <table v-if="filteredFournisseurs.length > 0" class="product-table">
        <thead>
          <tr>
            <th @click="toggleSort('idFournisseur')" class="sortable">
              ID
              <span v-if="sortColumn === 'idFournisseur'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="toggleSort('designationFournisseur')" class="sortable">
              Désignation
              <span v-if="sortColumn === 'designationFournisseur'">{{ sortAsc ? '▲' : '▼' }}</span>
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
          <tr v-for="fournisseur in paginatedFournisseurs" :key="fournisseur.idFournisseur">
            <td>{{ fournisseur.idFournisseur }}</td>
            <td>{{ fournisseur.designationFournisseur }}</td>
            <td>{{ fournisseur.description || '—' }}</td>
            <td>{{ fournisseur.adresse || '—' }}</td>
            <td>{{ fournisseur.telephone || '—' }}</td>
            <td>{{ fournisseur.email || '—' }}</td>
            <td>
              <button class="update-button" @click="confirmUpdate(fournisseur)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Modifier">✎</button>
              <button class="delete-button" @click="confirmDelete(fournisseur)" :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }" :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value" title="Supprimer">✕</button>
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
        <h2>Ajouter un Fournisseur</h2>
        <input v-model="newFournisseur.designationFournisseur" placeholder="Désignation" />
        <textarea v-model="newFournisseur.description" placeholder="Description (optionnelle)" />
        <input v-model="newFournisseur.adresse" placeholder="Adresse" />
        <input v-model="newFournisseur.telephone" placeholder="Téléphone" />
        <input v-model="newFournisseur.email" placeholder="Email" />
        <div class="modal-actions">
          <button @click="addFournisseur">Ajouter</button>
          <button @click="showAddPopup = false" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="fournisseurToDelete" class="modal-overlay">
      <div class="modal">
        <h2>Supprimer</h2>
        <p>Confirmez-vous la suppression de <strong>{{ fournisseurToDelete.designationFournisseur }}</strong> ?</p>
        <div class="modal-actions">
          <button @click="deleteFournisseur">Oui, supprimer</button>
          <button @click="fournisseurToDelete = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    <!-- UPDATE MODAL -->
    <div v-if="fournisseurToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Fournisseur</h2>
        <input v-model="fournisseurToUpdate.designationFournisseur" placeholder="Désignation" />
        <textarea v-model="fournisseurToUpdate.description" placeholder="Description (optionnelle)" />
        <input v-model="fournisseurToUpdate.adresse" placeholder="Adresse" />
        <input v-model="fournisseurToUpdate.telephone" placeholder="Téléphone" />
        <input v-model="fournisseurToUpdate.email" placeholder="Email" />
        <div class="modal-actions">
          <button @click="updateFournisseur">Modifier</button>
          <button @click="fournisseurToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

interface Fournisseur {
  idFournisseur: number
  designationFournisseur: string
  description: string
  adresse: string
  telephone: string
  email: string
}

const fournisseurs = ref<Fournisseur[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const currentPage = ref(1)
const pageSize = 10

const sortColumn = ref<'idFournisseur' | 'designationFournisseur' | 'description' | 'adresse' | 'telephone' | 'email'>('idFournisseur')
const sortAsc = ref(true)

const showAddPopup = ref(false)
const newFournisseur = ref({ designationFournisseur: '', description: '', adresse: '', telephone: '', email: '' })
const fournisseurToDelete = ref<Fournisseur | null>(null)
const fournisseurToUpdate = ref<Fournisseur | null>(null)

const userStore = useUserStore()

function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortColumn.value = column
    sortAsc.value = true
  }
}

const filteredFournisseurs = computed(() => {
  const s = search.value.trim().toLowerCase()

  const filtered = fournisseurs.value.filter((fournisseur) =>
    fournisseur.designationFournisseur.toLowerCase().includes(s) ||
    (fournisseur.description?.toLowerCase().includes(s) ?? false) ||
    (fournisseur.adresse?.toLowerCase().includes(s) ?? false) ||
    (fournisseur.telephone?.toLowerCase().includes(s) ?? false) ||
    (fournisseur.email?.toLowerCase().includes(s) ?? false)
  )

  return filtered.sort((a, b) => {
    const fieldA = a[sortColumn.value]
    const fieldB = b[sortColumn.value]

    if (fieldA < fieldB) return sortAsc.value ? -1 : 1
    if (fieldA > fieldB) return sortAsc.value ? 1 : -1
    return 0
  })
})

const paginatedFournisseurs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredFournisseurs.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredFournisseurs.value.length / pageSize))

async function fetchFournisseurs() {
  loading.value = true
  error.value = null
  try {
    const response = await axiosInstance.get('fournisseurs/')
    fournisseurs.value = response.data
  } catch (e: any) {
    error.value = e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function addFournisseur() {
  try {
    const res = await axiosInstance.post('fournisseurs/', newFournisseur.value)
    fournisseurs.value.push(res.data)
    showAddPopup.value = false
    newFournisseur.value = { designationFournisseur: '', description: '', adresse: '', telephone: '', email: '' }
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(fournisseur: Fournisseur) {
  fournisseurToDelete.value = fournisseur
}

function confirmUpdate(fournisseur: Fournisseur) {
  fournisseurToUpdate.value = { ...fournisseur }
}

async function updateFournisseur() {
  if (!fournisseurToUpdate.value) return
  try {
    const fournisseurToSend = {
      designationFournisseur: fournisseurToUpdate.value.designationFournisseur,
      description: fournisseurToUpdate.value.description,
      adresse: fournisseurToUpdate.value.adresse,
      telephone: fournisseurToUpdate.value.telephone,
      email: fournisseurToUpdate.value.email
    }
    await axiosInstance.put(`fournisseurs/${fournisseurToUpdate.value.idFournisseur}/`, fournisseurToSend)
    const index = fournisseurs.value.findIndex(f => f.idFournisseur === fournisseurToUpdate.value!.idFournisseur)
    if (index !== -1) {
      fournisseurs.value[index] = { ...fournisseurToUpdate.value }
    }
    fournisseurToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteFournisseur() {
  if (!fournisseurToDelete.value) return
  try {
    await axiosInstance.delete(`fournisseurs/${fournisseurToDelete.value.idFournisseur}/`)
    fournisseurs.value = fournisseurs.value.filter(f => f.idFournisseur !== fournisseurToDelete.value!.idFournisseur)
    fournisseurToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}

function exportCSV() {
  const headers = ['ID', 'Désignation', 'Description', 'Adresse', 'Téléphone', 'Email']
  const rows = filteredFournisseurs.value.map(fournisseur => [
    fournisseur.idFournisseur,
    fournisseur.designationFournisseur,
    fournisseur.description || '',
    fournisseur.adresse || '',
    fournisseur.telephone || '',
    fournisseur.email || ''
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(';'))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'fournisseurs.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  fetchFournisseurs()
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
</style>
