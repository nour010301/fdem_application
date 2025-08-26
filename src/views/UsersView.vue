<template>
  <div class="users-page-root">
    <div class="users-page-header">
      <h1 class="users-page-title">Gestion des utilisateurs</h1>
    </div>

    <!-- Profile Management Section -->
    <div v-if="!isRestrictedUser" class="profile-management-section">
      <div class="profile-actions">
        <!-- <button @click="showAddProfileModal = true" class="btn-primary">
          <i class="fas fa-plus-circle"></i> Ajouter un profil
        </button> -->
        <button @click="showDeleteProfileModal = true" class="btn-danger">
          <i class="fas fa-trash"></i> Supprimer un profil
        </button>
      </div>
    </div>

    <!-- Users Section -->
    <div class="users-section">
      <div class="users-actions">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Rechercher un utilisateur..." 
            class="search-input"
          />
          <i class="fas fa-search search-icon"></i>
        </div>
        <div v-if="currentUser?.profil === 2" class="status-filter">
          <select v-model="statusFilter" class="status-select">
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
        <button v-if="!isRestrictedUser" @click="openCreateAccountModal" class="btn-primary">
          <i class="fas fa-user-plus"></i> Créer un compte
        </button>
      </div>

      <!-- Users Table -->
      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Nom d'utilisateur</th>
              <th v-if="!isRestrictedUser">Email</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th v-if="!isRestrictedUser">Poste</th>
              <th v-if="!isRestrictedUser">Téléphone</th>
              <th v-if="!isRestrictedUser">Département</th>
              <th v-if="!isRestrictedUser">Profil</th>
              <th v-if="currentUser?.profil === 2">Statut</th>
              <th>Types de produit</th>
              <th>Produits</th>
              <th>Impression</th>
              <th>Téléchargement</th>
              <th>Plan</th>
              <th>Supprimer documents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.username }}</td>
              <td v-if="!isRestrictedUser">{{ user.email || '-' }}</td>
              <td>{{ user.nom || '-' }}</td>
              <td>{{ user.prenom || '-' }}</td>
              <td v-if="!isRestrictedUser">{{ user.poste || '-' }}</td>
              <td v-if="!isRestrictedUser">{{ user.telephone || '-' }}</td>
              <td v-if="!isRestrictedUser">{{ user.departement || '-' }}</td>
              <td v-if="!isRestrictedUser">{{ user.profil?.nom || '-' }}</td>
              <td v-if="currentUser?.profil === 2">
                <span :class="user.is_active ? 'status-active' : 'status-inactive'">
                  {{ user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td>
                <div class="dropdown">
                  <button class="dropdown-btn">
                    {{ user.types_produits?.length || 0 }} types
                    <i class="fas fa-chevron-down"></i>
                  </button>
                  <div class="dropdown-content">
                    <div v-if="user.types_produits?.length === 0">Aucun type</div>
                    <div v-for="typeId in user.types_produits || []" :key="typeId">
                      {{ getTypeProduitName(typeId) }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="dropdown">
                  <button class="dropdown-btn">
                    {{ user.produits?.length || 0 }} produits
                    <i class="fas fa-chevron-down"></i>
                  </button>
                  <div class="dropdown-content">
                    <div v-if="user.produits?.length === 0">Aucun produit</div>
                    <div v-for="produitId in user.produits || []" :key="produitId">
                      {{ getProduitNameById(produitId) }}
                    </div>
                  </div>
                </div>
              </td>
              <td>{{ user.impression ? 'Oui' : 'Non' }}</td>
              <td>{{ user.telechargement ? 'Oui' : 'Non' }}</td>
              <td>{{ user.plan ? 'Oui' : 'Non' }}</td>
              <td>{{ user.suppression ? 'Oui' : 'Non' }}</td>
              <td class="actions-cell">
                <button @click="editUser(user)" class="btn-icon btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button v-if="currentUser?.profil === 2 && user.is_active !== false" @click="confirmDeactivateUser(user)" class="btn-icon btn-deactivate" title="Désactiver">
                  <i class="fas fa-user-slash"></i>
                </button>
                <button v-if="currentUser?.profil === 2 && user.is_active === false" @click="confirmActivateUser(user)" class="btn-icon btn-activate" title="Activer">
                  <i class="fas fa-user-check"></i>
                </button>
                <button v-if="!isRestrictedUser" @click="confirmDeleteUser(user)" class="btn-icon btn-delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Profile Modal -->
    <div v-if="showAddProfileModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Ajouter un profil</h2>
          <button @click="showAddProfileModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="profileName">Nom du profil</label>
            <input type="text" id="profileName" v-model="newProfile.nom" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAddProfileModal = false" class="btn-secondary">Annuler</button>
          <button @click="addProfile" class="btn-primary" :disabled="!newProfile.nom">Ajouter</button>
        </div>
      </div>
    </div>

    <!-- Delete Profile Modal -->
    <div v-if="showDeleteProfileModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Supprimer un profil</h2>
          <button @click="showDeleteProfileModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="profileToDelete">Sélectionner un profil</label>
            <select id="profileToDelete" v-model="profileToDelete">
              <option value="">Sélectionner un profil</option>
              <option v-for="profile in profiles" :key="profile.id" :value="profile.id">
                {{ profile.nom }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteProfileModal = false" class="btn-secondary">Annuler</button>
          <button @click="deleteProfile" class="btn-danger" :disabled="!profileToDelete">Confirmer</button>
        </div>
      </div>
    </div>

    <!-- Create Account Modal -->
    <div v-if="showCreateAccountModal" class="modal">
      <div class="modal-content modal-large">
        <!-- Success Checkmark Overlay -->
        <div v-if="showSuccessCheckmark" class="success-overlay">
          <div class="success-checkmark">
            <i class="fas fa-check-circle"></i>
            <p>Compte créé avec succès!</p>
          </div>
        </div>
        
        <div class="modal-header">
          <h2>Créer un compte</h2>
          <button @click="showCreateAccountModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Stepper Header -->
          <div class="stepper-header">
            <div 
              v-for="(step, index) in visibleSteps" 
              :key="index"
              class="step"
              :class="{
                'active': currentStep === index,
                'completed': currentStep > index
              }"
              @click="goToStep(index)"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-title">{{ step }}</div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="step-content">
            <!-- Step 1: User Information (hidden for restricted users in edit mode) -->
            <div v-if="currentStep === 0 && !(isRestrictedUser && isEditMode)">
              <h2>Informations utilisateur</h2>
              <div class="form-group">
                <label for="username">Nom d'utilisateur *</label>
                <input 
                  type="text" 
                  id="username" 
                  v-model="userData.username" 
                  :class="{ 'error': validationErrors.username }"
                />
                <div v-if="validationErrors.username" class="error-message">{{ validationErrors.username }}</div>
              </div>
              <div class="form-group">
                <label for="password">Mot de passe *</label>
                <input 
                  type="password" 
                  id="password" 
                  v-model="userData.password" 
                  :class="{ 'error': validationErrors.password }"
                />
                <div v-if="validationErrors.password" class="error-message">{{ validationErrors.password }}</div>
              </div>
              <div class="form-group">
                <label for="role">Profil *</label>
                <select 
                  id="role" 
                  v-model="userData.profil"
                  :class="{ 'error': validationErrors.profil }"
                >
                  <option value="">Sélectionner un profil</option>
                  <option v-for="profile in profiles" :key="profile.id" :value="profile.id">
                    {{ profile.nom }}
                  </option>
                </select>
                <div v-if="validationErrors.profil" class="error-message">{{ validationErrors.profil }}</div>
              </div>
              <div class="form-group">
                <label for="poste">Poste *</label>
                <input 
                  type="text" 
                  id="poste" 
                  v-model="userData.poste" 
                  :class="{ 'error': validationErrors.poste }"
                />
                <div v-if="validationErrors.poste" class="error-message">{{ validationErrors.poste }}</div>
              </div>
              <div class="form-group">
                <label for="email">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="userData.email" 
                  :class="{ 'error': validationErrors.email }"
                />
                <div v-if="validationErrors.email" class="error-message">{{ validationErrors.email }}</div>
              </div>
              <div class="form-group">
                <label for="nom">Nom *</label>
                <input 
                  type="text" 
                  id="nom" 
                  v-model="userData.nom" 
                  :class="{ 'error': validationErrors.nom }"
                />
                <div v-if="validationErrors.nom" class="error-message">{{ validationErrors.nom }}</div>
              </div>
              <div class="form-group">
                <label for="prenom">Prénom *</label>
                <input 
                  type="text" 
                  id="prenom" 
                  v-model="userData.prenom" 
                  :class="{ 'error': validationErrors.prenom }"
                />
                <div v-if="validationErrors.prenom" class="error-message">{{ validationErrors.prenom }}</div>
              </div>
              <div class="form-group">
                <label for="telephone">Téléphone *</label>
                <input 
                  type="text" 
                  id="telephone" 
                  v-model="userData.telephone" 
                  :class="{ 'error': validationErrors.telephone }"
                />
                <div v-if="validationErrors.telephone" class="error-message">{{ validationErrors.telephone }}</div>
              </div>
              <div class="form-group">
                <label for="departement">Département *</label>
                <input 
                  type="text" 
                  id="departement" 
                  v-model="userData.departement" 
                  :class="{ 'error': validationErrors.departement }"
                />
                <div v-if="validationErrors.departement" class="error-message">{{ validationErrors.departement }}</div>
              </div>
            </div>
            
            <!-- Step 2: Type Produit Selection -->
            <div v-if="(currentStep === 1 && !isRestrictedUser) || (currentStep === 0 && isRestrictedUser && isEditMode)">
              <div class="step-header-with-actions">
                <h2>Sélection des Types de Produit</h2>
                <div class="global-actions">
                  <button @click="selectAllTypes" class="btn-select-all">Cocher tout</button>
                  <button @click="deselectAllTypes" class="btn-deselect-all">Décocher tout</button>
                </div>
              </div>
              <div v-if="loading" class="loading">Chargement...</div>
              <div v-else-if="errorTypesProduit" class="error">{{ errorTypesProduit }}</div>
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
            <div v-if="(currentStep === 2 && !isRestrictedUser) || (currentStep === 1 && isRestrictedUser && isEditMode)">
              <h2>Sélection des Produits</h2>
              <div v-if="loadingProduits" class="loading">Chargement...</div>
              <div v-else-if="errorProduits" class="error">{{ errorProduits }}</div>
              <div v-else>
                <div v-for="typeId in selectedTypesProduit" :key="typeId" class="produit-type-section">
                  <div class="type-header">
                    <h3>{{ getTypeProduitName(typeId) }}</h3>
                    <div class="type-actions">
                      <button @click="selectAllProductsForType(typeId)" class="btn-select-all">Cocher tout</button>
                      <button @click="deselectAllProductsForType(typeId)" class="btn-deselect-all">Décocher tout</button>
                    </div>
                  </div>
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

            <!-- Step 4: Permissions -->
            <div v-if="(currentStep === 3 && !isRestrictedUser) || (currentStep === 2 && isRestrictedUser && isEditMode)">
              <h2>Permissions</h2>
              <div class="permissions-container">
                <div class="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="impression" 
                    v-model="userPermissions.impression"
                  >
                  <label for="impression">Autoriser l'impression des documents</label>
                </div>
                <div class="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="telechargement" 
                    v-model="userPermissions.telechargement"
                  >
                  <label for="telechargement">Autoriser le téléchargement des documents</label>
                </div>
                <div class="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="plan" 
                    v-model="userPermissions.plan"
                  >
                  <label for="plan">Autoriser le téléchargement des plans (AutoCAD, ZIP)</label>
                </div>
                <div class="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="suppression" 
                    v-model="userPermissions.suppression"
                  >
                  <label for="suppression">Autoriser la suppression des documents</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="stepper-actions">
            <!-- Previous button -->
            <button 
              v-if="currentStep > 0" 
              @click="prevStep" 
              class="btn-secondary"
            >
              Précédent
            </button>
            
            <!-- Create account button (first step) -->
            <button 
              v-if="currentStep === 0 && !userToEdit?.id" 
              @click="validateAndCreateAccount" 
              class="btn-primary"
            >
              Créer le compte
            </button>
            
            <!-- Next button -->
            <button 
              v-if="currentStep < visibleSteps.length - 1" 
              @click="nextStep" 
              class="btn-primary"
              :disabled="!canProceed"
            >
              Suivant
            </button>
            
            <!-- Confirm button (last step) -->
            <button 
              v-if="currentStep === visibleSteps.length - 1 && userToEdit?.id" 
              @click="handleConfirmClick"
              class="btn-primary"
            >
              Confirmer
            </button>
            
            <!-- Cancel button -->
            <button 
              @click="showCreateAccountModal = false" 
              class="btn-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete User Confirmation Modal -->
    <div v-if="showDeleteUserModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirmer la suppression</h2>
          <button @click="showDeleteUserModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer l'utilisateur {{ userToDelete?.nom || userToDelete?.username }} ?</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteUserModal = false" class="btn-secondary">Annuler</button>
          <button @click="deleteUser" class="btn-danger">Confirmer</button>
        </div>
      </div>
    </div>

    <!-- Activate/Deactivate User Confirmation Modal -->
    <div v-if="showStatusChangeModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ statusChangeAction === 'activate' ? 'Activer' : 'Désactiver' }} l'utilisateur</h2>
          <button @click="showStatusChangeModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir {{ statusChangeAction === 'activate' ? 'activer' : 'désactiver' }} l'utilisateur suivant ?</p>
          <div class="user-info">
            <p><strong>Nom d'utilisateur:</strong> {{ userToChangeStatus?.username }}</p>
            <p><strong>Nom:</strong> {{ userToChangeStatus?.nom || '-' }}</p>
            <p><strong>Prénom:</strong> {{ userToChangeStatus?.prenom || '-' }}</p>
            <p><strong>Email:</strong> {{ userToChangeStatus?.email || '-' }}</p>
            <p><strong>Poste:</strong> {{ userToChangeStatus?.poste || '-' }}</p>
            <p><strong>Profil:</strong> {{ userToChangeStatus?.profil?.nom || '-' }}</p>
            <p><strong>Statut actuel:</strong> 
              <span :class="userToChangeStatus?.is_active ? 'status-active' : 'status-inactive'">
                {{ userToChangeStatus?.is_active ? 'Actif' : 'Inactif' }}
              </span>
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showStatusChangeModal = false" class="btn-secondary">Annuler</button>
          <button @click="executeStatusChange" :class="statusChangeAction === 'activate' ? 'btn-primary' : 'btn-danger'">
            {{ statusChangeAction === 'activate' ? 'Activer' : 'Désactiver' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import axiosInstance from '../axios';
import { useUserStore } from '../store/userStore';

// User type definition
interface User {
  id: number;
  username: string;
  email?: string | null;
  nom?: string | null;
  prenom?: string | null;
  poste?: string | null;
  telephone?: string | null;
  departement?: string | null;
  profil?: {
    id: number;
    nom: string;
  } | null;
  types_produits?: number[];
  produits?: number[];
  impression?: boolean;
  telechargement?: boolean;
  is_active?: boolean;
  plan?: boolean;
  suppression?: boolean;
}

// User management
const users = ref<User[]>([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const loading = ref(false);
const error = ref('');

// Profile management
interface Profile {
  id: number;
  nom: string;
}
const profiles = ref<Profile[]>([]);
const newProfile = ref({ nom: '' });
const profileToDelete = ref('');
const showAddProfileModal = ref(false);
const showDeleteProfileModal = ref(false);

// Account creation
const showCreateAccountModal = ref(false);
const showSuccessCheckmark = ref(false);
const steps = ['Informations utilisateur', 'Types de produit', 'Produits', 'Permissions'];
const currentStep = ref(0);
const isEditMode = ref(false);
const userData = ref({
  username: '',
  password: '',
  profil: '',
  poste: '',
  email: '',
  nom: '',
  prenom: '',
  telephone: '',
  departement: ''
});

// Type Produit data
interface TypeProduit {
  idTypeProduit: number;
  designation: string;
}
const typesProduit = ref<TypeProduit[]>([]);
const selectedTypesProduit = ref<number[]>([]);
const errorTypesProduit = ref('');

// Produit data
interface Produit {
  idProduit: number;
  designation: string;
}
const produits = ref<Record<number, Produit[]>>({});  // Object to store produits by type ID
const selectedProduits = ref<number[]>([]);
const loadingProduits = ref(false);
const errorProduits = ref('');

// User permissions
const userPermissions = ref({
  impression: false,
  telechargement: false,
  plan: false,
  suppression: false
});

// Validation errors
const validationErrors = ref({
  username: '',
  password: '',
  profil: '',
  poste: '',
  email: '',
  nom: '',
  prenom: '',
  telephone: '',
  departement: ''
});

// User deletion and editing
const showDeleteUserModal = ref(false);
const userToDelete = ref<User | null>(null);
const userToEdit = ref<User | null>(null);

// User status change
const showStatusChangeModal = ref(false);
const userToChangeStatus = ref<User | null>(null);
const statusChangeAction = ref<'activate' | 'deactivate'>('activate');

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axiosInstance.get('http://10.10.150.75:8000/api/utilisateurs/');
    users.value = response.data;
  } catch (err) {
    console.error('Error fetching users:', err);
    error.value = 'Erreur lors du chargement des utilisateurs.';
  } finally {
    loading.value = false;
  }
};

// Fetch profiles
const fetchProfiles = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axiosInstance.get('http://10.10.150.75:8000/api/profils/');
    profiles.value = response.data;
  } catch (err) {
    console.error('Error fetching profiles:', err);
    error.value = 'Erreur lors du chargement des profils.';
  } finally {
    loading.value = false;
  }
};

// Add profile
const addProfile = async () => {
  loading.value = true;
  
  try {
    const response = await axiosInstance.post('http://10.10.150.75:8000/api/profils/', {
      nom: newProfile.value.nom
    });
    
    if (response.status === 201 || response.status === 200) {
      await fetchProfiles();
      newProfile.value.nom = '';
      showAddProfileModal.value = false;
    }
  } catch (err) {
    console.error('Error adding profile:', err);
    error.value = 'Erreur lors de l\'ajout du profil.';
  } finally {
    loading.value = false;
  }
};

// Delete profile
const deleteProfile = async () => {
  loading.value = true;
  
  try {
    const response = await axiosInstance.delete('http://10.10.150.75:8000/api/profils/', {
      data: { id: profileToDelete.value }
    });
    
    if (response.status === 200 || response.status === 204) {
      await fetchProfiles();
      profileToDelete.value = '';
      showDeleteProfileModal.value = false;
    }
  } catch (err) {
    console.error('Error deleting profile:', err);
    error.value = 'Erreur lors de la suppression du profil.';
  } finally {
    loading.value = false;
  }
};

// Create account
const createAccount = async () => {
  loading.value = true;
  
  try {
    // Create the user account in the first step
    const response = await axiosInstance.post('http://10.10.150.75:8000/api/api/register/', userData.value);
    
    if (response.status === 201 || response.status === 200) {
      // Show success checkmark
      showSuccessCheckmark.value = true;
      
      // Auto-close modal and refresh after 2 seconds
      setTimeout(async () => {
        showSuccessCheckmark.value = false;
        showCreateAccountModal.value = false;
        resetUserData();
        await fetchUsers(); // Refresh the users list
      }, 2000);
    }
  } catch (err) {
    console.error('Error creating account:', err);
    error.value = 'Erreur lors de la création du compte.';
  } finally {
    loading.value = false;
  }
};

// Edit user
const editUser = (user: User) => {
  isEditMode.value = true;
  userToEdit.value = user;
  userData.value = {
    username: user.username,
    password: '',
    profil: user.profil?.id ? String(user.profil.id) : '',
    poste: user.poste || '',
    email: user.email || '',
    nom: user.nom || '',
    prenom: user.prenom || '',
    telephone: user.telephone || '',
    departement: user.departement || ''
  };
  
  // Load user's types_produits and produits
  selectedTypesProduit.value = user.types_produits || [];
  selectedProduits.value = user.produits || [];
  
  // Load user's permissions
  userPermissions.value = {
    impression: user.impression || false,
    telechargement: user.telechargement || false,
    plan: user.plan || false,
    suppression: user.suppression || false
  };
  
  // For restricted users, start at step 0 which corresponds to step 2 (Types de produit)
  // For non-restricted users, start at step 0 (Informations utilisateur)
  currentStep.value = 0;
  showCreateAccountModal.value = true;
};

// Delete user confirmation
const confirmDeleteUser = (user: User) => {
  userToDelete.value = user;
  showDeleteUserModal.value = true;
};

// Delete user
const deleteUser = async () => {
  if (!userToDelete.value) return;
  
  loading.value = true;
  
  try {
     const response = await axiosInstance.delete('http://10.10.150.75:8000/api/utilisateurs', {
      data: { id: userToDelete.value.id }
    });



    if (response.status === 200 || response.status === 204) {
      await fetchUsers();
      showDeleteUserModal.value = false;
      userToDelete.value = null;
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    error.value = 'Erreur lors de la suppression de l\'utilisateur.';
  } finally {
    loading.value = false;
  }
};

// Open create account modal
const openCreateAccountModal = () => {
  isEditMode.value = false;
  resetUserData();
  showCreateAccountModal.value = true;
};

// Reset user data
const resetUserData = () => {
  userData.value = {
    username: '',
    password: '',
    profil: '',
    poste: '',
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    departement: ''
  };
  selectedTypesProduit.value = [];
  selectedProduits.value = [];
  userPermissions.value = {
    impression: false,
    telechargement: false,
    plan: false,
    suppression: false
  };
  validationErrors.value = {
    username: '',
    password: '',
    profil: '',
    poste: '',
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    departement: ''
  };
  currentStep.value = 0;
  userToEdit.value = null;
  isEditMode.value = false;
  showSuccessCheckmark.value = false;
};

// Validate required fields
const validateRequiredFields = () => {
  const errors = {
    username: '',
    password: '',
    profil: '',
    poste: '',
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    departement: ''
  };
  
  let isValid = true;
  
  if (!userData.value.username.trim()) {
    errors.username = 'Le nom d\'utilisateur est requis';
    isValid = false;
  }
  
  if (!userData.value.password.trim()) {
    errors.password = 'Le mot de passe est requis';
    isValid = false;
  }
  
  if (!userData.value.profil) {
    errors.profil = 'Le profil est requis';
    isValid = false;
  }
  
  if (!userData.value.poste.trim()) {
    errors.poste = 'Le poste est requis';
    isValid = false;
  }
  
  if (!userData.value.email.trim()) {
    errors.email = 'L\'email est requis';
    isValid = false;
  }
  
  if (!userData.value.nom.trim()) {
    errors.nom = 'Le nom est requis';
    isValid = false;
  }
  
  if (!userData.value.prenom.trim()) {
    errors.prenom = 'Le prénom est requis';
    isValid = false;
  }
  
  if (!userData.value.telephone.trim()) {
    errors.telephone = 'Le téléphone est requis';
    isValid = false;
  }
  
  if (!userData.value.departement.trim()) {
    errors.departement = 'Le département est requis';
    isValid = false;
  }
  
  validationErrors.value = errors;
  return isValid;
};

// Validate and create account
const validateAndCreateAccount = () => {
  if (validateRequiredFields()) {
    createAccount();
  }
};

// Computed property for visible steps
const visibleSteps = computed(() => {
  if (isEditMode.value) {
    // For restricted users (profile 1), show only steps 2, 3, and 4 when editing
    if (isRestrictedUser.value) {
      return [steps[1], steps[2], steps[3]]; // Types de produit, Produits, Permissions
    }
    return steps; // All steps for non-restricted users
  }
  return [steps[0]]; // Only first step for creating new accounts
});

// Navigation functions
const goToStep = (step: number) => {
  // Only allow going to completed steps or the next available step
  if (step <= currentStep.value || step === currentStep.value + 1) {
    currentStep.value = step;
    
    // If moving to products step, fetch products for selected types
    // For restricted users, step 2 is actually the products step (index 1 in their visible steps)
    if ((isRestrictedUser.value && step === 1) || (!isRestrictedUser.value && step === 2)) {
      handleTypeProduitChange();
    }
  }
};

// Handle confirm button click in the last step
const handleConfirmClick = () => {
  if (userToEdit && userToEdit.value && userToEdit.value.id) {
    console.log('Confirming with user ID:', userToEdit.value.id);
    updateUserProductsAndTypes(userToEdit.value.id);
  } else {
    console.error('No user ID available for update');
    error.value = "Impossible de déterminer l'identifiant de l'utilisateur.";
    alert("Erreur: " + error.value);
  }
};

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value;
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      (user.username && user.username.toLowerCase().includes(query)) ||
      (user.nom && user.nom.toLowerCase().includes(query)) ||
      (user.prenom && user.prenom.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.poste && user.poste.toLowerCase().includes(query)) ||
      (user.profil && user.profil.nom && user.profil.nom.toLowerCase().includes(query))
    );
  }
  
  // Filter by status (only for admin informatique)
  if (currentUser.value?.profil === 2 && statusFilter.value !== 'all') {
    filtered = filtered.filter(user => {
      if (statusFilter.value === 'active') {
        return user.is_active !== false;
      } else if (statusFilter.value === 'inactive') {
        return user.is_active === false;
      }
      return true;
    });
  }
  
  return filtered;
});

