<template>
  <div class="dashboard-root">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Tableau de bord</h1>
    </div>

    <!-- Highlighted Stats Cards -->
    <div class="dashboard-grid highlighted-stats">
      <template v-for="key in ['types de produits', 'produits', 'documents', 'documents non validés']" :key="key">
        <div class="stat-card highlighted" v-if="filteredStatistics[key] !== undefined">
          <div class="stat-icon">
            <i :class="iconForKey(key)"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">
              {{ formatKey(key) }}
              <span v-if="key === 'documents'" class="stat-subtitle"> (plan, multimédia...)</span>
            </div>
            <div class="stat-value">{{ filteredStatistics[key] }}</div>
          </div>
        </div>
      </template>
    </div>

    <!-- Regular Stats Cards -->
    <div class="dashboard-grid modern-stats">
      <div class="stat-card modern" v-for="(value, key) in regularStatistics" :key="key">
        <div class="stat-icon">
          <i :class="iconForKey(key)"></i>
        </div>
        <div class="stat-info">
          <div class="stat-label">{{ formatKey(key) }}</div>
          <div class="stat-value">{{ value }}</div>
        </div>
      </div>
    </div>

    <!-- Document Structure Section -->
    <div class="dashboard-section">
      <h2 class="section-title">Structure documentaire</h2>
      <div class="document-structure-grid">
        <div class="doc-structure-card" v-for="(value, key) in documentStructure" :key="key">
          <div class="doc-structure-icon">
            <i :class="iconForDocStructure(key)"></i>
          </div>
          <div class="doc-structure-info">
            <div class="doc-structure-label">{{ formatDocStructureKey(key) }}</div>
            <div class="doc-structure-value">{{ value }}</div>
          </div>
        </div>
      </div>
    </div>



    <!-- Charts Section -->
    <div class="charts-container">
      <!-- Chart 3: Répartition par produit/type -->
      <div class="chart-container">
        <div class="chart-card glass" style="height: 100%; display: flex; flex-direction: column;">
          <div class="chart-title" style="margin-bottom: 1rem;">Répartition des produits par type</div>
          <div class="chart-placeholder" style="flex: 1; min-height: 0;">
            <canvas id="typeChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Chart 2: Documents par type de produit -->
      <div class="chart-container">
        <div class="chart-card glass">
          <div class="chart-header">
            <div class="chart-title">Documents par type de produit</div>
            <button @click="toggleLegendDropdown" class="view-all-btn">
              {{ showLegendDropdown ? 'Masquer' : 'Voir tout' }}
              <span class="dropdown-arrow">{{ showLegendDropdown ? '▲' : '▼' }}</span>
            </button>
          </div>
          <div class="chart-content">
            <div class="chart-placeholder">
              <canvas id="productTypeChart"></canvas>
            </div>
            <div class="legend-sidebar">
              <div class="legend-container">
                <div class="legend-header">
                  {{ showLegendDropdown ? `Tous les types (${Object.keys(productTypeData).length})` : 'Top 10 Types de produits' }}
                </div>
                <div class="legend-list">
                  <div 
                    v-for="(item, index) in (showLegendDropdown ? sortedProductTypes : top10Items)" 
                    :key="item.name"
                    class="legend-item"
                  >
                    <div class="legend-color" :style="{ backgroundColor: legendColors[index] }"></div>
                    <div class="legend-text">{{ item.name }} ({{ item.value }})</div>
                  </div>
                </div>
                <button @click="toggleLegendDropdown" class="view-all-btn legend-btn">
                  {{ showLegendDropdown ? 'Voir moins' : 'Voir tout' }}
                  <span class="dropdown-arrow">{{ showLegendDropdown ? '▲' : '▼' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart 1: Documents par produit -->
      <!-- <div class="chart-container">
        <div class="chart-card glass">
          <div class="chart-header">
            <div class="chart-title">Documents par produit</div>
            <button @click="toggleProductDropdown" class="view-all-btn">
              {{ showProductDropdown ? 'Masquer' : 'Voir tout' }}
              <span class="dropdown-arrow">{{ showProductDropdown ? '▲' : '▼' }}</span>
            </button>
          </div>
          <div class="chart-content">
            <div class="chart-placeholder">
              <canvas id="productChart"></canvas>
            </div>
            <div class="legend-sidebar">
              <div class="legend-container">
                <div class="legend-header">
                  {{ showProductDropdown ? `Tous les produits (${Object.keys(productData).length})` : 'Top 10 Produits' }}
                </div>
                <div class="legend-list">
                  <div 
                    v-for="(item, index) in (showProductDropdown ? sortedProducts : top10Products)" 
                    :key="item.name"
                    class="legend-item"
                  >
                    <div class="legend-color" :style="{ backgroundColor: legendColors[index] }"></div>
                    <div class="legend-text">{{ item.name }} ({{ item.value }})</div>
                  </div>
                </div>
                <button @click="toggleProductDropdown" class="view-all-btn legend-btn">
                  {{ showProductDropdown ? 'Voir moins' : 'Voir tout' }}
                  <span class="dropdown-arrow">{{ showProductDropdown ? '▲' : '▼' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Chart 4: Documents par produit et subdivision -->
      <!-- <div class="chart-container chart-container-wide" style="margin-top: 2rem;">
        <div class="chart-card glass">
          <div class="chart-header">
            <div class="chart-title">Documents par produit (Pièces écrites & graphiques)</div>
            <div class="filter-controls">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher un produit..."
                class="search-input"
              />
              <button @click="toggleFilterDropdown" class="filter-btn">
                <i class="fas fa-filter"></i> Filtrer ({{ selectedProducts.length }})
              </button>
              <button 
                v-if="appliedFilters.length > 0 || searchQuery.trim()"
                @click="removeAllFilters" 
                class="remove-filter-btn"
              >
                <i class="fas fa-times"></i> Supprimer filtres
              </button>
            </div>
          </div>
          
          
          <div v-if="showFilterDropdown" class="filter-dropdown">
            <div class="filter-header">
              <span>Sélectionner les produits</span>
              <button @click="clearFilters" class="clear-btn">Effacer tout</button>
            </div>
            <div class="filter-list">
              <label v-for="item in sortedSubdivisionData" :key="item.product" class="filter-item">
                <input 
                  type="checkbox" 
                  :value="item.product" 
                  v-model="selectedProducts"
                  class="filter-checkbox"
                />
                <span class="filter-label">{{ item.product }} ({{ item.total }})</span>
              </label>
            </div>
            <div class="filter-actions">
              <button @click="applyFilters" class="apply-btn">Appliquer</button>
              <button @click="showFilterDropdown = false" class="cancel-btn">Annuler</button>
            </div>
          </div>

          <div class="subdivision-grid">
            <div 
              v-for="item in filteredSubdivisionData" 
              :key="item.product" 
              class="subdivision-card"
            >
              <div class="subdivision-card-header">
                <i class="fas fa-box subdivision-card-icon"></i>
                <div class="subdivision-product-title">{{ item.product }}</div>
                <div class="subdivision-total-badge">{{ item.total }}</div>
              </div>
              <div class="subdivision-card-body">
                <div v-for="(count, type) in item.subdivisions" :key="type" class="subdivision-detail-row">
                  <div class="subdivision-detail-icon" :style="{ backgroundColor: getTypeColor(type) }">
                    <i :class="getTypeIcon(type)"></i>
                  </div>
                  <span class="subdivision-detail-label">{{ type }}</span>
                  <span class="subdivision-detail-count">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Chart 5: Total documents par produit (Bar Chart) -->
      <div class="chart-container chart-container-wide" style="margin-top: 2rem;">
        <div class="chart-card glass">
          <div class="chart-header">
            <div class="chart-title">Total documents par produit (plus de 20 documents)</div>
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
            </div>
          </div>
          <div style="height: 700px; overflow-y: auto;">
            <canvas id="totalProductChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Commented out: Documents by Year/Month/Trimester
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
      -->
    </div>

    <!-- Recent Documents Row - Dynamic -->
    <!-- <div class="dashboard-section">
      <h2 class="section-title">Derniers documents ajoutés</h2>
      <div class="recent-docs-list">
        <div
          class="doc-item"
          v-for="doc in recentDocuments"
          :key="doc.idDocument"
        >
          <span
            class="doc-type"
            :class="doc.fichier_pdf ? 'pdf' : 'pdf'"
          >{{ doc.fichier_pdf ? 'PDF' : 'PDF' }}</span>
          {{ doc.designation }}
          <span class="doc-date">{{ doc.dateCreation }}</span>
        </div>
        <div v-if="recentDocuments.length === 0">
          Aucun document récent à afficher.
        </div>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import axiosInstance from '../axios';
const loading = ref(true);

// --- Modern Statistics Mapping ---
const iconMap: Record<string, string> = {
  "types de produits": "fas fa-cubes",
  "produits": "fas fa-box",
  "bureaux d'études": "fas fa-user-tie",
  "projets": "fas fa-project-diagram",
  "maîtres d’œuvre": "fas fa-hard-hat",
  "maîtres d’ouvrage": "fas fa-briefcase",
  "fournisseurs": "fas fa-truck",
  "soustraitants": "fas fa-people-carry",
  "direction des projets": "fas fa-sitemap",
  "documents": "fas fa-file-alt",
  "documents valides": "fas fa-check-circle",
  "documents non valides": "fas fa-times-circle",
};

const docStructureIconMap: Record<string, string> = {
  "doc_defin_realis": "fas fa-file-contract",
  "procedes_tech": "fas fa-cogs",
  "moyens_meo": "fas fa-tools",
  "jalons": "fas fa-flag-checkered",
  "contexte": "fas fa-info-circle"
};

const docStructureLabelMap: Record<string, string> = {
  "doc_defin_realis": "Doc. de définition & réalisation",
  "procedes_tech": "Procédés & tech. utilisés",
  "moyens_meo": "Moyens MEO",
  "jalons": "Jalons (principaux événements)",
  "contexte": "Contexte"
};

const keyLabelMap: Record<string, string> = {
  "types de produits": "Types de produits",
  "produits": "Produits",
  "documents": "Documents",
  "bureaux d'études": "Bureaux d'études",
  "projets": "Projets",
  "maîtres d’œuvre": "Maîtres d’œuvre",
  "maîtres d’ouvrage": "Maîtres d’ouvrage",
  "fournisseurs": "Fournisseurs",
  "soustraitants": "Soustraitants",
  "direction des projets": "Direction des projets",
  // "documents valides": "Documents validés",
  "documents non valides": "Documents non validés",
};

function iconForKey(key: string): string {
  return iconMap[key] || "fas fa-info-circle";
}
function formatKey(key: string): string {
  return keyLabelMap[key] || key;
}

function iconForDocStructure(key: string): string {
  return docStructureIconMap[key] || "fas fa-file";
}
function formatDocStructureKey(key: string): string {
  return docStructureLabelMap[key] || key;
}

// State
const statistics = ref<Record<string, number>>({});
const filteredStatistics = ref<Record<string, number>>({});
const regularStatistics = ref<Record<string, number>>({});
const documentStructure = ref<Record<string, number>>({});
const showLegendDropdown = ref(false);
const productTypeData = ref<Record<string, number>>({});
const sortedProductTypes = ref<{name: string, value: number}[]>([]);
const top10Items = ref<{name: string, value: number}[]>([]);
const legendColors = ref<string[]>([]);

// const showProductDropdown = ref(false);
const productData = ref<Record<string, number>>({});
const sortedProducts = ref<{name: string, value: number}[]>([]);
const top10Products = ref<{name: string, value: number}[]>([]);

// const showSubdivisionDropdown = ref(false);
const subdivisionData = ref<Record<string, Record<string, number>>>({});
const sortedSubdivisionData = ref<{product: string, total: number, subdivisions: Record<string, number>}[]>([]);

const totalPiecesEcrites = ref(0);
const totalPiecesGraphiques = ref(0);
const abbreviationMap = ref<Record<string, string | null>>({});

// const searchQuery = ref('');
// const selectedProducts = ref<string[]>([]);
// const appliedFilters = ref<string[]>([]);
// const showFilterDropdown = ref(false);

// const filteredSubdivisionData = computed(() => {
//   let filtered = sortedSubdivisionData.value;
  
//   // Apply selected filters
//   if (appliedFilters.value.length > 0) {
//     filtered = filtered.filter(item => appliedFilters.value.includes(item.product));
//   }
  
//   // Apply search query
//   if (searchQuery.value.trim()) {
//     const query = searchQuery.value.toLowerCase();
//     filtered = filtered.filter(item => item.product.toLowerCase().includes(query));
//   }
  
//   return filtered;
// });

// const toggleFilterDropdown = () => {
//   showFilterDropdown.value = !showFilterDropdown.value;
// };

// const applyFilters = () => {
//   appliedFilters.value = [...selectedProducts.value];
//   showFilterDropdown.value = false;
// };

// const clearFilters = () => {
//   selectedProducts.value = [];
//   appliedFilters.value = [];
// };

// const removeAllFilters = () => {
//   selectedProducts.value = [];
//   appliedFilters.value = [];
//   searchQuery.value = '';
// };

// const getTypeColor = (type: string): string => {
//   const colors: Record<string, string> = {
//     'PIECES ECRITES': '#42a5f5',
//     'PIECES GRAPHIQUES': '#66bb6a',
//     'TECHNIQUES DE COFFRAGE': '#ffa726',
//     'TECHNIQUES DE FONDATION': '#ab47bc',
//     'TECHNIQUES D\'ETAIEMENT': '#ffca28',
//     'TECHNIQUES DE FORAGE': '#26c6da',
//     'TECHNIQUES DE PRODUCTION': '#ef5350'
//   };
//   return colors[type] || '#78909c';
// };

// const getTypeIcon = (type: string): string => {
//   const icons: Record<string, string> = {
//     'PIECES ECRITES': 'fas fa-file-alt',
//     'PIECES GRAPHIQUES': 'fas fa-image',
//     'TECHNIQUES DE COFFRAGE': 'fas fa-hammer',
//     'TECHNIQUES DE FONDATION': 'fas fa-layer-group',
//     'TECHNIQUES D\'ETAIEMENT': 'fas fa-tools',
//     'TECHNIQUES DE FORAGE': 'fas fa-drill',
//     'TECHNIQUES DE PRODUCTION': 'fas fa-industry'
//   };
//   return icons[type] || 'fas fa-file';
// };

const fetchData = async () => {
  loading.value = true;
  try {
    const statisticsResponse = await axiosInstance.get('statistics/');
    const raw = statisticsResponse.data.statistics;
    statistics.value = {
      "types de produits": raw["type produits"],
      "produits": raw["produits"],
      "documents": raw["documents"],
      "projets": raw["projets"],
      "maîtres d’ouvrage": raw["maitre ouvrages"],
      "maîtres d’œuvre": raw["maitre oeuvres"],
      "bureaux d'études": raw["bureau etudes"],
      "fournisseurs": raw["fournisseurs"],
      "soustraitants": raw["soustraitantss"],
      "direction des projets": raw["direction projets"],
      // "documents validés": raw["Documents valides"],
      "documents non validés": raw["Documents non valides"],
    };
    filteredStatistics.value = {
      "types de produits": statistics.value["types de produits"],
      "produits": statistics.value["produits"],
      "documents": statistics.value["documents"],
      "documents non validés": statistics.value["documents non validés"],
    };
    const {
      "types de produits": _tp,
      "produits": _p,
      "documents": _d,
      "documents non validés": _dnv,
      ...regular
    } = statistics.value;
    regularStatistics.value = regular;
    
    documentStructure.value = {
      "doc_defin_realis": raw["DOCUMENTS de DEFINITION & de REALISATION"],
      "procedes_tech": raw["PROCEDES & TECHNIQUES DE REALISATION"],
      "moyens_meo": raw["MOYENS M.E.O."],
      "jalons": raw["JALONS"],
      "contexte": raw["CONTEXTE"]
    };
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
let productTypeChart: Chart | null = null;
let productChart: Chart | null = null;
let totalProductChart: Chart | null = null;
// let documentsChart: Chart | null = null; // Commented out

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

function createTypeChart(typeCounts: Record<string, number>) {
  const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
  if (!ctx) return;
  if (typeChart) { typeChart.destroy(); }

  const maxValue = Math.max(...Object.values(typeCounts));

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
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: maxValue * 1.1,
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

// Create total product chart
function createTotalProductChart(data: Record<string, Record<string, number>>) {
  const ctx = document.getElementById('totalProductChart') as HTMLCanvasElement;
  if (!ctx) return;
  if (totalProductChart) { totalProductChart.destroy(); }

  // Calculate totals and separate pieces ecrites/graphiques
  const productTotals = Object.entries(data).map(([product, subdivisions]) => {
    const piecesEcrites = subdivisions['PIECES ECRITES'] || 0;
    const piecesGraphiques = subdivisions['PIECES GRAPHIQUES'] || 0;
    const total = Object.values(subdivisions).reduce((sum, count) => sum + count, 0);
    return { product, piecesEcrites, piecesGraphiques, total };
  });

  // Filter products with more than 20 documents and sort
  const filteredProducts = productTotals
    .filter(p => p.total > 20)
    .sort((a, b) => b.total - a.total);
  
  // Calculate totals for summary
  totalPiecesEcrites.value = filteredProducts.reduce((sum, p) => sum + p.piecesEcrites, 0);
  totalPiecesGraphiques.value = filteredProducts.reduce((sum, p) => sum + p.piecesGraphiques, 0);
  
  const maxValue = Math.max(...filteredProducts.map(p => p.total));

  // Use abbreviation for X-axis label if available, otherwise full name
  const xLabels = filteredProducts.map(item =>
    abbreviationMap.value[item.product] || item.product
  );

  ctx.height = filteredProducts.length * 60;

  totalProductChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: xLabels,
      datasets: [
        {
          label: 'Pièces écrites',
          data: filteredProducts.map(item => item.piecesEcrites),
          backgroundColor: '#42a5f5',
          borderRadius: 6
        },
        {
          label: 'Pièces graphiques',
          data: filteredProducts.map(item => item.piecesGraphiques),
          backgroundColor: '#66bb6a',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#90caf9', font: { size: 14 } }
        },
        tooltip: {
          backgroundColor: '#1a237e',
          titleColor: '#90caf9',
          bodyColor: '#fff',
          titleFont: { size: 15 },
          bodyFont: { size: 14 },
          padding: 12,
          callbacks: {
            title: function(context) {
              // Always show full product name in tooltip title
              const dataIndex = context[0].dataIndex;
              return filteredProducts[dataIndex].product;
            },
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value}`;
            },
            footer: function(context) {
              const dataIndex = context[0].dataIndex;
              const total = filteredProducts[dataIndex].total;
              return `Total: ${total}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { 
            color: '#90caf9', 
            font: { size: 13 },
            maxRotation: 90,
            minRotation: 45
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: maxValue * 1.1,
          ticks: { color: '#90caf9', font: { size: 13 } },
          grid: { color: '#234' }
        }
      }
    }
  });
}



// Fetch documents by product type
const fetchDocumentsByProductType = async () => {
  try {
    const response = await axiosInstance.get('documents-par-type-produit/');
    console.log('API Response:', response.data);
    return response.data["Documents par type de produit"] || {};
  } catch (error) {
    console.error('Error fetching documents by product type:', error);
    return {};
  }
};

// Fetch documents by product
const fetchDocumentsByProduct = async () => {
  try {
    const response = await axiosInstance.get('documents-par-produit/');
    console.log('Documents par produit API Response:', response.data);
    return response.data["Documents par produit"] || response.data || {};
  } catch (error) {
    console.error('Error fetching documents by product:', error);
    return {};
  }
};

// Fetch documents by product subdivision
const fetchDocumentsByProductSubdivision = async () => {
  try {
    const response = await axiosInstance.get('document-count-by-produit-subdivision-1/');
    // New format: { productName: { abbreviation: string|null, subdivisions: {...} } }
    const raw = response.data || {};
    const normalized: Record<string, Record<string, number>> = {};
    for (const [name, val] of Object.entries(raw as Record<string, { abbreviation: string | null, subdivisions: Record<string, number> }>)) {
      normalized[name] = val.subdivisions;
    }
    // Store abbreviations separately
    abbreviationMap.value = Object.fromEntries(
      Object.entries(raw as Record<string, { abbreviation: string | null, subdivisions: Record<string, number> }>)
        .map(([name, val]) => [name, val.abbreviation || null])
    );
    return normalized;
  } catch (error) {
    console.error('Error fetching documents by product subdivision:', error);
    return {};
  }
};

// Create product type chart
function createProductTypeChart(data: Record<string, number>) {
  console.log('Chart data received:', data);
  const ctx = document.getElementById('productTypeChart') as HTMLCanvasElement;
  if (!ctx) {
    console.error('Canvas element productTypeChart not found');
    return;
  }
  if (productTypeChart) { productTypeChart.destroy(); }

  // Extended color palette for more variety
  const colors = [
    '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ffca28', '#8d6e63', 
    '#26c6da', '#ef5350', '#7e57c2', '#29b6f6', '#26a69a', '#ff7043',
    '#78909c', '#5c6bc0', '#42a5f5', '#ec407a', '#d4e157', '#ffa726',
    '#8bc34a', '#ff9800', '#9c27b0', '#2196f3'
  ];

  // Sort data by document count (highest to lowest)
  const sortedEntries = Object.entries(data).sort(([,a], [,b]) => b - a);
  
  // Create labels with document counts from sorted data
  const labelsWithCounts = sortedEntries.map(([key, value]) => 
    `${key} (${value})`
  );
  
  // Get sorted values
  const sortedValues = sortedEntries.map(([,value]) => value);

  productTypeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labelsWithCounts,
      datasets: [{
        data: sortedValues,
        backgroundColor: colors,
        borderColor: '#1a237e',
        borderWidth: 2,
        hoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          right: 20
        }
      },
      plugins: {
        legend: {
          display: false // Disable chart legend, use custom dropdown
        },
        tooltip: {
          backgroundColor: '#1a237e',
          titleColor: '#90caf9',
          bodyColor: '#fff',
          borderColor: '#42a5f5',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${percentage}%`;
            }
          }
        }
      }
    }
  });
}

// Create product chart
function createProductChart(data: Record<string, number>) {
  const ctx = document.getElementById('productChart') as HTMLCanvasElement;
  if (!ctx) {
    console.error('Canvas element productChart not found');
    return;
  }
  if (productChart) { productChart.destroy(); }

  const colors = [
    '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ffca28', '#8d6e63', 
    '#26c6da', '#ef5350', '#7e57c2', '#29b6f6', '#26a69a', '#ff7043',
    '#78909c', '#5c6bc0', '#42a5f5', '#ec407a', '#d4e157', '#ffa726',
    '#8bc34a', '#ff9800', '#9c27b0', '#2196f3'
  ];

  const sortedEntries = Object.entries(data).sort(([,a], [,b]) => b - a);
  const labelsWithCounts = sortedEntries.map(([key, value]) => `${key} (${value})`);
  const sortedValues = sortedEntries.map(([,value]) => value);

  productChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labelsWithCounts,
      datasets: [{
        data: sortedValues,
        backgroundColor: colors,
        borderColor: '#1a237e',
        borderWidth: 2,
        hoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          right: 20
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1a237e',
          titleColor: '#90caf9',
          bodyColor: '#fff',
          borderColor: '#42a5f5',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${percentage}%`;
            }
          }
        }
      }
    }
  });
}

