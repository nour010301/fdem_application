<template>
  <div class="chart-page">
    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title">Total documents par produit (plus de 20 documents)</div>
        <div class="chart-header-right">
          <div class="chart-summary-stats">
            <div class="summary-stat-item">
              <i class="fas fa-file-alt"></i>
              <span class="summary-label">Pièces écrites:</span>
              <span class="summary-value">{{ totalPiecesEcrites }}</span>
            </div>
            <div class="summary-stat-item">
              <i class="fas fa-image"></i>
              <span class="summary-label">Pièces graphiques:</span>
              <span class="summary-value">{{ totalPiecesGraphiques }}</span>
            </div>
            <div class="summary-stat-item summary-stat-total">
              <i class="fas fa-layer-group"></i>
              <span class="summary-label">Total:</span>
              <span class="summary-value">{{ totalDocuments }}</span>
            </div>
          </div>
          <button class="print-btn" @click="printChart" :disabled="loading">
            <i class="fas fa-print"></i>
            Imprimer
          </button>
        </div>
      </div>
      <div v-if="loading" class="loading-state">Chargement...</div>
      <div v-else class="chart-wrapper" :style="{ height: chartHeight + 'px' }">
        <canvas id="totalProductChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';
import axiosInstance from '../axios';

const loading = ref(true);
const totalPiecesEcrites = ref(0);
const totalPiecesGraphiques = ref(0);
const chartHeight = ref(700);
const abbreviationMap = ref<Record<string, string | null>>({});
let totalProductChart: Chart | null = null;

const totalDocuments = computed(() => totalPiecesEcrites.value + totalPiecesGraphiques.value);

const fetchDocumentsByProductSubdivision = async () => {
  try {
    const response = await axiosInstance.get('document-count-by-produit-subdivision-1/');
    const raw = response.data || {};
    const normalized: Record<string, Record<string, number>> = {};
    for (const [name, val] of Object.entries(raw as Record<string, { abbreviation: string | null, subdivisions: Record<string, number> }>)) {
      normalized[name] = val.subdivisions;
    }
    abbreviationMap.value = Object.fromEntries(
      Object.entries(raw as Record<string, { abbreviation: string | null, subdivisions: Record<string, number> }>)
        .map(([name, val]) => [name, val.abbreviation || null])
    );
    return normalized;
  } catch (error) {
    console.error('Error fetching data:', error);
    return {};
  }
};

function createChart(data: Record<string, Record<string, number>>) {
  const ctx = document.getElementById('totalProductChart') as HTMLCanvasElement;
  if (!ctx) return;
  if (totalProductChart) totalProductChart.destroy();

  const productTotals = Object.entries(data).map(([product, subdivisions]) => {
    const piecesEcrites = subdivisions['PIECES ECRITES'] || 0;
    const piecesGraphiques = subdivisions['PIECES GRAPHIQUES'] || 0;
    const total = Object.values(subdivisions).reduce((sum, count) => sum + count, 0);
    return { product, piecesEcrites, piecesGraphiques, total };
  });

  const filteredProducts = productTotals.filter(p => p.total > 20).sort((a, b) => b.total - a.total);

  totalPiecesEcrites.value = filteredProducts.reduce((sum, p) => sum + p.piecesEcrites, 0);
  totalPiecesGraphiques.value = filteredProducts.reduce((sum, p) => sum + p.piecesGraphiques, 0);

  const maxValue = Math.max(...filteredProducts.map(p => p.total));
  const yLabels = filteredProducts.map(item => abbreviationMap.value[item.product] || item.product);

  chartHeight.value = 700;

  totalProductChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: yLabels,
      datasets: [
        {
          label: 'Pièces écrites',
          data: filteredProducts.map(item => item.piecesEcrites),
          backgroundColor: '#1976d2',
          borderRadius: 6
        },
        {
          label: 'Pièces graphiques',
          data: filteredProducts.map(item => item.piecesGraphiques),
          backgroundColor: '#388e3c',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#333', font: { size: 14 } }
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#1976d2',
          bodyColor: '#333',
          borderColor: '#1976d2',
          borderWidth: 1,
          titleFont: { size: 15 },
          bodyFont: { size: 14 },
          padding: 12,
          callbacks: {
            title: (context) => filteredProducts[context[0].dataIndex].product,
            label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
            footer: (context) => `Total: ${filteredProducts[context[0].dataIndex].total}`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#333', font: { size: 12 }, maxRotation: 90, minRotation: 45 }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: maxValue * 1.1,
          ticks: { color: '#333', font: { size: 13 } },
          grid: { color: '#e0e0e0' }
        }
      }
    }
  });
}

