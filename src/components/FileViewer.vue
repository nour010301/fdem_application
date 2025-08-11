<template>
  <div class="main-container">
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
      <img :src="fileUrl" alt="Document" class="document-image" />
    </div>
    
    <!-- Video Viewer -->
    <div v-else-if="fileType === 'video'" class="video-container">
      <video :src="fileUrl" controls class="document-video">
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
    
    <div class="action-buttons">
      <button 
        @click="downloadFile" 
        :class="['btn', { 'btn-disabled': !canDownload }]" 
        :disabled="!canDownload"
        title="Télécharger"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </button>
      <button 
        v-if="fileType === 'pdf' || fileType === 'image'"
        @click="printFile" 
        :class="['btn', { 'btn-disabled': !canPrint }]" 
        :disabled="!canPrint"
        title="Imprimer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
        </svg>
      </button>
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
}

.unsupported-container {
  justify-content: center;
  text-align: center;
  color: #666;
}

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
}

.btn:hover:not(.btn-disabled) {
  background-color: #2563eb;
}

.btn-disabled {
  background-color: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  padding: 1rem;
  box-sizing: border-box;
}

.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: min(90vw, 800px);
  flex: 1;
  overflow: visible;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem 0;
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  width: 100%;
  justify-content: center;
  flex-shrink: 0;
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