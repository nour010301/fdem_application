import { ref, computed } from 'vue'
import axiosInstance from '../axios'

export function useDocumentsPagination() {
  const documents = ref<any[]>([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalDocuments = ref(0)
  const totalPages = ref(0)
  const hasNext = ref(false)
  const hasPrevious = ref(false)
  const loading = ref(false)
  const error = ref('')

  const pagination = computed(() => ({
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    pageSize: pageSize.value,
    count: totalDocuments.value,
    hasNext: hasNext.value,
    hasPrevious: hasPrevious.value
  }))

  async function fetchDocuments(params: any = {}, page: number = 1) {
    loading.value = true
    error.value = ''
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.value.toString()
      })
      
      // Add filter parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key].toString())
        }
      })
      
      const response = await axiosInstance.get(`documents/paginated/?${queryParams}`)
      const data = response.data
      
      documents.value = data.results || []
      currentPage.value = data.current_page || 1
      totalPages.value = data.total_pages || 0
      totalDocuments.value = data.count || 0
      hasNext.value = !!data.next
      hasPrevious.value = !!data.previous
    } catch (e: any) {
      error.value = e?.message || 'Erreur lors du chargement'
      documents.value = []
    } finally {
      loading.value = false
    }
  }

  function nextPage(params: any = {}) {
    if (hasNext.value) {
      fetchDocuments(params, currentPage.value + 1)
    }
  }

  function previousPage(params: any = {}) {
    if (hasPrevious.value) {
      fetchDocuments(params, currentPage.value - 1)
    }
  }

  function goToPage(page: number, params: any = {}) {
    if (page >= 1 && page <= totalPages.value) {
      fetchDocuments(params, page)
    }
  }

  function changePageSize(newSize: number, params: any = {}) {
    pageSize.value = Math.min(Math.max(parseInt(newSize.toString()), 1), 100)
    fetchDocuments(params, 1)
  }

  return {
    documents,
    currentPage,
    pageSize,
    totalDocuments,
    totalPages,
    hasNext,
    hasPrevious,
    loading,
    error,
    pagination,
    fetchDocuments,
    nextPage,
    previousPage,
    goToPage,
    changePageSize
  }
}