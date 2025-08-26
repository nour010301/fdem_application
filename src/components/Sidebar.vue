
<template>
  <aside
    class="sidebar"
    :class="{ 'sidebar-hidden': !visible }"
    tabindex="-1"
    aria-label="Main navigation"
  >
    <div class="sidebar-header">
      <span class="sidebar-title">MyApp</span>
    </div>
    <nav class="sidebar-nav">
      <router-link to="/Accueil" class="nav-link" active-class="active">
        <span class="icon">🏠</span>
        <span>Accueil</span>
      </router-link>
      <a @click="handleNavClick('/add-document')" class="nav-link" :class="{ active: route.path === '/add-document' }">
        <span class="icon">➕</span>
        <span>Fond Documentaire</span>
      </a>
      <a @click="handleNavClick('/documents')" class="nav-link" :class="{ active: route.path === '/documents' }">
        <span class="icon">📄</span>
        <span>Recherche</span>
      </a>

      <!-- BIBLIOTHEQUE -->
      <div class="bibliotheque-group">
        <button class="nav-link bibliotheque-btn"
                :class="{active: isBibliothequeActive}"
                @click="toggleBibliotheque"
                type="button">
          <span class="icon">📚</span>
          <span>Bibliothèque</span>
          <span style="margin-left:auto;">{{ bibliothequeOpen ? "▼" : "▶" }}</span>
        </button>
        <transition name="fade">
          <div v-if="bibliothequeOpen" class="bibliotheque-submenu-arrow">
            <div class="submenu-buttons">
              <!-- Arborescence Submenu -->
              <div>
                <button class="nav-link sublink"
                        :class="{ active: isArborescenceActive }"
                        @click="selectSubMenu('arboresence')"
                        type="button">
                  <span class="icon">🌳</span>
                  <span>Arborescence</span>
                  <span
                    class="arrow-indicator"
                    v-if="isArborescenceActive"
                    aria-hidden="true"
                  ></span>
                </button>
                <transition name="fade">
                  <!-- This panel does NOT have the arrow anymore -->
                  <div v-if="subMenu === 'arboresence'" class="submenu-links submenu-arbo-clean">
                    <router-link to="/produit" class="nav-link sublink2" active-class="active">
                      <span class="icon">📦</span>
                      <span>Produit</span>
                    </router-link>
                    <router-link to="/type_produit" class="nav-link sublink2" active-class="active">
                      <span class="icon">🏷️</span>
                      <span>Type Produit</span>
                    </router-link>
                    <router-link to="/sections" class="nav-link sublink2" active-class="active">
                      <span class="icon">🔲</span>
                      <span>Sections</span>
                    </router-link>
                    <router-link v-if="!loading && canViewStructurePages" to="/structures" class="nav-link sublink2" active-class="active">
                      <span class="icon">📁</span>
                      <span>Structures</span>
                    </router-link>
                    <router-link v-if="!loading && canViewStructurePages" to="/subdivisions_niv1" class="nav-link sublink2" active-class="active">
                      <span class="icon">📄</span>
                      <span>Subdivisions_Niv1</span>
                    </router-link>
                    <router-link v-if="!loading && canViewStructurePages" to="/subdivisions_niv2" class="nav-link sublink2" active-class="active">
                      <span class="icon">📄</span>
                      <span>Subdivisions_Niv2</span>
                    </router-link>
                    <router-link v-if="!loading && canViewStructurePages" to="/subdivisions_niv3" class="nav-link sublink2" active-class="active">
                      <span class="icon">📄</span>
                      <span>Subdivisions_Niv3</span>
                    </router-link>
                    
                  </div>
                </transition>
              </div>
              <!-- Context Submenu -->
              <div>
                <button class="nav-link sublink"
                        :class="{ active: isContextActive }"
                        @click="selectSubMenu('context')"
                        type="button">
                  <span class="icon">🗂️</span>
                  <span>Contexte</span>
                  <span
                    class="arrow-indicator"
                    v-if="isContextActive"
                    aria-hidden="true"
                  ></span>
                </button>
                <transition name="fade">
                  <!-- This panel does NOT have the arrow anymore -->
                  <div v-if="subMenu === 'context'" class="submenu-links submenu-context-clean">
                    <router-link to="/list-projet-produit" class="nav-link sublink2" active-class="active">
                      <span class="icon">📦</span>
                      <span>Projets </span>
                    </router-link>
                    <router-link to="/bur-etude-list" class="nav-link sublink2" active-class="active">
                      <span class="icon">🏢</span>
                      <span>Bureau d’étude</span>
                    </router-link>
                    <router-link to="/list-fournisseur" class="nav-link sublink2" active-class="active">
                      <span class="icon">🚚</span>
                      <span>Fournisseurs</span>
                    </router-link>
                    <router-link to="/list-directeur" class="nav-link sublink2" active-class="active">
                      <span class="icon">👔</span>
                      <span>Directeurs</span>
                    </router-link>
                    <router-link to="/maitre-oeuvre-list" class="nav-link sublink2" active-class="active">
                      <span class="icon">🛠️</span>
                      <span>Maîtres d’œuvre</span>
                    </router-link>
                    <router-link to="/maitre-ouvrage-list" class="nav-link sublink2" active-class="active">
                      <span class="icon">🏗️</span>
                      <span>Maîtres d’ouvrage</span>
                    </router-link>
                    <router-link to="/soustraitants" class="nav-link sublink2" active-class="active">
                      <span class="icon">🤝</span>
                      <span>Sous-traitants</span>
                    </router-link>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <!-- END BIBLIOTHEQUE -->
      <router-link v-if="!loading && canManageUsers" to="/users" class="nav-link" active-class="active">
           <span class="icon">👥</span>
           <span>Utilisateurs</span>
      </router-link>
      <router-link to="/parametre" class="nav-link" active-class="active">
                      <span class="icon">⚙️</span>
                      <span>Paramètres</span>
                    </router-link>
      <router-link to="/logout" class="nav-link" active-class="active">
        <span class="icon">🚪</span>
        <span>Déconnexion</span>
      </router-link>
    </nav>
  </aside>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'

