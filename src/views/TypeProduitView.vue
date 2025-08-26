<template>
    <div class="page-wrapper">
      <h1>Types de Produits</h1>
  
      <div class="controls">
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher un type de produit..."
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
        <table v-if="filteredTypes.length > 0" class="product-table">
          <thead>
            <tr>
              <th @click="toggleSort('idTypeProduit')" class="sortable">
                ID
                <span v-if="sortColumn === 'idTypeProduit'">{{ sortAsc ? '▲' : '▼' }}</span>
              </th>
              <th @click="toggleSort('designation')" class="sortable">
                Désignation
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
            <tr v-for="type in paginatedTypes" :key="type.idTypeProduit">
              <td>{{ type.idTypeProduit }}</td>
              <td>{{ type.designation }}</td>
              <td>{{ type.description || '—' }}</td>
              <td>
              <button 
                class="update-button" 
                @click="confirmUpdate(type)"
                :class="{ 'disabled': userStore.loading.value || !userStore.canAccessBibliothequePages.value }"
                :disabled="userStore.loading.value || !userStore.canAccessBibliothequePages.value"
                title="Modifier"
              >
                ✎
              </button>
              <button 
                class="delete-button" 
                @click="confirmDelete(type)"
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
          <h2>Ajouter un Type de Produit</h2>
          <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
          <div class="form-group">
            <label>Sections *</label>
            <div class="checkbox-list" :class="{ 'error': validationErrors.sections }">
              <label v-for="section in sections" :key="section.idSectionProduit" 
                     class="checkbox-item"
                     :class="{ 'checked': newType.sections.includes(section.idSectionProduit) }">
                <input type="checkbox" 
                       :value="section.idSectionProduit"
                       @change="toggleSection(section.idSectionProduit)" 
                       :checked="newType.sections.includes(section.idSectionProduit)">
                {{ section.nom }}
              </label>
            </div>
            <div v-if="validationErrors.sections" class="error-message">{{ validationErrors.sections }}</div>
          </div>
          <div class="form-group">
            <label>Désignation *</label>
            <input 
              v-model="newType.designation" 
              placeholder="Désignation" 
              :class="{ 'error': validationErrors.designation }"
            />
            <div v-if="validationErrors.designation" class="error-message">{{ validationErrors.designation }}</div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newType.description" placeholder="Description (optionnelle)" />
          </div>
          <div class="modal-actions">
            <button @click="validateAndAddType">Ajouter</button>
            <button @click="closeModal" class="cancel">Fermer</button>
          </div>
        </div>
      </div>
      <!-- DELETE CONFIRMATION -->
      <div v-if="typeToDelete" class="modal-overlay">
        <div class="modal">
          <h2>Supprimer</h2>
          <p>Confirmez-vous la suppression de <strong>{{ typeToDelete.designation }}</strong> ?</p>
          <div class="modal-actions">
            <button @click="deleteType">Oui, supprimer</button>
            <button @click="typeToDelete = null" class="cancel">Annuler</button>
          </div>
        </div>
      </div>

    <!-- UPDATE MODAL -->
    <div v-if="typeToUpdate" class="modal-overlay">
      <div class="modal">
        <h2>Modifier Type de Produit</h2>
        <input v-model="typeToUpdate.designation" placeholder="Désignation" />
        <textarea v-model="typeToUpdate.description" placeholder="Description (optionnelle)" />
        <div class="modal-actions">
          <button @click="updateType">Modifier</button>
          <button @click="typeToUpdate = null" class="cancel">Annuler</button>
        </div>
      </div>
    </div>

    </div>
  </template>
  <script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import axiosInstance from '../axios'
  import { useUserStore } from '../store/userStore'
  
  interface Section {
  idSectionProduit: number
  nom: string
  designation: string
}

