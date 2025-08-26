<template>
  <div class="main-container">
    <!-- Fixed action bar at the top -->
    <div class="action-buttons">
      <button 
        @click="downloadFile" 
        :class="['btn', { 'btn-disabled': !canDownload }]" 
        :disabled="!canDownload"
        title="Télécharger"
      >
        ⬇
      </button>
      <button 
        v-if="fileType === 'pdf' || fileType === 'image'"
        @click="printFile" 
        :class="['btn', { 'btn-disabled': !canPrint }]" 
        :disabled="!canPrint"
        title="Imprimer"
      >
        🖨
      </button>

      <button 
        v-if="fileType === 'image' || fileType === 'video'"
        @click="zoomOut" 
        class="btn" 
        title="Zoom out"
      >
        🔍-
      </button>
      <button 
        v-if="fileType === 'image' || fileType === 'video'"
        @click="resetZoom" 
        class="btn" 
        title="État initial"
      >
        🔲
      </button>
      <button 
        v-if="fileType === 'image' || fileType === 'video'"
        @click="zoomIn" 
        class="btn" 
        title="Zoom in"
      >
        🔍+
      </button>
      <button 
        v-if="fileType === 'image'"
        @click="rotateLeft" 
        class="btn" 
        title="Rotate left"
      >
        ⟲
      </button>
      <button 
        v-if="fileType === 'image'"
        @click="rotateRight" 
        class="btn" 
        title="Rotate right"
      >
        ⟳
      </button>
    </div>

    <!-- PDF Viewer -->
    <div v-if="fileType === 'pdf'" class="grid-container">
      <canvas
        v-for="(pageIndex) in numPages"
        :key="pageIndex"
        :ref="el => setCanvasRef(el, pageIndex - 1)"
        class="w-full border mb-4"
      />
    </div>
    
    <!-- Image Viewer -->
    <div v-else-if="fileType === 'image'" class="image-container">
      <img 
        :src="fileUrl" 
        alt="Document" 
        class="document-image" 
        :style="imageStyle"
      />
    </div>
    
    <!-- Video Viewer -->
    <div v-else-if="fileType === 'video'" class="video-container">
      <video 
        :src="fileUrl" 
        controls 
        class="document-video"
        :style="videoStyle"
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    </div>
    
    <!-- Text Viewer -->
    <div v-else-if="fileType === 'text'" class="text-container">
      <pre class="document-text">{{ textContent }}</pre>
    </div>
    
    <!-- Unsupported File Type -->
    <div v-else class="unsupported-container">
      <p>Type de fichier non supporté pour la prévisualisation</p>
      <button @click="downloadFile" class="btn">Télécharger le fichier</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import type { ComponentPublicInstance } from 'vue'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const props = defineProps<{
  fileUrl: string
  canDownload?: boolean
  canPrint?: boolean
}>()

const canvasRefs = ref<(HTMLCanvasElement | null)[]>([])
const numPages = ref(0)
const fileData = ref<Uint8Array | null>(null)
const textContent = ref('')
const detectedFileType = ref('')

// Zoom and rotation for images/videos
const zoomLevel = ref(1)
const rotation = ref(0)

const fileType = computed(() => {
  if (detectedFileType.value) return detectedFileType.value
  
  const url = props.fileUrl.toLowerCase()
  if (url.includes('pdf') || url.endsWith('.pdf')) return 'pdf'
  if (url.includes('png') || url.includes('jpg') || url.includes('jpeg') || url.includes('gif') || 
      url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif')) return 'image'
  if (url.includes('mp4') || url.includes('mov') || url.includes('avi') || 
      url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi')) return 'video'
  if (url.includes('txt') || url.endsWith('.txt')) return 'text'
  return 'unknown'
})

const imageStyle = computed(() => ({
  transform: `scale(${zoomLevel.value}) rotate(${rotation.value}deg)`,
  transition: 'transform 0.2s ease'
}))

const videoStyle = computed(() => ({
  transform: `scale(${zoomLevel.value})`,
  transition: 'transform 0.2s ease'
}))

// Zoom and rotation functions
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

function setCanvasRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLCanvasElement) {
    canvasRefs.value[index] = el
  }
}

onMounted(async () => {
  try {
    const response = await fetch(props.fileUrl)
    const contentType = response.headers.get('content-type') || ''
    const arrayBuffer = await response.arrayBuffer()
    fileData.value = new Uint8Array(arrayBuffer)

    // Override file type detection based on content-type if URL detection fails
    if (fileType.value === 'unknown') {
      if (contentType.includes('image/')) {
        detectedFileType.value = 'image'
      } else if (contentType.includes('video/')) {
        detectedFileType.value = 'video'
      } else if (contentType.includes('text/')) {
        detectedFileType.value = 'text'
      }
    }

    if (fileType.value === 'pdf') {
      await loadPdf()
    } else if (fileType.value === 'text') {
      const text = new TextDecoder().decode(fileData.value)
      textContent.value = text
    }
  } catch (error) {
    console.error('Error loading file:', error)
  }
})

async function loadPdf() {
  if (!fileData.value) return
  
  const loadingTask = pdfjsLib.getDocument(fileData.value)
  const pdf = await loadingTask.promise
  numPages.value = pdf.numPages

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const canvas = canvasRefs.value[i - 1]
    if (!canvas) continue

    const context = canvas.getContext('2d')
    if (!context) continue

    const viewport = page.getViewport({ scale: 1.5 })
    canvas.height = viewport.height
    canvas.width = viewport.width

    await page.render({ canvasContext: context, viewport }).promise
  }
}

function downloadFile() {
  if (!fileData.value || !props.canDownload) return

  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    image: 'image/jpeg',
    video: 'video/mp4',
    text: 'text/plain'
  }

  const blob = new Blob([fileData.value], { type: mimeTypes[fileType.value] || 'application/octet-stream' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `document.${fileType.value === 'image' ? 'jpg' : fileType.value}`
  a.click()

  URL.revokeObjectURL(url)
}

function printFile() {
  if (!props.canPrint) return

  if (fileType.value === 'pdf') {
    printPdf()
  } else if (fileType.value === 'image') {
    printImage()
  }
}

function printPdf() {
  if (!fileData.value) return

  const blob = new Blob([fileData.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  iframe.src = url

  document.body.appendChild(iframe)

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch (e) {
      console.error('Print failed:', e)
    } finally {
      setTimeout(() => {
        document.body.removeChild(iframe)
        URL.revokeObjectURL(url)
      }, 2000)
    }
  }
}

function printImage() {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>Print Image</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
          <img src="${props.fileUrl}" style="max-width:100%;max-height:100%;"/>
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
canvas {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
}

.document-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.document-video {
  max-width: 100%;
  max-height: 80vh;
  display: block;
  margin: 0 auto;
}

.document-text {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  max-height: 80vh;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: monospace;
}

.image-container, .video-container, .text-container, .unsupported-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: min(90vw, 800px);
  flex: 1;
  margin-top: 5rem;
}

.unsupported-container {
  justify-content: center;
  text-align: center;
  color: #666;
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

/* FIXED top toolbar, same as PdfViewer */
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

@media (max-width: 768px) {
  .main-container {
    padding: 0.5rem;
  }
  
  .grid-container {
    max-width: 95vw;
  }
  
  .btn {
    padding: 0.375rem;
    margin: 0 0.125rem;
  }
}
</style>