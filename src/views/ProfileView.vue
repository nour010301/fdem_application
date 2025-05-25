<template>
  <div class="profile-root">
    <div class="profile-header">
      <h1 class="profile-title">Profile</h1>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <div class="profile-info">
          <h2>User Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Username:</span>
              <span class="info-value">{{ profile.username }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ profile.email || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Role:</span>
              <span class="info-value">{{ profile.role }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Poste:</span>
              <span class="info-value">{{ profile.poste }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Telephone:</span>
              <span class="info-value">{{ profile.telephone || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Departement:</span>
              <span class="info-value">{{ profile.departement || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Nom:</span>
              <span class="info-value">{{ profile.nom || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Prenom:</span>
              <span class="info-value">{{ profile.prenom || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="change-password">
          <h2>Change Password</h2>
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="old_password">Old Password</label>
              <input type="password" id="old_password" v-model="oldPassword" required>
            </div>
            <div class="form-group">
              <label for="new_password">New Password</label>
              <input type="password" id="new_password" v-model="newPassword" required>
            </div>
            <button type="submit" class="submit-button">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from '../axios';

const profile = ref({
  username: '',
  email: '',
  role: '',
  poste: '',
  telephone: null,
  departement: null,
  nom: null,
  prenom: null,
});

const oldPassword = ref('');
const newPassword = ref('');

const fetchProfile = async () => {
  try {
    const response = await axios.get('/profile/');
    profile.value = response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};

const changePassword = async () => {
  try {
    const response = await axios.post('change-password/', {
      old_password: oldPassword.value,
      new_password: newPassword.value,
    });

    if (response.status === 200) {
      alert('Password changed successfully!');
      oldPassword.value = '';
      newPassword.value = '';
    } else {
      alert('Error changing password.');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Error changing password.');
  }
};

onMounted(fetchProfile);
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');

.profile-root {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 3rem max(2vw, 25px);
  box-sizing: border-box;
  background: linear-gradient(125deg, #141829 70%, #1f2962 120%);
  color: #fff;
}

.profile-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.2em;
}

.profile-title {
  color: #90caf9;
  font-size: 3em;
  font-weight: 900;
  margin-bottom: 0.2em;
  text-shadow: 0 6px 32px #1a237e77, 0 1px 0 #292a37;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card {
  background: linear-gradient(125deg, #141829 70%, #1f2962 120%);
  padding: 2em;
  border-radius: 1.5em;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1.1px solid #2196f345;
}

.profile-info h2, .change-password h2 {
  color: #90caf9;
  font-size: 1.8em;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #2196F3;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5em;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-label {
  display: inline-block;
  width: 120px;
  font-weight: bold;
  color: #90caf9;
}

.info-value {
  color: #c6e2fa;
}

.form-group {
  margin-bottom: 1.5em;
}

.form-group label {
  display: block;
  margin-bottom: 0.5em;
  color: #90caf9;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.9em;
  border-radius: 0.5em;
  border: 1.2px solid #2196f360;
  background: linear-gradient(90deg, #1a237e50 10%, #243a7740 100%);
  color: #c6e2fa;
  font-size: 1em;
  outline: none;
  transition: border-color 0.22s;
  box-shadow: 0px 2px 9px 0 #1a237e0e;
}

.submit-button {
  background: linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%);
  color: #243463;
  border: none;
  padding: 0.9em 2em;
  border-radius: 0.5em;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-top: 1em;
}

.submit-button:hover {
  background: linear-gradient(135deg, #43c6ac 0%, #f8ffae 100%);
  transform: translateY(-2px);
}
</style>