interface TypeProduit {
    idTypeProduit: number
    designation: string
    description: string
  }
  
  const types = ref<TypeProduit[]>([])
  const sections = ref<Section[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  
  const search = ref('')
  const currentPage = ref(1)
  const pageSize = 10
  
  const sortColumn = ref<'idTypeProduit' | 'designation' | 'description'>('idTypeProduit')
  const sortAsc = ref(true)
  

  const showAddPopup = ref(false)
  const newType = ref<{
    sections: number[]
    designation: string
    description: string
  }>({
    sections: [],
    designation: '',
    description: ''
  })
  const typeToDelete = ref<TypeProduit | null>(null)
  const typeToUpdate = ref<TypeProduit | null>(null)

  // Validation errors
  const validationErrors = ref({
    sections: '',
    designation: ''
  })

  // Success message
  const successMessage = ref('')

  // User store for role-based access control
  const userStore = useUserStore()

  async function fetchSections() {
    try {
      const res = await axiosInstance.get('sections/')
      sections.value = res.data
    } catch (e) {
      console.error('Erreur lors du chargement des sections', e)
    }
  }

  function toggleSection(sectionId: number) {
    const index = newType.value.sections.indexOf(sectionId)
    if (index > -1) {
      newType.value.sections.splice(index, 1)
    } else {
      newType.value.sections.push(sectionId)
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
  
  const filteredTypes = computed(() => {
    const s = search.value.trim().toLowerCase()
  
    const filtered = types.value.filter((type) =>
      type.designation.toLowerCase().includes(s) ||
      (type.description?.toLowerCase().includes(s) ?? false)
    )
  
    return filtered.sort((a, b) => {
      const fieldA = a[sortColumn.value]
      const fieldB = b[sortColumn.value]
  
      if (fieldA < fieldB) return sortAsc.value ? -1 : 1
      if (fieldA > fieldB) return sortAsc.value ? 1 : -1
      return 0
    })
  })
  
  const paginatedTypes = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredTypes.value.slice(start, start + pageSize)
  })
  
  const totalPages = computed(() => Math.ceil(filteredTypes.value.length / pageSize))
  
  async function fetchTypes() {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('Alltypes/')
      types.value = response.data
    } catch (e: any) {
      error.value = e?.message || 'Erreur inconnue'
    } finally {
      loading.value = false
    }
  }





  async function addType() {
  try {
    const typeToSend = {
      designation: newType.value.designation,
      description: newType.value.description,
      sections: newType.value.sections
    }
    const res = await axiosInstance.post('types/', typeToSend)
    types.value.push(res.data)
    // Keep modal open and preserve sections, only clear designation and description
    const selectedSections = [...newType.value.sections]
    newType.value = { sections: selectedSections, designation: '', description: '' }
    validationErrors.value = { sections: '', designation: '' }
    successMessage.value = 'Type de produit ajouté avec succès!'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e: any) {
    alert('Erreur lors de l’ajout : ' + (e?.message || 'Erreur inconnue'))
  }
}

function confirmDelete(type: TypeProduit) {
  typeToDelete.value = type
}

function confirmUpdate(type: TypeProduit) {
  typeToUpdate.value = { ...type }
}

async function updateType() {
  if (!typeToUpdate.value) return
  try {
    const typeToSend = {
      designation: typeToUpdate.value.designation,
      description: typeToUpdate.value.description
    }
    await axiosInstance.put(`types/${typeToUpdate.value.idTypeProduit}/`, typeToSend)
    const index = types.value.findIndex(t => t.idTypeProduit === typeToUpdate.value!.idTypeProduit)
    if (index !== -1) {
      types.value[index] = { ...typeToUpdate.value }
    }
    typeToUpdate.value = null
  } catch (e: any) {
    alert('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'))
  }
}

async function deleteType() {
  if (!typeToDelete.value) return
  try {
    await axiosInstance.delete(`types/${typeToDelete.value.idTypeProduit}/`)
    types.value = types.value.filter(t => t.idTypeProduit !== typeToDelete.value!.idTypeProduit)
    typeToDelete.value = null
  } catch (e: any) {
    alert('Erreur lors de la suppression : ' + (e?.message || 'Erreur inconnue'))
  }
}





  
  // Validate required fields
  function validateRequiredFields() {
    const errors = {
      sections: '',
      designation: ''
    }
    
    let isValid = true
    
    if (newType.value.sections.length === 0) {
      errors.sections = 'Au moins une section est requise'
      isValid = false
    }
    
    if (!newType.value.designation.trim()) {
      errors.designation = 'La désignation est requise'
      isValid = false
    }
    
    validationErrors.value = errors
    return isValid
  }

  // Validate and add Type
  function validateAndAddType() {
    if (validateRequiredFields()) {
      addType()
    }
  }

  // Close modal and reset all fields
  function closeModal() {
    showAddPopup.value = false
    newType.value = { sections: [], designation: '', description: '' }
    validationErrors.value = { sections: '', designation: '' }
    successMessage.value = ''
  }

  function exportCSV() {
    const headers = ['ID Type', 'Désignation', 'Description']
    const rows = filteredTypes.value.map(type => [
      type.idTypeProduit,
      type.designation,
      type.description || ''
    ])
  
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map(row => row.map(value => `"${value}"`).join(';'))
        .join('\n')
  
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'types_produits.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  onMounted(async () => {
    await userStore.fetchUserProfile()
    fetchTypes()
    fetchSections()
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
  padding: 0.4rem 0.8rem;
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
