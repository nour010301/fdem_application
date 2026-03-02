<template>
  <div class="hierarchical-stats-root">
    <div class="stats-header">
      <h1 class="stats-title">Statistiques hiérarchiques détaillées</h1>
    </div>

    <!-- Hierarchical Statistics Section -->
    <div class="stats-section" v-if="hierarchicalStats.length > 0">
      <div class="hierarchy-tree">
        <div v-for="typeNode in hierarchicalStats" :key="typeNode.name" class="tree-node">
          <div class="node-header" @click="toggleNode(getNodeId(typeNode.name, 'type'))">
            <i class="fas fa-chevron-right node-toggle" :class="{ expanded: expandedNodes.has(getNodeId(typeNode.name, 'type')) }"></i>
            <i class="fas fa-cubes node-icon"></i>
            <span class="node-name">{{ typeNode.name }}</span>
            <span class="node-count">{{ typeNode.documents_count }} docs</span>
          </div>
          
          <div v-if="expandedNodes.has(getNodeId(typeNode.name, 'type')) && typeNode.produits" class="node-children">
            <div v-for="produit in typeNode.produits" :key="produit.name" class="tree-node level-2">
              <div class="node-header" @click="toggleNode(getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type')))">
                <i class="fas fa-chevron-right node-toggle" :class="{ expanded: expandedNodes.has(getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type'))) }"></i>
                <i class="fas fa-box node-icon"></i>
                <span class="node-name">{{ produit.name }}</span>
                <span class="node-count">{{ produit.documents_count }} docs</span>
              </div>
              
              <div v-if="expandedNodes.has(getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type'))) && produit.structures" class="node-children">
                <div v-for="structure in produit.structures" :key="structure.name" class="tree-node level-3">
                  <div class="node-header" @click="toggleNode(getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type'))))">
                    <i class="fas fa-chevron-right node-toggle" :class="{ expanded: expandedNodes.has(getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type')))) }"></i>
                    <i class="fas fa-building node-icon"></i>
                    <span class="node-name">{{ structure.name }}</span>
                    <span class="node-count">{{ structure.documents_count }} docs</span>
                  </div>
                  
                  <div v-if="expandedNodes.has(getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type')))) && structure.sections" class="node-children">
                    <div v-for="section in structure.sections" :key="section.name" class="tree-node level-4">
                      <div class="node-header" @click="toggleNode(getNodeId(section.name, 'section', getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type')))))">
                        <i class="fas fa-chevron-right node-toggle" :class="{ expanded: expandedNodes.has(getNodeId(section.name, 'section', getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type'))))) }" v-if="section.subdivisions_n1"></i>
                        <i v-else class="node-spacer"></i>
                        <i class="fas fa-file-alt node-icon"></i>
                        <span class="node-name">{{ section.name }}</span>
                        <span class="node-count">{{ section.documents_count }} docs</span>
                      </div>
                      
                      <!-- Subdivisions N1 -->
                      <div v-if="expandedNodes.has(getNodeId(section.name, 'section', getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type'))))) && section.subdivisions_n1" class="node-children">
                        <div v-for="subdiv1 in section.subdivisions_n1" :key="subdiv1.name" class="tree-node level-5">
                          <div class="node-header" @click="toggleNode(getNodeId(subdiv1.name, 'subdiv1', getNodeId(section.name, 'section', getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type'))))))">
                            <i class="fas fa-chevron-right node-toggle" :class="{ expanded: expandedNodes.has(getNodeId(subdiv1.name, 'subdiv1', getNodeId(section.name, 'section', getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type')))))) }" v-if="subdiv1.subdivisions_n2"></i>
                            <i v-else class="node-spacer"></i>
                            <i class="fas fa-folder node-icon"></i>
                            <span class="node-name">{{ subdiv1.name }}</span>
                            <span class="node-count">{{ subdiv1.documents_count }} docs</span>
                          </div>
                          
                          <!-- Subdivisions N2 -->
                          <div v-if="expandedNodes.has(getNodeId(subdiv1.name, 'subdiv1', getNodeId(section.name, 'section', getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type')))))) && subdiv1.subdivisions_n2" class="node-children">
                            <div v-for="subdiv2 in subdiv1.subdivisions_n2" :key="subdiv2.name" class="tree-node level-6">
                              <div class="node-header" @click="toggleNode(getNodeId(subdiv2.name, 'subdiv2', getNodeId(subdiv1.name, 'subdiv1', getNodeId(section.name, 'section', getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type')))))))">
                                <i class="fas fa-chevron-right node-toggle" :class="{ expanded: expandedNodes.has(getNodeId(subdiv2.name, 'subdiv2', getNodeId(subdiv1.name, 'subdiv1', getNodeId(section.name, 'section', getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type'))))))) }" v-if="subdiv2.subdivisions_n3"></i>
                                <i v-else class="node-spacer"></i>
                                <i class="fas fa-folder-open node-icon"></i>
                                <span class="node-name">{{ subdiv2.name }}</span>
                                <span class="node-count">{{ subdiv2.documents_count }} docs</span>
                              </div>
                              
                              <!-- Subdivisions N3 -->
                              <div v-if="expandedNodes.has(getNodeId(subdiv2.name, 'subdiv2', getNodeId(subdiv1.name, 'subdiv1', getNodeId(section.name, 'section', getNodeId(structure.name, 'structure', getNodeId(produit.name, 'produit', getNodeId(typeNode.name, 'type'))))))) && subdiv2.subdivisions_n3" class="node-children">
                                <div v-for="subdiv3 in subdiv2.subdivisions_n3" :key="subdiv3.name" class="tree-node level-7">
                                  <div class="node-header">
                                    <i class="node-spacer"></i>
                                    <i class="fas fa-file node-icon"></i>
                                    <span class="node-name">{{ subdiv3.name }}</span>
                                    <span class="node-count">{{ subdiv3.documents_count }} docs</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement des statistiques...</p>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <i class="fas fa-chart-bar empty-icon"></i>
      <p>Aucune statistique hiérarchique disponible</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axiosInstance from '../axios';