defineProps<{ visible: boolean }>()

const route = useRoute()
const router = useRouter()

// Handle navigation with refresh functionality
function handleNavClick(path: string) {
  if (route.path === path) {
    // If clicking on current page, refresh it
    window.location.reload()
  } else {
    // Navigate to different page
    router.push(path)
  }
}

// User store for role-based access control
const userStore = useUserStore()
const { canManageUsers, canViewStructurePages, loading } = userStore

const bibliothequeOpen = ref(false)
const subMenu = ref<'arboresence' | 'context'>("arboresence")

// Routes that belong to Bibliothèque
const bibliothequeRoutes = [
  '/produit', '/type_produit', '/sections', '/structures', 
  '/subdivisions_niv1', '/subdivisions_niv2', '/subdivisions_niv3',
  '/bur-etude-list', '/list-fournisseur', '/list-directeur', 
  '/list-projet-produit', '/maitre-oeuvre-list', '/maitre-ouvrage-list', '/soustraitants'
]

const arborescenceRoutes = [
  '/produit', '/type_produit', '/sections', '/structures', 
  '/subdivisions_niv1', '/subdivisions_niv2', '/subdivisions_niv3'
]

const contextRoutes = [
  '/bur-etude-list', '/list-fournisseur', '/list-directeur', 
  '/list-projet-produit', '/maitre-oeuvre-list', '/maitre-ouvrage-list', '/soustraitants'
]

// Computed properties for active states
const isBibliothequeActive = computed(() => 
  bibliothequeRoutes.includes(route.path)
)

const isArborescenceActive = computed(() => 
  arborescenceRoutes.includes(route.path)
)

const isContextActive = computed(() => 
  contextRoutes.includes(route.path)
)

function toggleBibliotheque() {
  bibliothequeOpen.value = !bibliothequeOpen.value
  if (!bibliothequeOpen.value) {
    subMenu.value = 'arboresence'
  }
}

function selectSubMenu(name: 'arboresence' | 'context') {
  subMenu.value = name
}

