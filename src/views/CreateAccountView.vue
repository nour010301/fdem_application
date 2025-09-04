<template>
  <div class="account-creation-root">
    <div class="account-creation-header">
      <h1 class="account-creation-title">Créer un compte</h1>
    </div>

    <div class="account-creation-form">
      <!-- Stepper Header -->
      <div class="stepper-header">
        <div 
          v-for="(step, index) in steps" 
          :key="index" 
          class="step" 
          :class="{ 'active': currentStep === index, 'completed': currentStep > index }"
          @click="goToStep(index)"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-title">{{ step }}</div>
        </div>
      </div>

      <!-- Step 1: User Information -->
      <div v-if="currentStep === 0" class="step-content">
        <h2>Informations utilisateur</h2>
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input type="text" id="username" v-model="userData.username" required>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" v-model="userData.password" required>
        </div>

        <div class="form-group">
          <label for="role">Rôle</label>
          <select id="role" v-model="userData.role" required>
            <option value="" disabled selected>Sélectionnez un rôle</option>
            <option v-for="roleOption in roleOptions" :key="roleOption.value" :value="roleOption.value">
              {{ roleOption.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="poste">Poste</label>
          <select id="poste" v-model="userData.poste" required>
            <option value="" disabled selected>Sélectionnez un poste</option>
            <option v-for="posteOption in posteOptions" :key="posteOption.value" :value="posteOption.value">
              {{ posteOption.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Step 2: Type Produit Selection -->
      <div v-if="currentStep === 1" class="step-content">
        <h2>Sélection des Types de Produit</h2>
        <div v-if="loading" class="loading">Chargement...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else class="checkbox-container">
          <div v-for="type in typesProduit" :key="type.idTypeProduit" class="checkbox-item">
            <input 
              type="checkbox" 
              :id="`type-${type.idTypeProduit}`" 
              :value="type.idTypeProduit"
              v-model="selectedTypesProduit"
              @change="handleTypeProduitChange"
            >
            <label :for="`type-${type.idTypeProduit}`">{{ type.designation }}</label>
          </div>
        </div>
      </div>

      <!-- Step 3: Produit Selection -->
      <div v-if="currentStep === 2" class="step-content">
        <h2>Sélection des Produits</h2>
        <div v-if="loadingProduits" class="loading">Chargement...</div>
        <div v-else-if="errorProduits" class="error">{{ errorProduits }}</div>
        <div v-else>
          <div v-for="typeId in selectedTypesProduit" :key="typeId" class="produit-type-section">
            <h3>{{ getTypeProduitName(typeId) }}</h3>
            <div class="checkbox-container">
              <div v-for="produit in getProduitsByType(typeId)" :key="produit.idProduit" class="checkbox-item">
                <input 
                  type="checkbox" 
                  :id="`produit-${produit.idProduit}`" 
                  :value="produit.idProduit"
                  v-model="selectedProduits"
                >
                <label :for="`produit-${produit.idProduit}`">{{ produit.designation }}</label>
              </div>
            </div>
          </div>
          <div v-if="selectedTypesProduit.length === 0" class="no-types-selected">
            Veuillez sélectionner au moins un type de produit à l'étape précédente.
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="stepper-actions">
        <button 
          v-if="currentStep > 0" 
          @click="prevStep" 
          class="btn-secondary"
        >
          Précédent
        </button>
        <button 
          v-if="currentStep < steps.length - 1" 
          @click="nextStep" 
          class="btn-primary"
          :disabled="!canProceed"
        >
          Suivant
        </button>
        <button 
          v-else 
          @click="createAccount" 
          class="submit-button"
          :disabled="loading"
        >
          {{ loading ? 'Création...' : 'Créer le compte' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import axiosInstance from '../axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// Stepper configuration
const steps = ['Informations utilisateur', 'Types de produit', 'Produits'];
const currentStep = ref(0);

// User data
const userData = ref({
  username: '',
  password: '',
  role: '',
  poste: '',
});

// Role and Poste options
const roleOptions = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'user', label: 'Utilisateur' },
  { value: 'manager', label: 'Manager' },
];

const posteOptions = [
  { value: 'CSI', label: 'CSI' },
  { value: 'Developer', label: 'Développeur' },
  { value: 'Designer', label: 'Designer' },
];

// Type Produit data
interface TypeProduit {
  idTypeProduit: number;
  designation: string;
}
const typesProduit = ref<TypeProduit[]>([]);
const selectedTypesProduit = ref<number[]>([]);
const loading = ref(false);
const error = ref('');

// Produit data
const produits = ref<Record<number, Produit[]>>({});  // Object to store produits by type ID
const selectedProduits = ref([]);
const loadingProduits = ref(false);
const errorProduits = ref('');

// Fetch Types Produit
const fetchTypesProduit = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axiosInstance.get('types/');
    typesProduit.value = response.data;
  } catch (err) {
    console.error('Error fetching types produit:', err);
    error.value = 'Erreur lors du chargement des types de produit.';
  } finally {
    loading.value = false;
  }
};

// Fetch Produits by Type
interface Produit {
  idProduit: number;
  designation: string;
  // Add other fields if needed
}

const fetchProduitsByType = async (typeId: number): Promise<void> => {
  if (!produits.value[typeId]) {
    loadingProduits.value = true;
    errorProduits.value = '';
    
    try {
      const response = await axiosInstance.get<Produit[]>(`produits/by-type/${typeId}/`);
      produits.value[typeId] = response.data;
    } catch (err) {
      console.error(`Error fetching produits for type ${typeId}:`, err);
      errorProduits.value = 'Erreur lors du chargement des produits.';
    } finally {
      loadingProduits.value = false;
    }
  }
};

// Handle Type Produit selection change
const handleTypeProduitChange = async () => {
  // Fetch produits for all selected types
  for (const typeId of selectedTypesProduit.value) {
    await fetchProduitsByType(typeId);
  }
  
  // Remove produits from selection if their type is no longer selected
  selectedProduits.value = selectedProduits.value.filter(produitId => {
    // Find which type this produit belongs to
    for (const typeId in produits.value) {
      const typeProducts = produits.value[typeId];
      const found = typeProducts.find((p: Produit) => p.idProduit === produitId);
      if (found && selectedTypesProduit.value.includes(parseInt(typeId))) {
        return true;
      }
    }
    return false;
  });
};

// Get Type Produit name by ID
const getTypeProduitName = (typeId: number) => {
  const type = typesProduit.value.find(t => t.idTypeProduit === typeId);
  return type ? type.designation : `Type ${typeId}`;
};

// Get Produits by Type ID
const getProduitsByType = (typeId: number) => {
  return produits.value[typeId] || [];
};

// Navigation functions
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const goToStep = (step: number) => {
  // Only allow going to completed steps or the next available step
  if (step <= currentStep.value || step === currentStep.value + 1) {
    currentStep.value = step;
  }
};

// Validation
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return userData.value.username && 
           userData.value.password && 
           userData.value.role && 
           userData.value.poste;
  } else if (currentStep.value === 1) {
    return selectedTypesProduit.value.length > 0;
  }
  return true;
});