// Commented out period-based functions
/*
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
*/

onMounted(async () => {
  await fetchData();
  await fetchRecentDocuments();

  const types = await fetchTypes();
  const produits = await fetchProduits();
  const typeCounts = processData(types, produits);

  setTimeout(() => createTypeChart(typeCounts), 180); // ensure DOM is ready

  // Initialize product type chart
  productTypeData.value = await fetchDocumentsByProductType();
  
  // Prepare sorted data and colors for custom legend
  const sortedEntries = Object.entries(productTypeData.value).sort(([,a], [,b]) => b - a);
  sortedProductTypes.value = sortedEntries.map(([name, value]) => ({ name, value }));
  top10Items.value = sortedProductTypes.value.slice(0, 10);
  
  const colors = [
    '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ffca28', '#8d6e63', 
    '#26c6da', '#ef5350', '#7e57c2', '#29b6f6', '#26a69a', '#ff7043',
    '#78909c', '#5c6bc0', '#42a5f5', '#ec407a', '#d4e157', '#ffa726',
    '#8bc34a', '#ff9800', '#9c27b0', '#2196f3'
  ];
  legendColors.value = colors;
  
  setTimeout(() => createProductTypeChart(productTypeData.value), 180);

  // Initialize product chart
  productData.value = await fetchDocumentsByProduct();
  const sortedProductEntries = Object.entries(productData.value).sort(([,a], [,b]) => b - a);
  sortedProducts.value = sortedProductEntries.map(([name, value]) => ({ name, value }));
  top10Products.value = sortedProducts.value.slice(0, 10);
  
  setTimeout(() => createProductChart(productData.value), 180);

  // Initialize subdivision data
  subdivisionData.value = await fetchDocumentsByProductSubdivision();
  
  // Prepare sorted data for display
  sortedSubdivisionData.value = Object.entries(subdivisionData.value).map(([product, subdivisions]) => {
    const total = Object.values(subdivisions).reduce((sum, count) => sum + count, 0);
    return { product, total, subdivisions };
  }).sort((a, b) => b.total - a.total);

  // Create total product chart
  setTimeout(() => createTotalProductChart(subdivisionData.value), 180);
});

