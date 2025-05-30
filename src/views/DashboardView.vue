<template>
  <div class="dashboard-root">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Tableau de bord</h1>
    </div>

    <!-- Modernized Stats Cards -->
    <div class="dashboard-grid modern-stats">
      <div class="stat-card modern" v-for="(value, key) in filteredStatistics" :key="key">
        <div class="stat-icon">
          <i :class="iconForKey(key)"></i>
        </div>
        <div class="stat-info">
          <div class="stat-label">{{ formatKey(key) }}</div>
          <div class="stat-value">{{ value }}</div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-container">
      <!-- Chart 1: Répartition par produit/type -->
      <div class="chart-container">
        <div class="chart-card glass">
          <div class="chart-title">Répartition par produit/type (graphique)</div>
          <div class="chart-placeholder">
            <canvas id="typeChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Chart 2: Documents by Year/Month/Trimester -->
      <div class="chart-container">
        <div class="chart-card glass">
          <div class="chart-title">Documents par période</div>
          <div class="chart-buttons">
            <button @click="showDocumentsByYear">By Year</button>
            <button @click="showDocumentsByMonth">By Month</button>
            <button @click="showDocumentsByTrimester">By Trimester</button>
          </div>
          <div class="chart-placeholder">
            <canvas id="documentsChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Documents Row - Dynamic -->
    <div class="dashboard-section">
      <h2 class="section-title">Derniers documents ajoutés</h2>
      <div class="recent-docs-list">
        <div
          class="doc-item"
          v-for="doc in recentDocuments"
          :key="doc.idDocument"
        >
          <span
            class="doc-type"
            :class="doc.fichier_pdf ? 'pdf' : 'autre'"
          >{{ doc.fichier_pdf ? 'PDF' : 'Autre' }}</span>
          {{ doc.designation }}
          <span class="doc-date">{{ doc.dateCreation }}</span>
        </div>
        <div v-if="recentDocuments.length === 0">
          Aucun document récent à afficher.
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import axiosInstance from '../axios';
const loading = ref(true);

// --- Modern Statistics Mapping ---
const iconMap: Record<string, string> = {
  "type produits": "fas fa-cubes",
  "produits": "fas fa-box",
  "structures": "fas fa-building",
  "bureau etudes": "fas fa-user-tie",
  "projets": "fas fa-project-diagram",
  "maitre oeuvres": "fas fa-hard-hat",
  "maitre ouvrages": "fas fa-briefcase",
  "fournisseurs": "fas fa-truck",
  "soustraitantss": "fas fa-people-carry",
  "direction projets": "fas fa-sitemap",
  "documents": "fas fa-file-alt",
};

function iconForKey(key: string): string {
  return iconMap[key] || "fas fa-info-circle";
}
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toLocaleUpperCase('fr-FR'));
}

// State
const statistics = ref<Record<string, number>>({});
const filteredStatistics = ref<Record<string, number>>({});

const fetchData = async () => {
  loading.value = true;
  try {
    const statisticsResponse = await axiosInstance.get('statistics/');
    statistics.value = statisticsResponse.data.statistics;
    filteredStatistics.value = statistics.value || {};
  } catch (error) {
    console.error('Error fetching statistics:', error);
  } finally {
    loading.value = false;
  }
};

// ========= New: Fetch last documents =========
interface DocumentItem {
  idDocument: number;
  designation: string;
  fichier_pdf: string | null;
  dateCreation: string;
  // you may add other fields if needed
}

const recentDocuments = ref<DocumentItem[]>([]);

const fetchRecentDocuments = async () => {
  try {
    const res = await axiosInstance.get('documents/last/');
    recentDocuments.value = Array.isArray(res.data)
      ? res.data.slice(0, 4)
      : [];
  } catch (err) {
    recentDocuments.value = [];
    console.error('Failed to fetch recent documents', err);
  }
};

// ==============================================

// Chart logic using real data
let typeChart: Chart | null = null;
let documentsChart: Chart | null = null;

interface TypeProduit {
  idTypeProduit: number;
  designation: string;
  description: string;
  date_suppression: string | null;
}

interface Produit {
  idProduit: number;
  idTypeProduit: number;
  typeProduitDesignation: string;
  designation: string;
  description: string;
  date_suppression: string | null;
}

interface Document {
  idDocument: number;
  dateCreation: string | null;
  // other fields...
}

const fetchTypes = async (): Promise<TypeProduit[]> => {
  try {
    const response = await axiosInstance.get('types/');
    return response.data;
  } catch (error) {
    console.error('Error fetching types:', error);
    return [];
  }
};

const fetchProduits = async (): Promise<Produit[]> => {
  try {
    const response = await axiosInstance.get('produits/');
    return response.data;
  } catch (error) {
    console.error('Error fetching produits:', error);
    return [];
  }
};