// Create account
const createAccount = async () => {
  loading.value = true;
  
  try {
    const response = await axiosInstance.post('register/', {
      ...userData.value,
      typesProduit: selectedTypesProduit.value,
      produits: selectedProduits.value
    });
    
    if (response.status === 201 || response.status === 200) {
      alert('Compte créé avec succès!');
      router.push('/accounts'); // Redirect to accounts list or another appropriate page
    } else {
      alert('Erreur lors de la création du compte.');
    }
  } catch (error) {
    console.error('Error creating account:', error);
    alert('Erreur lors de la création du compte.');
  } finally {
    loading.value = false;
  }
};

// Initialize data
onMounted(() => {
  fetchTypesProduit();
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');

.account-creation-root {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 3rem max(2vw, 25px);
  box-sizing: border-box;
  background: #f5f7fa;
}

.account-creation-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.2em;
}

.account-creation-title {
  color: #2c3e50;
  font-size: 2.5em;
  font-weight: 700;
  margin-bottom: 0.2em;
}

.account-creation-form {
  background: #ffffff;
  padding: 2em;
  border-radius: 0.8em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Stepper styles */
.stepper-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.stepper-header::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  cursor: pointer;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 0.5em;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.step-title {
  color: #757575;
  font-size: 0.9em;
  text-align: center;
  max-width: 120px;
}

.step.active .step-number {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.step.completed .step-number {
  background: #2ecc71;
  color: white;
  border-color: #2ecc71;
}

/* Step content */
.step-content {
  margin-bottom: 2rem;
}

.step-content h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5em;
}

.step-content h3 {
  color: #3498db;
  margin: 1rem 0;
  font-size: 1.1em;
}

/* Form styles */
.form-group {
  margin-bottom: 1.5em;
}

.form-group label {
  display: block;
  margin-bottom: 0.5em;
  color: #2c3e50;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.8em;
  border-radius: 0.5em;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  font-size: 1em;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-group select {
  width: 100%;
  padding: 0.8em;
  border-radius: 0.5em;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  font-size: 1em;
  outline: none;
  transition: border-color 0.2s;
}

.form-group select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Checkbox styles */
.checkbox-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-radius: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.checkbox-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
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
}

.produit-type-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid #3498db;
}

/* Button styles */
.stepper-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary, .submit-button {
  padding: 0.7em 1.5em;
  border-radius: 0.5em;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #f8f9fa;
  border: 1px solid #3498db;
  color: #3498db;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.submit-button {
  background: #2ecc71;
  color: white;
}

.submit-button:hover {
  background: #27ae60;
}

.btn-primary:disabled, .submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Status messages */
.loading, .error, .no-types-selected {
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  text-align: center;
}

.loading {
  background: #e3f2fd;
  color: #1976d2;
}

.error {
  background: #ffebee;
  color: #c62828;
}

.no-types-selected {
  background: #fff8e1;
  color: #ff8f00;
}
</style>