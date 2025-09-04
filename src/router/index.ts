import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
const PagesLayout = () => import('../layouts/PagesLayout.vue')


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
import SubDivisionNv_4View from '../views/SubDivisionNv_4View.vue'
import UsersView from '../views/UsersView.vue'
import ProfileView from '../views/ProfileView.vue'
import axiosInstance from '../axios.ts'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true, title: 'Login' },
  },
  {
    path: '/logout',
    name: 'logout',
    component: {
      render: () => null,
    },
    beforeEnter: async (_to, _from, next) => {
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (refresh) {
          await axiosInstance.post('api/logout/', { refresh })
        }
      } catch (error) {
        console.warn('Logout failed or token already invalid', error)
      }

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      next('/login')
    },
    meta: { public: true, title: 'Logout' },
  },
  {
    path: '/',
    component: PagesLayout,
    children: [
      {
        path: '/Accueil',
        name: 'Accueil',
        component: DashboardView,
        meta: { requiresAuth: true, title: 'Accueil' },
      },
      {
        path: '/documents',
        name: 'Documents',
        component: Documents,
        meta: { requiresAuth: true, title: 'Documents' },
      },
      {
        path: '/add-document',
        name: 'Add-document',
        component: AddDocView,
        meta: { requiresAuth: true, title: 'Add Document' },
      },
      {
        path: '/bur-etude-list',
        name: 'bur-etude-list',
        component: BetView,
        meta: { requiresAuth: true, title: 'Bureau Étude List' },
      },
      {
        path: '/list-fournisseur',
        name: 'list-fournisseur',
        component: FournisseurView,
        meta: { requiresAuth: true, title: 'Fournisseur List' },
      },
      {
        path: '/list-directeur',
        name: 'list-directeur',
        component: DirecteurView,
        meta: { requiresAuth: true, title: 'Directeur List' },
      },
      {
        path: '/list-projet-produit',
        name: 'list-projet-produit',
        component: ProjetProduitView,
        meta: { requiresAuth: true, title: 'Projet Produit List' },
      },
      {
        path: '/maitre-oeuvre-list',
        name: 'maitre-oeuvre-list',
        component: MaitreOeuvreView,
        meta: { requiresAuth: true, title: 'Maître Oeuvre List' },
      },
      {
        path: '/maitre-ouvrage-list',
        name: 'maitre-ouvrage-list',
        component: MaitreOuvrageView,
        meta: { requiresAuth: true, title: 'Maître Ouvrage List' },
      },
      {
        path: '/soustraitants',
        name: 'soustraitants',
        component: SoustraitantsView,
        meta: { requiresAuth: true, title: 'Soustraitants' },
      },
      {
        path: '/parametre',
        name: 'parametre',
        component: ParametreView,
        meta: { requiresAuth: true, title: 'Paramètre' },
      },
      {
        path: '/produit',
        name: 'produit',
        component: ProduitView,
        meta: { requiresAuth: true, title: 'Produit' },
      },
      {
        path: '/type_produit',
        name: 'typr_produit',
        component: TypeProduitView,
        meta: { requiresAuth: true, title: 'Type Produit' },
      },
      {
        path: '/sections',
        name: 'sections',
        component: SectionView,
        meta: { requiresAuth: true, title: 'Sections' },
      },
      {
        path: '/structures',
        name: 'structures',
        component: StructuresView,
        meta: { requiresAuth: true, title: 'Structures' },
      },
      {
        path: '/subdivisions_niv1',
        name: 'subdivisions_niv1',
        component: SubDivisionNv_1View,
        meta: { requiresAuth: true, title: 'Subdivisions Niveau 1' },
      },
      {
        path: '/subdivisions_niv2',
        name: 'subdivisions_niv2',
        component: SubDivisionNv_2View,
        meta: { requiresAuth: true, title: 'Subdivisions Niveau 2' },
      },
      {
        path: '/subdivisions_niv3',
        name: 'subdivisions_niv3',
        component: SubDivisionNv_3View,
        meta: { requiresAuth: true, title: 'Subdivisions Niveau 3' },
      },
      {
        path: '/subdivisions_niv4',
        name: 'subdivisions_niv4',
        component: SubDivisionNv_4View,
        meta: { requiresAuth: true, title: 'Subdivisions Niveau 4' },
      },
      {
        path: '/users',
        name: 'users',
        component: UsersView,
        meta: { requiresAuth: true, title: 'Gestion des utilisateurs' },
      },
      {
        path: '/profile',
        name: 'profile',
        component: ProfileView,
        meta: { requiresAuth: true, title: 'Profile' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { public: true, title: 'Not Found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
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