interface HierarchyNode {
  name: string;
  documents_count: number;
  produits?: HierarchyNode[];
  structures?: HierarchyNode[];
  sections?: HierarchyNode[];
  subdivisions_n1?: HierarchyNode[];
  subdivisions_n2?: HierarchyNode[];
  subdivisions_n3?: HierarchyNode[];
}

const loading = ref(true);
const hierarchicalStats = ref<HierarchyNode[]>([]);
const expandedNodes = ref<Set<string>>(new Set());

const fetchHierarchicalStats = async () => {
  try {
    const res = await axiosInstance.get('documents-hierarchy-optimized/');
    hierarchicalStats.value = res.data.hierarchical_statistics || [];
  } catch (err) {
    hierarchicalStats.value = [];
    console.error('Failed to fetch hierarchical stats', err);
  } finally {
    loading.value = false;
  }
};

const toggleNode = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId);
  } else {
    // Check if this is a top-level type (matches any type name from hierarchicalStats)
    const isTopLevelType = hierarchicalStats.value.some(type => type.name === nodeId);
    
    if (isTopLevelType) {
      // Close all nodes that don't belong to this type
      const allExpandedNodes = Array.from(expandedNodes.value);
      allExpandedNodes.forEach(id => {
        // Keep only nodes that start with current nodeId (children of this type)
        if (!id.startsWith(nodeId) || id === nodeId) {
          if (id !== nodeId) {
            expandedNodes.value.delete(id);
          }
        }
      });
    }
    
    expandedNodes.value.add(nodeId);
  }
};

const getNodeId = (name: string, level: string, parentId = '') => {
  if (level === 'type') {
    return name; // Top-level types have simple IDs
  }
  return parentId ? `${parentId}-${name}` : name;
};

