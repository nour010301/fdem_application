

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
const PagesLayout = () => import('../layouts/PagesLayout.vue')


import LoginView from '../views/LoginView.vue'
// import DashboardView from '../views/DashboardView.vue'
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

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login', // ✅ Redirect root path to /login
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true }, // Mark as public route
  },
  // {
  //   path: '/dashboard',
  //   name: 'Dashboard',
  //   component: DashboardView,
  // },
  {
    path: '/',
    component: PagesLayout,
    children: [
      {
        path: '/Accueil',
        name: 'Accueil',
        component: DashboardView,
      },
      {
        path: '/documents',
        name: 'Documents',
        component: Documents,
      },
      {
        path: '/add-document',
        name: 'Add-document',
        component: AddDocView,
      },
      {
        path: '/bur-etude-list',
        name: 'bur-etude-list',
        component: BetView,
      },
      {
        path: '/list-fournisseur',
        name: 'list-fournisseur',
        component: FournisseurView,
      },
      {
        path: '/list-directeur',
        name: 'list-directeur',
        component: DirecteurView,
      },
      {
        path: '/list-projet-produit',
        name: 'list-projet-produit',
        component: ProjetProduitView,
      },
      {
        path: '/maitre-oeuvre-list',
        name: 'maitre-oeuvre-list',
        component: MaitreOeuvreView,
      },
      {
        path: '/maitre-ouvrage-list',
        name: 'maitre-ouvrage-list',
        component: MaitreOuvrageView,
      },
      {
        path: '/soustraitants',
        name: 'soustraitants',
        component: SoustraitantsView,
      },
      {
        path: '/parametre',
        name: 'parametre',
        component: ParametreView,
      },
      {
        path: '/produit',
        name: 'produit',
        component: ProduitView,
      },
      {
        path: '/type_produit',
        name: 'typr_produit',
        component: TypeProduitView,
      },
      {
        path: '/sections',
        name: 'sections',
        component: SectionView,
      },
      {
        path: '/structures',
        name: 'structures',
        component: StructuresView,
      },
      {
        path: '/subdivisions_niv1',
        name: 'subdivisions_niv1',
        component: SubDivisionNv_1View,
      },
      {
        path: '/subdivisions_niv2',
        name: 'subdivisions_niv2',
        component: SubDivisionNv_2View,
      },
      {
        path: '/subdivisions_niv3',
        name: 'subdivisions_niv3',
        component: SubDivisionNv_3View,
      },
      // {
      //   path: '/logout',
      //   name: 'logout',
      //   component: ParametreView,
      // },
      
      // Add more child routes here as needed
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'), // Create this view
  },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
