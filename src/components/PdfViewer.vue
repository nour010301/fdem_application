<template>
  <div class="main-container">
    <div class="grid-container">
      <canvas
        v-for="(pageIndex) in numPages"
        :key="pageIndex"
        :ref="el => setCanvasRef(el, pageIndex - 1)"
        class="w-full border mb-4"
      />
    </div>
    
    <div class="action-buttons">
      <button 
        @click="downloadPdf" 
        :class="['btn', { 'btn-disabled': !props.canDownload }]" 
        :disabled="!props.canDownload"
        title="Télécharger"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </button>
      <button 
        @click="printPdf" 
        :class="['btn', { 'btn-disabled': !props.canPrint }]" 
        :disabled="!props.canPrint"
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
import { onMounted, ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import type { ComponentPublicInstance } from 'vue'
 import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
// pdfjsLib.GlobalWorkerOptions.workerSrc = '/media/documents_pdfs/pdf.worker-DHtGXOM1.mjs'


const canvasRefs = ref<(HTMLCanvasElement | null)[]>([])

function setCanvasRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLCanvasElement) {
    canvasRefs.value[index] = el
  }
}

const props = defineProps<{
  pdfUrl: string
  canDownload?: boolean
  canPrint?: boolean
}>()

const numPages = ref(0)
const pdfData = ref<Uint8Array | null>(null)

onMounted(async () => {
  // Load PDF as typed array for download/print later
  const loadingTask = pdfjsLib.getDocument(props.pdfUrl)
  const pdf = await loadingTask.promise
  numPages.value = pdf.numPages

  // Fetch the raw PDF bytes for download and printing
  const response = await fetch(props.pdfUrl)
  const arrayBuffer = await response.arrayBuffer()
  pdfData.value = new Uint8Array(arrayBuffer)

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
})

function downloadPdf() {
  if (!pdfData.value || !props.canDownload) return

  const blob = new Blob([pdfData.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'document.pdf'
  a.click()

  URL.revokeObjectURL(url)
}

function printPdf() {
  if (!pdfData.value || !props.canPrint) return

  const blob = new Blob([pdfData.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  // Create an iframe visible but positioned offscreen
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
      }, 22000)
    }
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

.btn-disabled:hover {
  background-color: #9ca3af !important;
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