onMounted(async () => {
  await fetchHierarchicalStats();
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');

.hierarchical-stats-root {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 3rem max(2vw, 25px);
  box-sizing: border-box;
  background: linear-gradient(125deg, #141829 70%, #1f2962 120%);
}

.stats-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.2em;
}

.stats-title {
  color: #90caf9;
  font-size: 2em;
  font-weight: 900;
  margin-bottom: 0.2em;
  text-shadow: 0 6px 32px #1a237e77, 0 1px 0 #292a37;
}

.stats-section {
  margin-bottom: 2.5em;
  background: linear-gradient(99deg,#232f4bdd 90%, #243a7710 130%);
  border-radius: 1.3em;
  padding: 2em;
  box-shadow: 0 1.5px 16px 0 #18306a33;
}

/* Hierarchical Tree Styles */
.hierarchy-tree {
  background: linear-gradient(135deg, #1a252f 0%, #2c3e50 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 2px solid #34495e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tree-node {
  margin-bottom: 0.6rem;
}

.tree-node.level-2 {
  margin-left: 2rem;
}

.tree-node.level-3 {
  margin-left: 4rem;
}

.tree-node.level-4 {
  margin-left: 6rem;
}

.tree-node.level-5 {
  margin-left: 8rem;
}

.tree-node.level-6 {
  margin-left: 10rem;
}

.tree-node.level-7 {
  margin-left: 12rem;
}

.node-spacer {
  width: 16px;
  opacity: 0;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #5a6c7d50;
  margin-bottom: 0.3rem;
}

.node-header:hover {
  background: linear-gradient(135deg, #34495e 0%, #3c5a78 100%);
  transform: translateX(6px);
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.node-toggle {
  color: #3498db;
  font-size: 1rem;
  transition: transform 0.2s ease;
  width: 16px;
  font-weight: bold;
}

.node-toggle.expanded {
  transform: rotate(90deg);
}

.node-icon {
  color: #e74c3c;
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

.node-name {
  color: #ecf0f1;
  font-weight: 600;
  flex: 1;
  font-size: 1.1rem;
  line-height: 1.4;
}

.node-count {
  color: #ffffff;
  font-size: 1rem;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  padding: 0.4rem 0.8rem;
  border-radius: 1.2rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
  min-width: 60px;
  text-align: center;
}

.node-children {
  margin-top: 0.6rem;
  border-left: 3px solid #3498db40;
  padding-left: 1.2rem;
}

/* Level-specific styling */
.tree-node.level-1 .node-icon {
  color: #f39c12;
}

.tree-node.level-2 .node-icon {
  color: #3498db;
}

.tree-node.level-3 .node-icon {
  color: #9b59b6;
}

.tree-node.level-4 .node-icon {
  color: #e67e22;
}

.tree-node.level-5 .node-icon {
  color: #1abc9c;
}

.tree-node.level-6 .node-icon {
  color: #e74c3c;
}

.tree-node.level-7 .node-icon {
  color: #95a5a6;
}

/* Loading and Empty States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #90caf9;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #232f4b;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: #5a6c7d;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1200px) {
  .stats-header {
    flex-direction: column;
    gap: 1.2em;
    align-items: stretch;
  }
  .stats-title {
    font-size: 1.8em;
  }
}

@media (max-width: 700px) {
  .hierarchical-stats-root {
    padding: 0.4rem 0.02rem;
  }
  .tree-node.level-2 {
    margin-left: 1.2rem;
  }
  .tree-node.level-3 {
    margin-left: 2.4rem;
  }
  .tree-node.level-4 {
    margin-left: 3.6rem;
  }
  .tree-node.level-5 {
    margin-left: 4.8rem;
  }
  .tree-node.level-6 {
    margin-left: 6rem;
  }
  .tree-node.level-7 {
    margin-left: 7.2rem;
  }
  .node-header {
    padding: 0.6rem 0.8rem;
    gap: 0.8rem;
  }
  .node-name {
    font-size: 1rem;
  }
  .node-count {
    font-size: 0.9rem;
    padding: 0.3rem 0.6rem;
  }
  .hierarchy-tree {
    padding: 1rem;
  }
}
</style>