<!-- components/DynamicFormModal.vue -->
<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal-box">
        <h3>{{ title }}</h3>
  
        <form @submit.prevent="handleSubmit">
          <div v-for="field in fields" :key="field.name" class="form-group">
            <label :for="field.name">{{ field.label }}</label>
            <input
              v-model="formData[field.name]"
              :type="field.type || 'text'"
              :placeholder="field.placeholder"
              :id="field.name"
              required
            />
          </div>
  
          <div class="modal-actions">
            <button type="submit">Valider</button>
            <button type="button" @click="$emit('close')">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  
  const props = defineProps<{
    visible: boolean
    title: string
    fields: { name: string; label: string; placeholder?: string; type?: string }[]
  }>()
  const emit = defineEmits(['submit', 'close'])
  
  const formData = ref<Record<string, string>>({})
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      formData.value = Object.fromEntries(props.fields.map(f => [f.name, '']))
    }
  })
  
  function handleSubmit() {
    emit('submit', { ...formData.value })
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-box {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
  }
  .form-group {
    margin-bottom: 1rem;
  }
  .modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }
  </style>
  