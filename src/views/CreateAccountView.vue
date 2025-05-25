<template>
    <div class="account-creation-root">
      <div class="account-creation-header">
        <h1 class="account-creation-title">Créer un compte</h1>
      </div>
  
      <div class="account-creation-form">
        <form @submit.prevent="createAccount">
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <input type="text" id="username" v-model="username" required>
          </div>
  
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" v-model="password" required>
          </div>
  
          <div class="form-group">
            <label for="role">Rôle</label>
            <select id="role" v-model="role" required>
              <option value="" disabled selected>Sélectionnez un rôle</option>
              <option v-for="roleOption in roleOptions" :key="roleOption.value" :value="roleOption.value">
                {{ roleOption.label }}
              </option>
            </select>
          </div>
  
          <div class="form-group">
            <label for="poste">Poste</label>
            <select id="poste" v-model="poste" required>
              <option value="" disabled selected>Sélectionnez un poste</option>
              <option v-for="posteOption in posteOptions" :key="posteOption.value" :value="posteOption.value">
                {{ posteOption.label }}
              </option>
            </select>
          </div>
  
          <button type="submit" class="submit-button">Créer le compte</button>
        </form>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  
  const username = ref('');
  const password = ref('');
  const role = ref('');
  const poste = ref('');
  
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
  
  const createAccount = async () => {
    try {
      const response = await fetch('api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
          role: role.value,
          poste: poste.value,
        }),
      });
  
      if (response.ok) {
        alert('Compte créé avec succès!');
        // Reset form fields
        username.value = '';
        password.value = '';
        role.value = '';
        poste.value = '';
      } else {
        alert('Erreur lors de la création du compte.');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Erreur lors de la création du compte.');
    }
  };
  </script>
  
  <style scoped>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
  
  .account-creation-root {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 3rem max(2vw, 25px);
    box-sizing: border-box;
    background: linear-gradient(125deg, #141829 70%, #1f2962 120%);
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
    color: #90caf9;
    font-size: 3em;
    font-weight: 900;
    margin-bottom: 0.2em;
    text-shadow: 0 6px 32px #1a237e77, 0 1px 0 #292a37;
  }
  
  .account-creation-form {
    /* background: linear-gradient(115deg, #223361cc 65%, #26377eaa 120%); */
    background: linear-gradient(125deg, #141829 70%, #1f2962 120%);
    padding: 2em;
    border-radius: 1.0em;
    box-shadow: 0 0.8px 14px 0 #283b7a29;
    border: 1.1px solid #2196f345;
    margin-bottom: 2em;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
  
  .form-group input{
    width: 100%;
    padding: 0.9em 0;
    border-radius: 0.5em;
    border: 1.2px solid #2196f360;
    background: linear-gradient(90deg, #1a237e50 10%, #243a7740 100%);
    color: #c6e2fa;
    font-size: 1em;
    outline: none;
    transition: border-color 0.22s;
    box-shadow: 0px 2px 9px 0 #1a237e0e;
  }
  .form-group select {
    width: 100%;
    padding: 0.9em ;
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
    padding: 0.7em 1.5em;
    border-radius: 0.5em;
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .submit-button:hover {
    background: linear-gradient(135deg, #43c6ac 0%, #f8ffae 100%);
  }
  </style>
  