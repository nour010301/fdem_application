<template>
  <div class="main-container">
    <!-- Fixed action bar at the top, centered and same width as viewer -->
    <div class="action-buttons">
      <button 
        @click="downloadPdf" 
        :class="['btn', { 'btn-disabled': !props.canDownload }]" 
        :disabled="!props.canDownload"
        title="Télécharger"
      >
        ⬇
      </button>
      <button 
        @click="printPdf" 
        :class="['btn', { 'btn-disabled': !props.canPrint }]" 
        :disabled="!props.canPrint"
        title="Imprimer"
      >
        🖨
      </button>

      <button @click="zoomOut" class="btn" title="Zoom out">➖</button>
      <button @click="resetZoom" class="btn" title="Fit to page">🔲</button>
      <button @click="zoomIn" class="btn" title="Zoom in">➕</button>
      <button @click="rotateLeft" class="btn" title="Rotate left">⟲</button>
      <button @click="rotateRight" class="btn" title="Rotate right">⟳</button>
    </div>

    <!-- PDF pages -->
    <div class="grid-container">
      <canvas
        v-for="(pageIndex) in numPages"
        :key="pageIndex"
        :ref="el => setCanvasRef(el, pageIndex - 1)"
        class="pdf-canvas"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import type { ComponentPublicInstance } from 'vue'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

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
let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null

// Zoom + Rotation
const baseScale = ref(1) // Fit-to-page scale
const zoomLevel = ref(1) // Multiplicative zoom factor
const rotation = ref(0)  // Rotation angle

function zoomIn() {
  zoomLevel.value *= 1.25
  renderAllPages()
}

function zoomOut() {
  zoomLevel.value /= 1.25
  renderAllPages()
}

function resetZoom() {
  zoomLevel.value = 1
  renderAllPages()
}

function rotateLeft() {
  rotation.value = (rotation.value - 90 + 360) % 360
  renderAllPages()
}

function rotateRight() {
  rotation.value = (rotation.value + 90) % 360
  renderAllPages()
}

async function renderAllPages() {
  if (!pdfDoc) return

  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const canvas = canvasRefs.value[i - 1]
    if (!canvas) continue

    const context = canvas.getContext('2d')
    if (!context) continue

    // Get unscaled size
    const unscaledViewport = page.getViewport({ scale: 1 })

    // Calculate fit-to-page scale only once (from page 1)
    if (i === 1) {
      const scaleX = screenWidth / unscaledViewport.width
      const scaleY = screenHeight / unscaledViewport.height
      baseScale.value = Math.min(scaleX, scaleY)
    }

    const viewport = page.getViewport({
      scale: baseScale.value * zoomLevel.value,
      rotation: rotation.value,
    })

    canvas.height = viewport.height
    canvas.width = viewport.width

    await page.render({ canvasContext: context, viewport }).promise
  }
}

onMounted(async () => {
  const loadingTask = pdfjsLib.getDocument(props.pdfUrl)
  pdfDoc = await loadingTask.promise
  numPages.value = pdfDoc.numPages

  const response = await fetch(props.pdfUrl)
  const arrayBuffer = await response.arrayBuffer()
  pdfData.value = new Uint8Array(arrayBuffer)

  await renderAllPages()

  window.addEventListener('resize', renderAllPages)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderAllPages)
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
.pdf-canvas {
  display: block;
  margin: 0 auto;
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

/* FIXED top toolbar, but same width as the PDF viewer */
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

  /* 👇 keep it same width as PDF viewer */
  max-width: 100%;  /* match your PDF max width */
  left: 50%;
  transform: translateX(-50%);
}

/* Push PDF content below toolbar */
.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 5rem; /* extra to clear toolbar */
}
</style>