const canProceed = computed(() => {
  if (isRestrictedUser.value && isEditMode.value) {
    // For restricted users in edit mode
    if (currentStep.value === 0) {
      // Step 0 is Types de produit for restricted users
      return selectedTypesProduit.value.length > 0;
    }
    return true;
  } else {
    // For non-restricted users
    if (currentStep.value === 0) {
      return userData.value.username && 
             userData.value.password && 
             userData.value.profil && 
             userData.value.poste;
    } else if (currentStep.value === 1) {
      return selectedTypesProduit.value.length > 0;
    }
    return true;
  }
});



// Fetch Types Produit
const fetchTypesProduit = async () => {
  loading.value = true;
  errorTypesProduit.value = '';
  
  try {
    const response = await axiosInstance.get('http://10.10.150.75:8000/api/types/');
    typesProduit.value = response.data;
  } catch (err) {
    console.error('Error fetching types produit:', err);
    errorTypesProduit.value = 'Erreur lors du chargement des types de produit.';
  } finally {
    loading.value = false;
  }
};

// Fetch Produits by Type
const fetchProduitsByType = async (typeId: number): Promise<void> => {
  if (!produits.value[typeId]) {
    loadingProduits.value = true;
    errorProduits.value = '';
    
    try {
      const response = await axiosInstance.get<Produit[]>(`http://10.10.150.75:8000/api/produits/by-type/${typeId}/`);
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

// Select all type produits
const selectAllTypes = () => {
  selectedTypesProduit.value = typesProduit.value.map(type => type.idTypeProduit);
  handleTypeProduitChange();
};

// Deselect all type produits
const deselectAllTypes = () => {
  selectedTypesProduit.value = [];
  selectedProduits.value = [];
};

// Get Type Produit name by ID
const getTypeProduitName = (typeId: number) => {
  const type = typesProduit.value.find(t => t.idTypeProduit === typeId);
  console.log('Looking for type ID:', typeId, 'Found:', type, 'All types:', typesProduit.value);
  return type ? type.designation : `Type ${typeId}`;
};

// Get Produits by Type ID
const getProduitsByType = (typeId: number) => {
  return produits.value[typeId] || [];
};

// Get Produit name by ID
const getProduitNameById = (produitId: number) => {
  // Search through all produits in all types
  for (const typeId in produits.value) {
    const found = produits.value[typeId].find(p => p.idProduit === produitId);
    if (found) {
      return found.designation;
    }
  }
  return `Produit ${produitId}`;
};

// Select all products for a specific type
const selectAllProductsForType = (typeId: number) => {
  const typeProducts = getProduitsByType(typeId);
  typeProducts.forEach(produit => {
    if (!selectedProduits.value.includes(produit.idProduit)) {
      selectedProduits.value.push(produit.idProduit);
    }
  });
};

// Deselect all products for a specific type
const deselectAllProductsForType = (typeId: number) => {
  const typeProducts = getProduitsByType(typeId);
  const productIds = typeProducts.map(p => p.idProduit);
  selectedProduits.value = selectedProduits.value.filter(id => !productIds.includes(id));
};

// Update user products and types
const updateUserProductsAndTypes = async (userId: number) => {
  loading.value = true;
  
  try {
    console.log('Updating user products and types:', {
      user_id: userId,
      produits: selectedProduits.value,
      types_produits: selectedTypesProduit.value
    });
    
    const response = await axiosInstance.post('http://10.10.150.75:8000/api/utilisateurs/update-produits-types/', {
      user_id: userId,
      produits: selectedProduits.value,
      types_produits: selectedTypesProduit.value,
      impression: userPermissions.value.impression,
      telechargement: userPermissions.value.telechargement,
      plan: userPermissions.value.plan,
      suppression: userPermissions.value.suppression
    });
    
    if (response.status === 200 || response.status === 201) {
      alert('Mise à jour réussie!');
      resetUserData();
      showCreateAccountModal.value = false;
      await fetchUsers();
    }
  } catch (err) {
    console.error('Error updating user products and types:', err);
    error.value = 'Erreur lors de la mise à jour des produits et types.';
    alert('Erreur: ' + error.value);
  } finally {
    loading.value = false;
  }
};

// Navigation functions
const nextStep = () => {
  if (currentStep.value < visibleSteps.value.length - 1) {
    currentStep.value++;
    
    // If moving to products step, fetch products for selected types
    // For restricted users, step 1 is the products step, for others it's step 2
    if ((isRestrictedUser.value && currentStep.value === 1) || (!isRestrictedUser.value && currentStep.value === 2)) {
      handleTypeProduitChange();
    }
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// Fetch all produits for existing users
const fetchAllUserProduits = async () => {
  const allTypeIds = new Set<number>();
  
  // Collect all type IDs from all users
  users.value.forEach(user => {
    user.types_produits?.forEach(typeId => allTypeIds.add(typeId));
  });
  
  // Fetch produits for each type
  for (const typeId of allTypeIds) {
    await fetchProduitsByType(typeId);
  }
};

// User store for current user permissions
const { currentUser, fetchUserProfile } = useUserStore();

// Check if current user has profile 1 (restricted user)
const isRestrictedUser = computed(() => currentUser.value?.profil === 1);

// Confirm activate user
const confirmActivateUser = (user: User) => {
  userToChangeStatus.value = user;
  statusChangeAction.value = 'activate';
  showStatusChangeModal.value = true;
};

// Confirm deactivate user
const confirmDeactivateUser = (user: User) => {
  userToChangeStatus.value = user;
  statusChangeAction.value = 'deactivate';
  showStatusChangeModal.value = true;
};

// Execute status change
const executeStatusChange = async () => {
  if (!userToChangeStatus.value) return;
  
  try {
    const endpoint = statusChangeAction.value === 'activate' ? 'activer' : 'desactiver';
    await axiosInstance.post(`http://10.10.150.75:8000/api/utilisateur/${userToChangeStatus.value.id}/${endpoint}/`);
    await fetchUsers();
    showStatusChangeModal.value = false;
    userToChangeStatus.value = null;
  } catch (err) {
    console.error(`Error ${statusChangeAction.value}ing user:`, err);
    error.value = `Erreur lors de l'${statusChangeAction.value === 'activate' ? 'activation' : 'désactivation'} de l'utilisateur.`;
  }
};

// Initialize data
onMounted(async () => {
  await fetchUserProfile();
  await fetchUsers();
  await fetchProfiles();
  await fetchTypesProduit();
  await fetchAllUserProduits();
  
  // Debug logging
  console.log('Current user:', currentUser.value);
  console.log('Current user profil:', currentUser.value?.profil);
  console.log('Users:', users.value);
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');

.users-page-root {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 2rem max(2vw, 25px);
  box-sizing: border-box;
  background: #f5f7fa;
}

.users-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.2em;
}

.users-page-title {
  color: #2c3e50;
  font-size: 2.5em;
  font-weight: 700;
  margin-bottom: 0.2em;
}

/* Profile Management Section */
.profile-management-section {
  background: #ffffff;
  padding: 1.5em;
  border-radius: 0.8em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2em;
}

.profile-actions {
  display: flex;
  gap: 1em;
}

/* Users Section */
.users-section {
  background: #ffffff;
  padding: 1.5em;
  border-radius: 0.8em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.users-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5em;
}

.search-bar {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.8em 2.5em 0.8em 1em;
  border-radius: 0.5em;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  font-size: 1em;
  outline: none;
}

.search-icon {
  position: absolute;
  right: 1em;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

/* Users Table */
.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1em;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.users-table tr:hover {
  background: #f5f7fa;
}

.actions-cell {
  display: flex;
  gap: 0.5em;
}

/* Buttons */
.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.8em 1.5em;
  border-radius: 0.5em;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.8em 1.5em;
  border-radius: 0.5em;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-danger {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.8em 1.5em;
  border-radius: 0.5em;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0.5em;
  border-radius: 0.3em;
  transition: background 0.2s;
}

.btn-edit {
  color: #3498db;
}

.btn-edit:hover {
  background: rgba(52, 152, 219, 0.1);
}

.btn-delete {
  color: #e74c3c;
}

.btn-delete:hover {
  background: rgba(231, 76, 60, 0.1);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.8em;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5em;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #95a5a6;
}

.modal-body {
  padding: 1.5em;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  padding: 1.5em;
  border-top: 1px solid #eee;
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

.form-group input,
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

.form-group input:focus,
.form-group select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-group input.error,
.form-group select.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

.error-message {
  color: #e74c3c;
  font-size: 0.85em;
  margin-top: 0.3em;
  font-weight: 500;
}

.form-group label {
  display: block;
  margin-bottom: 0.5em;
  color: #2c3e50;
  font-weight: 600;
}

.form-group label:has(+ input.error),
.form-group label:has(+ select.error) {
  color: #e74c3c;
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

.stepper-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  margin-top: 2em;
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

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.type-header h3 {
  margin: 0;
  color: #2c3e50;
}

.type-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-select-all, .btn-deselect-all {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-select-all:hover {
  background: #229954;
}

.btn-deselect-all {
  background: #e67e22;
}

.btn-deselect-all:hover {
  background: #d35400;
}

.step-header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.step-header-with-actions h2 {
  margin: 0;
  color: #2c3e50;
}

.global-actions {
  display: flex;
  gap: 0.5rem;
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

.permissions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

/* Dropdown styles */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-btn {
  background-color: #f1f1f1;
  color: #333;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 120px;
}

.dropdown-btn i {
  margin-left: 8px;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #fff;
  min-width: 200px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 4px;
}

.dropdown-content div {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #f1f1f1;
}

.dropdown:hover .dropdown-content {
  display: block;
}

/* Status filter */
.status-filter {
  margin: 0 1rem;
}

.status-select {
  padding: 0.8em;
  border-radius: 0.5em;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  font-size: 1em;
  outline: none;
}

/* Status badges */
.status-active {
  background: #d4edda;
  color: #155724;
  padding: 0.3em 0.8em;
  border-radius: 0.3em;
  font-size: 0.85em;
  font-weight: 600;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
  padding: 0.3em 0.8em;
  border-radius: 0.3em;
  font-size: 0.85em;
  font-weight: 600;
}

/* Activate/Deactivate buttons */
.btn-activate {
  color: #28a745;
}

.btn-activate:hover {
  background: rgba(40, 167, 69, 0.1);
}

.btn-deactivate {
  color: #ffc107;
}

.btn-deactivate:hover {
  background: rgba(255, 193, 7, 0.1);
}

/* User info in modal */
.user-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.user-info p {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.user-info strong {
  font-weight: 600;
  margin-right: 0.5rem;
}
</style>