// Toggle dropdown function
const toggleLegendDropdown = () => {
  showLegendDropdown.value = !showLegendDropdown.value;
};

// const toggleProductDropdown = () => {
//   showProductDropdown.value = !showProductDropdown.value;
// };
</script>

<style scoped>
/* Add or keep your previous styles */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
.dashboard-root {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 1.5rem max(1.5vw, 15px);
  box-sizing: border-box;
  background: linear-gradient(125deg, #141829 70%, #1f2962 120%);
}
.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.8em;
}
.dashboard-title {
  color: #90caf9;
  font-size: 1.4em;
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
.dashboard-grid.highlighted-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
  margin-bottom: 1rem;
  width: 100%;
}
.dashboard-grid.modern-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 2fr));
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  width: 100%;
}
.stat-card.modern {
  display: flex;
  align-items: center;
  gap: 0.4em;
  background: linear-gradient(123deg,#1e2640 60%, #32477b 120%);
  padding: 0.5em 0.6em;
  border-radius: 0.6em;
  box-shadow: 0 1.2px 10px 0 #242a4999;
  border: 1.1px solid #3d65ad85;
  min-width: 0;
  word-break: break-word;
  transition: box-shadow 0.2s, transform 0.18s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-size: 0.85em;
}
.stat-card.modern:hover {
  box-shadow: 0 6px 18px 1px #2af5f3bb, 0 2px 22px #37519c88;
  transform: translateY(-2.5px) scale(1.025);
}
.stat-card.highlighted {
  display: flex;
  align-items: center;
  gap: 0.4em;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
  padding: 0.6em 0.7em;
  border-radius: 0.7em;
  box-shadow: 0 4px 15px 0 #1e3a8a44, 0 2px 8px 0 #3b82f633;
  border: 1.5px solid #3b82f660;
  min-width: 0;
  word-break: break-word;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-size: 0.9em;
}
.stat-card.highlighted:hover {
  box-shadow: 0 6px 20px 1px #1e3a8a66, 0 3px 12px 0 #3b82f644;
  transform: translateY(-2px);
}
.stat-card.highlighted .stat-icon {
  background: linear-gradient(135deg, #fff 0%, #f1f5f9 100%);
  color: #1e3a8a;
  font-size: 1.6em;
  box-shadow: 0 2px 8px 0 #00000015;
}
.stat-card.highlighted .stat-label {
  color: #e1f5fe;
  font-weight: 800;
  text-shadow: 0 1px 4px #00000030;
  font-size: 1em;
}
.stat-card.highlighted .stat-value {
  color: #fff;
  font-weight: 800;
  text-shadow: 0 2px 6px #00000040;
  font-size: 1.2em;
}
.stat-subtitle {
  color: #b3d9ff;
  font-size: 0.9em;
  font-style: italic;
  opacity: 0.9;
}
.stat-icon {
  font-size: 1.4em;
  background: linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%);
  color: #243463;
  border-radius: 0.6em;
  padding: 0.25em 0.3em;
  box-shadow: 0 1px 5px 0px #59c7da1e;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  min-height: 34px;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-label {
  color: #66eaf3;
  font-size: 0.9em;
  font-weight: bold;
  margin-bottom: 0.1em;
  text-shadow: 0 2px 4px #2434631b;
}
.stat-value {
  font-size: 1em;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 3px 8px #0fffc533, 0 0.3px 1px #286fb9a1;
}
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2.5rem;
}

