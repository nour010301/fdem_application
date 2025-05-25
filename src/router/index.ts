import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
const PagesLayout = () => import('../layouts/PagesLayout.vue')

import axios from '../axios.ts'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import Documents from '../views/Documents.vue'
import AddDocView from '../views/AddDocView.vue'
import BetView from '../views/BetView.vue'
import FournisseurView from '../views/FournisseurView.vue'
import DirecteurView from '../views/DirecteurView.vue'
import ProjetProduitView from '../views/ProjetProduitView.vue'
import MaitreOeuvreView from '../views/MaitreOeuvreView.vue'
import MaitreOuvrageView from '../views/MaitreOuvrageView.vue'
import SoustraitantsView from '../views/SoustraitantsView.vue'
import ParametreView from '../views/ParametreView.vue'
import ProduitView from '../views/ProduitView.vue'
import TypeProduitView from '../views/TypeProduitView.vue'
import SectionView from '../views/SectionView.vue'
import StructuresView from '../views/StructuresView.vue'
import SubDivisionNv_1View from '../views/SubDivisionNv_1View.vue'
import SubDivisionNv_2View from '../views/SubDivisionNv_2View.vue'
import SubDivisionNv_3View from '../views/SubDivisionNv_3View.vue'
import CreateAccountView from '../views/CreateAccountView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login', // Redirect root path to /login
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true }, // Mark as public route
  },
  {
    path: '/logout',
    name: 'logout',
    component: {
      render: () => null, // Dummy component for logout
    },
    beforeEnter: async (_to, _from, next) => {
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (refresh) {
          await axios.post('http://10.10.150.75:8000/api/api/logout/', { refresh })
        }
      } catch (error) {
        console.warn('Logout failed or token already invalid', error)
      }

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      next('/login')
    },
    meta: { public: true }, // Also public route
  },
  {
    path: '/',
    component: PagesLayout,
    children: [
  {
    path: '/Accueil',
    name: 'Accueil',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/documents',
    name: 'Documents',
    component: Documents,
    meta: { requiresAuth: true },
  },
  {
    path: '/add-document',
    name: 'Add-document',
    component: AddDocView,
    meta: { requiresAuth: true },
  },
  {
    path: '/bur-etude-list',
    name: 'bur-etude-list',
    component: BetView,
    meta: { requiresAuth: true },
  },
  {
    path: '/list-fournisseur',
    name: 'list-fournisseur',
    component: FournisseurView,
    meta: { requiresAuth: true },
  },
  {
    path: '/list-directeur',
    name: 'list-directeur',
    component: DirecteurView,
    meta: { requiresAuth: true },
  },
  {
    path: '/list-projet-produit',
    name: 'list-projet-produit',
    component: ProjetProduitView,
    meta: { requiresAuth: true },
  },
  {
    path: '/maitre-oeuvre-list',
    name: 'maitre-oeuvre-list',
    component: MaitreOeuvreView,
    meta: { requiresAuth: true },
  },
  {
    path: '/maitre-ouvrage-list',
    name: 'maitre-ouvrage-list',
    component: MaitreOuvrageView,
    meta: { requiresAuth: true },
  },
  {
    path: '/soustraitants',
    name: 'soustraitants',
    component: SoustraitantsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/parametre',
    name: 'parametre',
    component: ParametreView,
    meta: { requiresAuth: true },
  },
  {
    path: '/produit',
    name: 'produit',
    component: ProduitView,
    meta: { requiresAuth: true },
  },
  {
    path: '/type_produit',
    name: 'typr_produit',
    component: TypeProduitView,
    meta: { requiresAuth: true },
  },
  {
    path: '/sections',
    name: 'sections',
    component: SectionView,
    meta: { requiresAuth: true },
  },
  {
    path: '/structures',
    name: 'structures',
    component: StructuresView,
    meta: { requiresAuth: true },
  },
  {
    path: '/subdivisions_niv1',
    name: 'subdivisions_niv1',
    component: SubDivisionNv_1View,
    meta: { requiresAuth: true },
  },
  {
    path: '/subdivisions_niv2',
    name: 'subdivisions_niv2',
    component: SubDivisionNv_2View,
    meta: { requiresAuth: true },
  },
  {
    path: '/subdivisions_niv3',
    name: 'subdivisions_niv3',
    component: SubDivisionNv_3View,
    meta: { requiresAuth: true },
  },
  {
    path: '/create_account',
    name: 'create_account',
    component: CreateAccountView,
    meta: { requiresAuth: true },
  },
   {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  },
]

  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'), // Catch-all 404 route
    meta: { public: true }, // Mark 404 as public so users can see it even if not logged in
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// --- AUTHENTICATION GUARD ---
router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public)
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoggedIn = !!localStorage.getItem('access_token')

  if (isPublic) return next()

  const token = localStorage.getItem('access_token')
  if (requiresAuth && !token) {
    return next({ name: 'Login' })
  }
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/login')
  }
  return next()
})


export default router
