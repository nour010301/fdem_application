<template>
  <header class="topbar">
      <div class="topbar-left">
        <span class="topbar-title">{{ title }}</span>
      </div>
    <div class="topbar-right">
      <!-- <button class="icon-btn" aria-label="Notifications">
        <span class="icon">🔔</span>
      </button>
      <button class="icon-btn" aria-label="Settings">
        <span class="icon">⚙️</span>
      </button> -->
      <router-link to="/profile" class="profile-link">
        <div class="profile">
          <img src="https://i.pravatar.cc/32?img=1" alt="User" class="profile-img" />
          <span class="profile-name">{{ displayName }}</span>
        </div>
      </router-link>
    </div>
  </header>
</template>

<script lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../store/userStore';

// Define an interface for the route meta object
interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  public?: boolean;
}

export default {
  setup() {
    const route = useRoute();
    const title = ref<string>('Dashboard');
    const { currentUser, fetchUserProfile } = useUserStore();

    const displayName = computed(() => {
      if (currentUser.value?.nom && currentUser.value?.prenom) {
        return `${currentUser.value.prenom} ${currentUser.value.nom}`;
      }
      return 'User';
    });

    watch(() => (route.meta as RouteMeta).title, (newTitle) => {
      if (newTitle) {
        title.value = newTitle;
      }
    }, { immediate: true });

    onMounted(() => {
      if (!currentUser.value) {
        fetchUserProfile();
      }
    });

    return {
      title,
      displayName
    };
  }
};
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  color: #2E3A59;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem 0 270px;
  box-shadow: 0 2px 8px 0 rgba(46,58,89,0.06);
  z-index: 101;
  transition: padding-left 0.2s;
}
.topbar-left {
  font-weight: bold;
  font-size: 1.2rem;
  letter-spacing: 1px;
  padding-left: 1em;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.icon-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: #2E3A59;
  padding: 0.3rem;
  border-radius: 50%;
  transition: background 0.2s;
}
.icon-btn:hover {
  background: #f4f6f8;
}
.profile-link {
  text-decoration: none;
  color: inherit;
}
.profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.profile-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2196F3;
}
.profile-name {
  font-size: 1rem;
  font-weight: 500;
}
@media (max-width: 900px) {
  .topbar {
    padding-left: 74px;
  }
}
@media (max-width: 600px) {
  .topbar {
    padding: 0 0.5rem 0 70px;
    font-size: 1rem;
  }
  .profile-name {
    display: none;
  }
}
</style>
