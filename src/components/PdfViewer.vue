<template>
  <div class="main-container">
    <div class="mb-4 flex gap-2 justify-center">
      <button @click="downloadPdf" class="btn">Télécharger</button>
      <button @click="printPdf" class="btn">Imprimer</button>
    </div>

    <div class="grid-container">
      <canvas
        v-for="(pageIndex) in numPages"
        :key="pageIndex"
        :ref="el => setCanvasRef(el, pageIndex - 1)"
        class="w-full border mb-4"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
  if (!pdfData.value) return

  const blob = new Blob([pdfData.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'document.pdf'
  a.click()

  URL.revokeObjectURL(url)
}

function printPdf() {
  if (!pdfData.value) return

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
  margin: 0 auto; /* Center the canvas horizontally */
}
.btn {
  padding: 0.5em 1em;
  background-color: #3b82f6; /* blue */
  color: white;
  border: none;
  border-radius: 0.3em;
  cursor: pointer;
  font-weight: 600;
  margin: 0 0.5em; /* Add margin to create space between buttons */
}
.btn:hover {
  background-color: #2563eb;
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-container {
  display: grid;
  place-items: center;
  width: 100%;
  max-width: 800px; /* Adjust the max-width as needed */
}
</style>
