<template>
  <div class="dashboard-layout">
    <!-- Modern, beautiful toggle button with SVG icon and pulse -->
    <button
      class="sidebar-toggle-btn pulse"
      @click="toggleSidebar"
      :aria-label="sidebarVisible ? 'Masquer le menu' : 'Afficher le menu'"
    >
      <span v-if="sidebarVisible">
        <!-- Chevron Left SVG -->
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15.5 19L9.5 12L15.5 5" stroke="#2196F3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span v-else>
        <!-- Hamburger SVG -->
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="7" width="16" height="2.2" rx="1.1" fill="#2196F3"/>
          <rect x="4" y="11" width="16" height="2.2" rx="1.1" fill="#2196F3"/>
          <rect x="4" y="15" width="16" height="2.2" rx="1.1" fill="#2196F3"/>
        </svg>
      </span>
    </button>
    <Sidebar :visible="sidebarVisible" />
    <Topbar />
    <main class="dashboard-main" :class="{ 'sidebar-hidden': !sidebarVisible }">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Topbar from '../components/Topbar.vue'

const sidebarVisible = ref(true)

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value
}

// Responsive: auto-hide sidebar on small screens
function handleResize() {
  if (window.innerWidth < 900) {
    sidebarVisible.value = false
  } else {
    sidebarVisible.value = true
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  width: 100vw;
  background: #f4f6f8;
  position: relative;
}

/* Modern pulse animation */
@keyframes gentle-pulse {
  0%, 100% { box-shadow: 0 4px 24px 0 rgba(33,150,243,0.10), 0 1.5px 8px 0 rgba(33,150,243,0.08); }
  50% { box-shadow: 0 8px 32px 0 rgba(33,150,243,0.18), 0 3px 12px 0 rgba(33,150,243,0.12); }
}

.sidebar-toggle-btn {
  position: fixed;
  top: 10px;
  left: 190px; /* visually aligns with sidebar width (250px - padding) */
  z-index: 200;
  background: linear-gradient(135deg, #fff 70%, #e3f0fc 100%);
  color: #2196F3;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px 0 rgba(33,150,243,0.10), 0 1.5px 8px 0 rgba(33,150,243,0.08);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  animation: gentle-pulse 2.2s infinite;
  outline: none;
  border: 1.5px solid #e0e0e0;
}
.sidebar-toggle-btn:hover {
  background: linear-gradient(135deg, #e3f0fc 60%, #b3e0ff 100%);
  box-shadow: 0 8px 32px 0 rgba(33,150,243,0.18), 0 3px 12px 0 rgba(33,150,243,0.12);
  transform: scale(1.08);
  animation: none;
}
.sidebar-toggle-btn svg {
  display: block;
}

.dashboard-main {
  margin-left: 250px;
  margin-top: 60px;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
  transition: margin-left 0.3s cubic-bezier(.4,2,.6,1);
}
.dashboard-main.sidebar-hidden {
  margin-left: 0;
}
@media (max-width: 900px) {
  .dashboard-main {
    margin-left: 0;
    padding: 1rem;
  }
  .sidebar-toggle-btn {
    left: 12px;
    top: 14px;
    width: 38px;
    height: 38px;
  }
}
@media (max-width: 600px) {
  .dashboard-main {
    margin-left: 0;
    margin-top: 60px;
    padding: 0.5rem;
  }
  .sidebar-toggle-btn {
    left: 12px;
    top: 14px;
    width: 38px;
    height: 38px;
  }
}
</style>