function printChart() {
  const canvas = document.getElementById('totalProductChart') as HTMLCanvasElement;
  if (!canvas) return;

  const imageData = canvas.toDataURL('image/png');
  const ecrites = totalPiecesEcrites.value;
  const graphiques = totalPiecesGraphiques.value;
  const total = totalDocuments.value;

  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Total documents par produit</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      @page { size: A4 landscape; margin: 10mm; }
      body {
        background: #fff;
        font-family: sans-serif;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      .header { padding: 10px 10px 8px; }
      h2 { color: #1a237e; font-size: 1rem; margin-bottom: 10px; }
      .stats { display: flex; gap: 10px; flex-wrap: wrap; }
      .stat {
        display: flex; align-items: center; gap: 6px;
        background: #f0f4ff !important; border: 1px solid #c5cae9;
        border-radius: 8px; padding: 5px 12px; font-size: 0.88rem;
        print-color-adjust: exact; -webkit-print-color-adjust: exact;
      }
      .stat.total { background: #e8f5e9 !important; border-color: #a5d6a7; }
      .stat-label { color: #555; }
      .stat-value { font-weight: 700; color: #1a237e; }
      .stat.total .stat-value { color: #1b5e20; }
      .chart-img {
        display: block;
        width: 100%;
        height: calc(100vh - 80px);
        object-fit: fill;
      }
      @media print {
        .chart-img {
          width: 100%;
          height: calc(100vh - 80px);
          object-fit: fill;
        }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h2>Total documents par produit (plus de 20 documents)</h2>
      <div class="stats">
        <div class="stat"><span class="stat-label">Pièces écrites:</span><span class="stat-value">${ecrites}</span></div>
        <div class="stat"><span class="stat-label">Pièces graphiques:</span><span class="stat-value">${graphiques}</span></div>
        <div class="stat total"><span class="stat-label">Total:</span><span class="stat-value">${total}</span></div>
      </div>
    </div>
    <img class="chart-img" src="${imageData}" />
    <scr` + `ipt>
      window.onload = function() { window.print(); window.close(); };
    </scr` + `ipt>
  </body>
</html>`);
  printWindow.document.close();
}

onMounted(async () => {
  const data = await fetchDocumentsByProductSubdivision();
  loading.value = false;
  setTimeout(() => createChart(data), 180);
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');

.chart-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 2rem;
  box-sizing: border-box;
}

.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a237e;
}

.chart-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.chart-summary-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.print-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.print-btn:hover:not(:disabled) {
  background: #1251a0;
}

.print-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.summary-stat-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f0f4ff;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #c5cae9;
}

.summary-stat-item i {
  color: #1976d2;
}

.summary-label {
  color: #555;
  font-size: 0.95rem;
}

.summary-value {
  font-weight: 700;
  color: #1a237e;
  font-size: 1rem;
}

.chart-wrapper {
  width: 100%;
  overflow-x: auto;
}

.summary-stat-total {
  background: #e8f5e9;
  border-color: #a5d6a7;
}

.summary-stat-total i {
  color: #2e7d32;
}

.summary-stat-total .summary-value {
  color: #1b5e20;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1.1rem;
}
</style>