const fetchDocuments = async (): Promise<Document[]> => {
  try {
    const response = await axiosInstance.get('documents/');
    console.log('Fetched documents:', response.data); // Log fetched data
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

const processData = (types: TypeProduit[], produits: Produit[]) => {
  const typeCounts: Record<string, number> = {};

  // Initialize typeCounts with all types
  types.forEach(type => {
    typeCounts[type.designation] = 0;
  });

  // Count the number of produits for each type
  produits.forEach(produit => {
    if (typeCounts[produit.typeProduitDesignation] !== undefined) {
      typeCounts[produit.typeProduitDesignation]++;
    }
  });

  return typeCounts;
};

const processDataByYear = (documents: Document[]) => {
  const yearCounts: Record<string, number> = {};

  documents.forEach(doc => {
    if (doc.dateCreation) {
      const year = new Date(doc.dateCreation).getFullYear().toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });

  console.log('Processed data by year:', yearCounts); // Log processed data
  return yearCounts;
};

const processDataByMonth = (documents: Document[]) => {
  const monthCounts: Record<string, number> = {};

  documents.forEach(doc => {
    if (doc.dateCreation) {
      const month = new Date(doc.dateCreation).toLocaleString('default', { month: 'long', year: 'numeric' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  });

  return monthCounts;
};

const processDataByTrimester = (documents: Document[]) => {
  const trimesterCounts: Record<string, number> = {};

  documents.forEach(doc => {
    if (doc.dateCreation) {
      const date = new Date(doc.dateCreation);
      const year = date.getFullYear();
      const trimester = `T${Math.floor(date.getMonth() / 3) + 1} ${year}`;
      trimesterCounts[trimester] = (trimesterCounts[trimester] || 0) + 1;
    }
  });

  return trimesterCounts;
};

function createTypeChart(typeCounts: Record<string, number>) {
  const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
  if (!ctx) return;
  if (typeChart) { typeChart.destroy(); }

  typeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(typeCounts),
      datasets: [{
        label: "Nombre de Produits",
        data: Object.values(typeCounts),
        backgroundColor: [
          "#42a5f5", "#66bb6a", "#ffa726", "#ab47bc", "#ffca28", "#8d6e63"
        ],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#90caf9", font: { size: 13 } },
          grid: { color: "#234" }
        },
        x: {
          ticks: { color: "#90caf9", font: { size: 13 } }
        }
      }
    }
  });
}

function createDocumentsChart(data: Record<string, number>, label: string) {
  const ctx = document.getElementById('documentsChart') as HTMLCanvasElement;
  if (!ctx) {
    console.error('Canvas element not found');
    return;
  }

  // Destroy the existing chart if it exists
  if (documentsChart) {
    documentsChart.destroy();
  }

  console.log('Creating chart with data:', data); // Log data being used for the chart

  documentsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: label,
        data: Object.values(data),
        backgroundColor: [
          "#42a5f5", "#66bb6a", "#ffa726", "#ab47bc", "#ffca28", "#8d6e63"
        ],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#90caf9", font: { size: 13 } },
          grid: { color: "#234" }
        },
        x: {
          ticks: { color: "#90caf9", font: { size: 13 } }
        }
      }
    }
  });
}

const showDocumentsByYear = async () => {
  const documents = await fetchDocuments();
  const yearCounts = processDataByYear(documents);
  createDocumentsChart(yearCounts, "Documents by Year");
};

const showDocumentsByMonth = async () => {
  const documents = await fetchDocuments();
  const monthCounts = processDataByMonth(documents);
  createDocumentsChart(monthCounts, "Documents by Month");
};

const showDocumentsByTrimester = async () => {
  const documents = await fetchDocuments();
  const trimesterCounts = processDataByTrimester(documents);
  createDocumentsChart(trimesterCounts, "Documents by Trimester");
};

onMounted(async () => {
  await fetchData();
  await fetchRecentDocuments();

  const types = await fetchTypes();
  const produits = await fetchProduits();
  const typeCounts = processData(types, produits);

  setTimeout(() => createTypeChart(typeCounts), 180); // ensure DOM is ready

  // Initialize documents chart by year
  const documents = await fetchDocuments();
  const yearCounts = processDataByYear(documents);
  setTimeout(() => createDocumentsChart(yearCounts, "Documents by Year"), 180);
});
</script>

