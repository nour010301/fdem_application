import { ref, computed } from 'vue'
import axiosInstance from '../axios'

interface UserProfile {
  idUser: number
  username: string
  email: string
  poste: string
  telephone: string
  departement: string
  nom: string
  prenom: string
  profil: number
  types_produits: number[]
  produits: number[]
  impression?: boolean
  telechargement?: boolean
  plan?: boolean
  suppression?: boolean
}

const currentUser = ref<UserProfile | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Role definitions
const ROLES = {
  ADMIN_FONCTIONNEL: 1,
  ADMIN_INFORMATIQUE: 2,
  CONSULTATION: 3,
  MISE_A_JOUR: 4
} as const

export const useUserStore = () => {
  const fetchUserProfile = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosInstance.get('profile/')
      currentUser.value = response.data
    } catch (e: any) {
      error.value = e?.message || 'Erreur lors de la récupération du profil'
      console.error('Error fetching user profile:', e)
    } finally {
      loading.value = false
    }
  }

  const userRole = computed(() => currentUser.value?.profil || null)
  
  const isAdminFonctionnel = computed(() => userRole.value === ROLES.ADMIN_FONCTIONNEL)
  const isAdminInformatique = computed(() => userRole.value === ROLES.ADMIN_INFORMATIQUE)
  const isConsultation = computed(() => userRole.value === ROLES.CONSULTATION)
  const isMiseAJour = computed(() => userRole.value === ROLES.MISE_A_JOUR)
  
  // Permission checks
  const canManageUsers = computed(() => isAdminFonctionnel.value || isAdminInformatique.value)
  const canAddDocuments = computed(() => isAdminFonctionnel.value || isAdminInformatique.value || isMiseAJour.value)
  const canDeleteItems = computed(() => isAdminFonctionnel.value || isAdminInformatique.value)
  const canExportCSV = computed(() => isAdminFonctionnel.value || isAdminInformatique.value)
  const canViewBibliothequeActions = computed(() => isAdminFonctionnel.value || isAdminInformatique.value)
  const canViewStructurePages = computed(() => isAdminInformatique.value)
  
  // Bibliotheque pages permissions - only ADMIN_INFORMATIQUE (profile 2) has access
  const canAccessBibliothequePages = computed(() => isAdminInformatique.value)

  return {
    user: computed(() => currentUser.value),
    currentUser: computed(() => currentUser.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchUserProfile,
    userRole,
    isAdminFonctionnel,
    isAdminInformatique,
    isConsultation,
    isMiseAJour,
    canManageUsers,
    canAddDocuments,
    canDeleteItems,
    canExportCSV,
    canViewBibliothequeActions,
    canViewStructurePages,
    canAccessBibliothequePages,
    ROLES
  }
}