onMounted(async () => {
  await userStore.fetchUserProfile()
  // Auto-open Bibliothèque if we're on a related route
  if (isBibliothequeActive.value) {
    bibliothequeOpen.value = true
    if (isContextActive.value) {
      subMenu.value = 'context'
    } else {
      subMenu.value = 'arboresence'
    }
  }
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: min(270px, 25vw);
  max-width: 300px;
  background: linear-gradient(135deg, #16213e 70%, #1a237e 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.2s;
  z-index: 150;
  box-shadow: 2px 0 16px 0 rgba(22,33,62,0.18);
  will-change: transform;
  border-right: 1.5px solid #232f4b;
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  overflow-y: auto;
  overflow-x: hidden;
}
.sidebar-hidden {
  transform: translateX(-100%);
  box-shadow: none;
  pointer-events: none;
}
.sidebar-header {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 1.2rem;
  border-bottom: 1px solid #232f4b;
  background: rgba(22,33,62,0.92);
}
.sidebar-title {
  font-weight: bold;
  font-size: 1.22rem;
  letter-spacing: 1px;
  color: #90caf9;
  text-shadow: 0 2px 8px #1a237e44;
}
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 1rem;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: #e3eafc;
  text-decoration: none;
  font-size: clamp(0.85rem, 2.5vw, 1.05rem);
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  border-left: 4px solid transparent;
  border-radius: 0 8px 8px 0;
  margin: 0.3rem 0.2rem;
  cursor: pointer;
  background: none;
  border: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-link .icon {
  margin-right: 0.5rem;
  font-size: clamp(1rem, 3vw, 1.2rem);
  filter: drop-shadow(0 0 8px #1a237e44);
  flex-shrink: 0;
}
.nav-link.active, .nav-link.router-link-exact-active {
  background: linear-gradient(90deg, #232f4b 60%, #1a237e 100%);
  border-left: 4px solid #2196F3;
  color: #fff;
}
.nav-link:hover {
  background: #232f4b;
  color: #bbdefb;
}
.bibliotheque-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}
.bibliotheque-btn {
  font-weight: bold;
}

/* --- NEW SUBMENU STYLES (with ARROWS, but not on innermost level) --- */
.bibliotheque-submenu-arrow {
  margin-left: 0.5em;
  padding-left: 0.5em;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  position: relative;
  margin-bottom: 0.5rem;
}
.bibliotheque-submenu-arrow,
.submenu-arbo-arrow,
.submenu-context-arrow,
.submenu-arbo-clean,
.submenu-context-clean {
  border-left: none !important;
}

/* Arrow indicator beside active submenu button */
.arrow-indicator {
  margin-left: 0.4em;
  display: inline-block;
  width: 0.75em;
  height: 0.75em;
  vertical-align: middle;
  position: relative;
}
.arrow-indicator::before {
  content: '';
  display: block;
  width: 0.5em;
  height: 0.5em;
  border: solid #34eb8f;
  border-width: 0 3px 3px 0;
  padding: 2px;
  transform: rotate(-45deg);
  position: absolute;
  left: 0;
  top: 35%;
}
.sublink.active .arrow-indicator::before { 
  border-color: #3ff780; /* arboresence green */
}
.sublink.active .arrow-indicator::before,
[aria-label="Main navigation"] .submenu-context-arrow .sublink.active .arrow-indicator::before {
  border-color: #2196F3; /* context blue */
}
div[aria-label="Main navigation"] .submenu-arbo-arrow .sublink.active .arrow-indicator::before {
  border-color: #3ff780; /* arboresence green */
}
div[aria-label="Main navigation"] .submenu-context-arrow .sublink.active .arrow-indicator::before {
  border-color: #2196F3; /* context blue */
}

/* Submenu panel with a connecting left-pointing triangle "arrow" */
.submenu-arbo-arrow,
.submenu-context-arrow {
  position: relative;
  margin-left: 1.8em;
  background: #182141;
  border-radius: 4px;
  box-shadow: 0 0 1px 0 #1a237e66;
  padding: 0.3em 0.2em 0.3em 0.7em;
}

/* Only these get arrow! */
.submenu-arbo-arrow::before,
.submenu-context-arrow::before {
  content: '';
  position: absolute;
  left: -1.1em;
  top: 1.25em;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 14px 10px 0;
  border-color: transparent #182141 transparent transparent;
  z-index: 2;
}
.submenu-arbo-arrow::after {
  content: '';
  position: absolute;
  left: -1.17em;
  top: 1.23em;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11.5px 15px 11.5px 0;
  border-color: transparent #3ff780 transparent transparent;
  z-index: 1;
}
.submenu-context-arrow::after {
  content: '';
  position: absolute;
  left: -1.17em;
  top: 1.23em;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11.5px 15px 11.5px 0;
  border-color: transparent #2196F3 transparent transparent;
  z-index: 1;
}

/* These do not get the arrow! */
.submenu-arbo-clean,
.submenu-context-clean {
  position: relative;
  margin-left: 1.8em;
  background: #182141;
  border-radius: 4px;
  box-shadow: 0 0 1px 0 #1a237e66;
  padding: 0.3em 0.2em 0.3em 0.7em;
  /* NO ::before or ::after arrow pseudo-elements */
}

.submenu-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.sublink {
  padding-left: 2.15em;
  font-size: 0.97em;
  background: none;
  border: none;
  text-align: left;
  position: relative;
  margin-bottom: 0.2em;
}
.sublink.active {
  color: #3ff780;
}
div[aria-label="Main navigation"] .submenu-context-arrow .sublink.active {
  color: #2196F3;
}
.submenu-links {
  display: flex;
  flex-direction: column;
  gap: 0.2em;
  margin-top: 0.2em;
  margin-bottom: 0.5em;
}
.sublink2 {
  padding-left: 2.8em;
  font-size: 0.95em;
  margin-bottom: 0.1em;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.18s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
@media (max-width: 900px) {
  .sidebar {
    width: min(200px, 30vw);
  }
  .nav-link {
    padding: 0.4rem 0.5rem;
    font-size: 0.9rem;
  }
  .nav-link .icon {
    margin-right: 0.4rem;
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .sidebar {
    width: min(180px, 35vw);
  }
  .nav-link {
    padding: 0.3rem 0.4rem;
    font-size: 0.8rem;
  }
  .sidebar-title {
    font-size: 1rem;
  }
}
</style>