.chart-container {
  flex: 1;
  height: 510px;
  min-width: 600px;
}

.chart-container-wide {
  grid-column: 1 / -1;
  height: auto;
  min-width: 100%;
}

.chart-card {
  background: linear-gradient(115deg, #223361cc 65%, #26377eaa 120%);
  padding: 1em 0.9em;
  border-radius: 0.8em;
  box-shadow: 0 0.8px 14px 0 #283b7a29;
  border: 1.1px solid #2196f345;
  margin-bottom: 1.2em;
  display: flex;
  flex-direction: column;
}



.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-controls {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.search-input {
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  border: 1px solid #3d65ad85;
  background: linear-gradient(135deg, #1e2640 0%, #2a3f6f 100%);
  color: #90caf9;
  font-size: 1rem;
  min-width: 300px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #42a5f5;
  box-shadow: 0 0 0 3px rgba(66, 165, 245, 0.2);
}

.search-input::placeholder {
  color: #90caf980;
}

.filter-btn {
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 165, 245, 0.4);
}

.remove-filter-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #d32f2f 100%);
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.remove-filter-btn:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.filter-dropdown {
  background: linear-gradient(135deg, #1e2640 0%, #2a3f6f 100%);
  border: 1.5px solid #3d65ad85;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 500px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #3d65ad85;
  color: #90caf9;
  font-weight: bold;
  font-size: 1rem;
}

.clear-btn {
  background: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #ff6b6b;
  color: white;
}

.filter-list {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-item:hover {
  background: rgba(66, 165, 245, 0.1);
}

.filter-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #42a5f5;
}

.filter-label {
  color: #90caf9;
  font-size: 0.9rem;
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
}

.apply-btn {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.apply-btn:hover {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  transform: translateY(-1px);
}

.cancel-btn {
  background: transparent;
  color: #90caf9;
  border: 1px solid #3d65ad85;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(66, 165, 245, 0.1);
  border-color: #42a5f5;
}

.chart-title {
  font-weight: bold;
  color: #90caf9;
  font-size: 1.1em;
}

.chart-summary-stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.summary-stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #1e2640 0%, #2a3f6f 100%);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid #3d65ad85;
}

.summary-stat-item i {
  font-size: 1.2rem;
  color: #42a5f5;
}

.summary-label {
  color: #90caf9;
  font-size: 0.9rem;
  font-weight: 600;
}

.summary-value {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  padding: 0.2rem 0.6rem;
  border-radius: 5px;
}

.view-all-btn {
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  transform: translateY(-1px);
}

.dropdown-arrow {
  font-size: 12px;
}

.chart-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}



.legend-header {
  color: #90caf9;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 8px;
  text-align: center;
  border-bottom: 1px solid #3d65ad85;
  padding-bottom: 6px;
}

.legend-list {
  max-height: 360px;
  overflow-y: auto;
  padding-right: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #3d65ad30;
}

.legend-item:last-child {
  border-bottom: none;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
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
  flex: 0 0 30%;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.legend-sidebar {
  flex: 1;
  flex-shrink: 0;
}

.legend-container {
  background: linear-gradient(135deg, #1e2640 0%, #32477b 100%);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #3d65ad85;
}

.legend-btn {
  width: 100%;
  margin-top: 8px;
  justify-content: center;
}

.subdivision-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.2rem;
  margin-top: 1rem;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
}

.subdivision-card {
  background: linear-gradient(135deg, #1e2640 0%, #2a3f6f 100%);
  border-radius: 10px;
  padding: 0;
  border: 1.5px solid #3d65ad85;
  transition: all 0.2s ease;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.subdivision-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(42, 245, 243, 0.3);
  border-color: #42a5f5;
}

.subdivision-card-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-bottom: 2px solid #3d65ad85;
}

.subdivision-card-icon {
  font-size: 1.4rem;
  color: #42a5f5;
  min-width: 30px;
  text-align: center;
}

.subdivision-product-title {
  flex: 1;
  color: #66eaf3;
  font-weight: 700;
  font-size: 0.95rem;
  word-break: break-word;
  line-height: 1.3;
}

.subdivision-total-badge {
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.85rem;
  white-space: nowrap;
}

.subdivision-card-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.subdivision-detail-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.8rem;
  background: linear-gradient(135deg, #1a237e30 0%, #1a237e20 100%);
  border-radius: 7px;
  border: 1px solid #3d65ad40;
  transition: all 0.2s ease;
}

.subdivision-detail-row:hover {
  background: linear-gradient(135deg, #1a237e50 0%, #1a237e30 100%);
  border-color: #42a5f5;
  transform: translateX(3px);
}

.subdivision-detail-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.85rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}

.subdivision-detail-label {
  flex: 1;
  color: #90caf9;
  font-size: 0.85rem;
  font-weight: 600;
}

.subdivision-detail-count {
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  padding: 0.25rem 0.7rem;
  border-radius: 5px;
  min-width: 38px;
  text-align: center;
}

/* Lower sections remain unchanged from your original. */
.dashboard-section {
  margin-bottom: 1.5em;
  background: linear-gradient(99deg,#232f4bdd 90%, #243a7710 130%);
  border-radius: 1em;
  padding: 1.2em;
  box-shadow: 0 1.5px 16px 0 #18306a33;
}
.section-title {
  color: #90caf9;
  font-size: 1em;
  font-weight: 800;
  border-left: 4px solid #3ff780;
  padding-left: 0.7em;
  margin-bottom: 0.9em;
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

/* Document Structure Styles */
.document-structure-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.doc-structure-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #1e2640 0%, #32477b 100%);
  padding: 1rem;
  border-radius: 0.8rem;
  border: 1px solid #3d65ad85;
  transition: all 0.2s ease;
}

.doc-structure-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(42, 245, 243, 0.2);
}

.doc-structure-icon {
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  color: white;
  border-radius: 0.6rem;
  padding: 0.8rem;
  font-size: 1.2rem;
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doc-structure-info {
  flex: 1;
}

.doc-structure-label {
  color: #90caf9;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.doc-structure-value {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 800;
}



@media (max-width: 1200px) {
  .dashboard-header {flex-direction: column;gap: 1.2em;align-items: stretch;}
  .dashboard-title {font-size: 1.1em;}
  .dashboard-grid.modern-stats {grid-template-columns: 1fr; gap: 0.7em;}
  .charts-container { flex-direction: column; }
  .chart-container { min-width: auto; }
  .subdivision-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .filter-controls { flex-direction: column; width: 100%; }
  .search-input { min-width: 100%; }
}
@media (max-width: 700px) {
  .dashboard-root { padding: 0.4rem 0.02rem;}
  .stat-card.modern { flex-direction: column; align-items: flex-start; padding:0.6em;}
  .document-structure-grid { grid-template-columns: 1fr; }
  .doc-structure-card { padding: 0.8rem; }
  .subdivision-grid { grid-template-columns: 1fr; }
}
</style>
