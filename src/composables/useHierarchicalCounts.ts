import { ref } from 'vue'
import axiosInstance from '../axios'

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

export function useHierarchicalCounts() {
  const hierarchicalData = ref<HierarchyNode[]>([])

  const fetchHierarchicalData = async () => {
    try {
      const response = await axiosInstance.get('documents-hierarchy-optimized/')
      hierarchicalData.value = response.data.hierarchical_statistics || []
    } catch (error) {
      hierarchicalData.value = []
    }
  }

  const getCount = (typeName: string, produitName?: string, structureName?: string, sectionName?: string, subdiv1Name?: string, subdiv2Name?: string, subdiv3Name?: string): number => {
    let current: HierarchyNode | undefined = hierarchicalData.value.find(t => t.name === typeName)
    if (!current) return 0

    if (produitName) {
      current = current.produits?.find(p => p.name === produitName)
      if (!current) return 0
    }

    if (structureName) {
      current = current.structures?.find(s => s.name === structureName)
      if (!current) return 0
    }

    if (sectionName) {
      current = current.sections?.find(sec => sec.name === sectionName)
      if (!current) return 0
    }

    if (subdiv1Name) {
      current = current.subdivisions_n1?.find(sub => sub.name === subdiv1Name)
      if (!current) return 0
    }

    if (subdiv2Name) {
      current = current.subdivisions_n2?.find(sub => sub.name === subdiv2Name)
      if (!current) return 0
    }

    if (subdiv3Name) {
      current = current.subdivisions_n3?.find(sub => sub.name === subdiv3Name)
      if (!current) return 0
    }

    return current.documents_count || 0
  }

  return {
    hierarchicalData,
    fetchHierarchicalData,
    getCount
  }
}