<style scoped>
/* Add or keep your previous styles */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
.dashboard-root {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 3rem max(2vw, 25px);
  box-sizing: border-box;
  background: linear-gradient(125deg, #141829 70%, #1f2962 120%);
}
.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.2em;
}
.dashboard-title {
  color: #90caf9;
  font-size: 2em;
  font-weight: 900;
  margin-bottom: 0.2em;
  text-shadow: 0 6px 32px #1a237e77, 0 1px 0 #292a37;
}
.dashboard-search input[type="search"] {
  padding: 0.5em 1.2em 0.5em 0.8em;
  border-radius: 0.8em;
  border: 1.2px solid #2196f360;
  background: linear-gradient(90deg, #1a237e50 10%, #243a7740 100%);
  color: #c6e2fa;
  font-size: 1em;
  width: 200px;
  min-width: 140px;
  max-width: 100%;
  outline: none;
  transition: border-color 0.22s;
  box-shadow: 0px 2px 9px 0 #1a237e0e;
}
.dashboard-grid.modern-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 2fr));
  gap: 0.8rem;
  margin-bottom: 1.3rem;
  width: 100%;
}
.stat-card.modern {
  display: flex;
  align-items: center;
  gap: 0.6em;
  background: linear-gradient(123deg,#1e2640 60%, #32477b 120%);
  padding: 0.7em 0.75em;
  border-radius: 0.8em;
  box-shadow: 0 1.2px 10px 0 #242a4999;
  border: 1.1px solid #3d65ad85;
  min-width: 0;
  word-break: break-word;
  transition: box-shadow 0.2s, transform 0.18s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-size: 0.97em;
}
.stat-card.modern:hover {
  box-shadow: 0 6px 18px 1px #2af5f3bb, 0 2px 22px #37519c88;
  transform: translateY(-2.5px) scale(1.025);
}
.stat-icon {
  font-size: 1.555em;
  background: linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%);
  color: #243463;
  border-radius: 0.7em;
  padding: 0.28em 0.35em;
  box-shadow: 0 1px 5px 0px #59c7da1e;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  min-height: 38px;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-label {
  color: #66eaf3;
  font-size: 0.97em;
  font-weight: bold;
  margin-bottom: 0.12em;
  text-shadow: 0 2px 4px #2434631b;
}
.stat-value {
  font-size: 1.1em;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 3px 8px #0fffc533, 0 0.3px 1px #286fb9a1;
}
.charts-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 4rem;
}

.chart-container {
  flex: 1;
  height: 400px; /* Fixed height for both chart containers */
}

.chart-card {
  height: 100%; /* Ensure the chart card takes the full height of the container */
  background: linear-gradient(115deg, #223361cc 65%, #26377eaa 120%);
  padding: 1.5em 1.2em;
  border-radius: 1.0em;
  box-shadow: 0 0.8px 14px 0 #283b7a29;
  border: 1.1px solid #2196f345;
  margin-bottom: 2em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chart-title {
  font-weight: bold;
  color: #90caf9;
  margin-bottom: 0.4em;
  font-size: 1em;
}

.chart-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.chart-buttons button {
  padding: 10px 20px;
  background-color: #42a5f5;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.chart-buttons button:hover {
  background-color: #2196f3;
}

.chart-placeholder {
  width: 100%;
  height: 350px; /* Height for the chart itself */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Lower sections remain unchanged from your original. */
.dashboard-section {
  margin-bottom: 2.5em;
  background: linear-gradient(99deg,#232f4bdd 90%, #243a7710 130%);
  border-radius: 1.3em;
  padding: 2em;
  box-shadow: 0 1.5px 16px 0 #18306a33;
}
.section-title {
  color: #90caf9;
  font-size: 1.15em;
  font-weight: 800;
  border-left: 4px solid #3ff780;
  padding-left: 0.9em;
  margin-bottom: 1.1em;
  text-shadow: 0 2px 9px #1a237e25;
}
.recent-docs-list { display: flex; flex-direction: column; gap: 1em; }
.doc-item {
  display: flex; align-items: center; gap: 1.2em;
  background: #181e3e55; border-radius: 0.8em; padding: 0.7em 1em;
  color: #e2f0fb; font-size: 1.08em; border: 1px solid #2196f325;
  min-width: 0; word-break: break-word;
}
.doc-type {
  border-radius: 0.5em;
  color: #fff;
  font-weight: bold;
  font-size: 0.98em;
  padding: 0.2em 0.8em;
  margin-right: 0.4em;
  background: #2196f3bb;
}
.doc-type.autre { background: #90caf9; color: #111; }
.doc-type.pdf { background: #2196f3bb; color: #fff; }
.doc-date { margin-left: auto; color: #b5d6fa; font-size: 0.93em; font-style: italic;}
.activity-list { display: flex; flex-direction: column; gap: 1em;}
.activity-item { display: flex; align-items: center; gap: 1em; background: #22336166; border-radius: 0.8em; padding: 0.7em 1em; color: #e9fafc;}
.activity-icon { font-size: 1.45em; padding-right: 0.3em;}
.activity-icon.added { color: #3ff780;}
.activity-date { margin-left: auto; color: #b5d6fa; font-size: 0.93em;}
.warnings-card { background: linear-gradient(102deg, #2e3d52ee 79%, #1a237e55 140%); color: #ffebee;}
.warn-title { color: #ffbebe; border-left: 4px solid #ff6b6b;}
.warnings-list { margin: 0.7em 0 0 0.5em; padding-left: 1em;}
.exp-badge { background: #ff6b6b; color: #fff; border-radius: 0.5em; font-size: 0.85em; padding: 0.1em 0.7em; margin-left: 1.1em;}
.exp-badge.soon { background: #ffb74d; color: #273; font-weight: bold;}
@media (max-width: 1200px) {
  .dashboard-header {flex-direction: column;gap: 1.2em;align-items: stretch;}
  .dashboard-title {font-size: 1.1em;}
  .dashboard-grid.modern-stats {grid-template-columns: 1fr; gap: 0.7em;}
}
@media (max-width: 700px) {
  .dashboard-root { padding: 0.4rem 0.02rem;}
  .stat-card.modern { flex-direction: column; align-items: flex-start; padding:0.6em;}
}
</style>
