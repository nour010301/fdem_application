<template>
  <div class="main-container">
    <!-- Fixed action bar at the top, centered and same width as viewer -->
    <div class="action-buttons">
      <button 
        @click="downloadImage" 
        :class="['btn', { 'btn-disabled': !props.canDownload }]" 
        :disabled="!props.canDownload"
        title="Télécharger"
      >
        ⬇
      </button>
      <button 
        @click="printImage" 
        :class="['btn', { 'btn-disabled': !props.canPrint }]" 
        :disabled="!props.canPrint"
        title="Imprimer"
      >
        🖨
      </button>

      <button @click="zoomOut" class="btn" title="Zoom out">🔍-</button>
      <button @click="resetZoom" class="btn" title="État initial">🔲</button>
      <button @click="zoomIn" class="btn" title="Zoom in">🔍+</button>
      <button @click="rotateLeft" class="btn" title="Rotate left">⟲</button>
      <button @click="rotateRight" class="btn" title="Rotate right">⟳</button>
    </div>

    <!-- Image container -->
    <div class="grid-container">
      <img 
        :src="props.imageUrl" 
        alt="Document" 
        class="document-image"
        :style="imageStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  imageUrl: string
  canDownload?: boolean
  canPrint?: boolean
  documentId?: number
}>()

const emit = defineEmits<{
  download: [documentId: number]
  print: [documentId: number]
}>()

// Zoom + Rotation
const zoomLevel = ref(1)
const rotation = ref(0)

const imageStyle = computed(() => ({
  transform: `scale(${zoomLevel.value}) rotate(${rotation.value}deg)`,
  transition: 'transform 0.2s ease'
}))

function zoomIn() {
  zoomLevel.value *= 1.25
}

function zoomOut() {
  zoomLevel.value /= 1.25
}

function resetZoom() {
  zoomLevel.value = 1
  rotation.value = 0
}

function rotateLeft() {
  rotation.value = (rotation.value - 90 + 360) % 360
}

function rotateRight() {
  rotation.value = (rotation.value + 90) % 360
}

function downloadImage() {
  if (!props.canDownload) return

  // Emit download event for logging
  if (props.documentId) {
    emit('download', props.documentId)
  }

  const a = document.createElement('a')
  a.href = props.imageUrl
  a.download = 'image'
  a.click()
}

function printImage() {
  if (!props.canPrint) return

  // Emit print event for logging
  if (props.documentId) {
    emit('print', props.documentId)
  }

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>Print Image</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
          <img src="${props.imageUrl}" style="max-width:100%;max-height:100%;"/>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}
</script>

<style scoped>
.document-image {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

/* General button styles */
.btn {
  padding: 0.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.25rem;
  transition: background-color 0.2s;
  min-width: 2.5rem;
  min-height: 2.5rem;
  font-size: 1rem;
}

.btn:hover:not(.btn-disabled) {
  background-color: #2563eb;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn-disabled {
  background-color: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

/* Page container */
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  overflow: auto;
  box-sizing: border-box;
}

/* FIXED top toolbar, but same width as the viewer */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  position: fixed;
  top: 5;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  justify-content: center;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);

  max-width: 100%;
  left: 50%;
  transform: translateX(-50%);
}

/* Push content below toolbar */
.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 5rem;
}
</style>