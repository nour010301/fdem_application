import axiosInstance from '../axios'

/**
 * Comprehensive service for AddDocView - Contains ALL API endpoints used in the component
 */
export class AddDocService {
  
  // ========== HIERARCHY/STRUCTURE ENDPOINTS ==========
  
  // Types de produits
  static async getTypes() {
    return axiosInstance.get('types/')
  }

  // Structures
  static async getStructures() {
    return axiosInstance.get('structures/')
  }

  // Subdivisions
  static async getSubDiv1Et2() {
    return axiosInstance.get('subdiv1et2/')
  }

  static async getSubDiv2Et3() {
    return axiosInstance.get('subdiv2et3/')
  }

  static async getSubDiv3Et4() {
    return axiosInstance.get('subdiv3et4/')
  }

  // Produits by type
  static async getProduitsByType(typeId: number) {
    return axiosInstance.get(`produits/by-type/${typeId}/`)
  }

  // Sections by type
  static async getSectionsByType(typeId: number) {
    return axiosInstance.get(`sections/by-type/${typeId}/`)
  }

  // Subdivision Nv1 by structure
  static async getSubDivisionNv1ByStructure(structureId: number) {
    return axiosInstance.get(`subdivision-nv1/by-structure/${structureId}/`)
  }

  // ========== DOCUMENT ENDPOINTS ==========
  
  // Create document
  static async createDocument(formData: FormData) {
    return axiosInstance.post('documents/create-two-file/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // Get documents (with pagination and filters)
  static async getDocuments(params?: any) {
    return axiosInstance.get('documents/', { params })
  }

  // View document file
  static async viewDocumentFile(documentId: number, type: string) {
    return axiosInstance.get(`documents/${documentId}/view-${type}/`, { 
      responseType: 'blob',
      signal: new AbortController().signal 
    })
  }

  // Download document file
  static async downloadDocumentFile(documentId: number, type: string) {
    return axiosInstance.get(`documents/${documentId}/download-${type}/`, { 
      responseType: 'blob' 
    })
  }

  // Update document
  static async updateDocument(documentId: number, data: any) {
    return axiosInstance.patch(`documents/${documentId}/`, data)
  }

  // Delete document (full)
  static async deleteDocument(documentId: number) {
    return axiosInstance.delete(`documents/${documentId}/`)
  }

  // Delete document (selective)
  static async deleteDocumentSelective(documentId: number, filesToDelete: any) {
    return axiosInstance.patch(`documents/${documentId}/delete-files/`, filesToDelete)
  }

  // Validate document
  static async validateDocument(documentId: number) {
    return axiosInstance.patch(`documents/${documentId}/validate/`)
  }

  // Move document
  static async moveDocument(documentId: number, moveData: any) {
    return axiosInstance.patch(`documents/${documentId}/move/`, moveData)
  }

  // Import plan to document
  static async importPlanToDocument(documentId: number, formData: FormData) {
    return axiosInstance.post(`documents/${documentId}/import-plan/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // ========== CONTEXT ENTITIES - FETCH BY PRODUCT ==========
  
  // Projects by product
  static async getProjectsByProduct(produitId: number) {
    return axiosInstance.get(`projets/by-produit/${produitId}/`)
  }

  // Fournisseurs by product
  static async getFournisseursByProduct(produitId: number) {
    return axiosInstance.get(`fournisseur/by-produit/${produitId}/`)
  }

  // Maitres d'ouvrage by product
  static async getMaitresOuvrageByProduct(produitId: number) {
    return axiosInstance.get(`moa/by-produit/${produitId}/`)
  }

  // Maitres d'oeuvre by product
  static async getMaitresOeuvreByProduct(produitId: number) {
    return axiosInstance.get(`moe/by-produit/${produitId}/`)
  }

  // Soustraitants by product
  static async getSoustraitantsByProduct(produitId: number) {
    return axiosInstance.get(`soustraitants/by-produit/${produitId}/`)
  }

  // BET by product
  static async getBETByProduct(produitId: number) {
    return axiosInstance.get(`bet/by-produit/${produitId}/`)
  }

  // Directors by project
  static async getDirectorsByProject(projetCode: string) {
    return axiosInstance.get(`directeurs-by-projet/${encodeURIComponent(projetCode)}`)
  }

  // ========== CONTEXT ENTITIES - FETCH ALL ==========
  
  // All projects
  static async getAllProjects() {
    return axiosInstance.get('projets/')
  }

  // All fournisseurs
  static async getAllFournisseurs() {
    return axiosInstance.get('fournisseurs/')
  }

  // All maitres d'ouvrage
  static async getAllMaitresOuvrage() {
    return axiosInstance.get('maitres-ouvrage/')
  }

  // All maitres d'oeuvre
  static async getAllMaitresOeuvre() {
    return axiosInstance.get('maitres-oeuvre/')
  }

  // All soustraitants
  static async getAllSoustraitants() {
    return axiosInstance.get('soustraitants/')
  }

  // All BET
  static async getAllBET() {
    return axiosInstance.get('bureaux-etudes/')
  }

  // All directors
  static async getAllDirectors() {
    return axiosInstance.get('directeurs/')
  }

  // ========== CONTEXT MANAGEMENT ==========
  
  // Add project to context
  static async addProjectToContext(payload: { idProduit: number; code: string }) {
    return axiosInstance.post('/contexte-projet/', payload)
  }

  // Remove project from context
  static async removeProjectFromContext(payload: { idProduit: number; code: string }) {
    return axiosInstance.delete('/contexte-projet/', { data: payload })
  }

  // Add fournisseur to context
  static async addFournisseurToContext(payload: { idProduit: number; idFournisseur: number }) {
    return axiosInstance.post('/contexte-fournisseur/', payload)
  }

  // Remove fournisseur from context
  static async removeFournisseurFromContext(payload: { idProduit: number; idFournisseur: number }) {
    return axiosInstance.delete('/contexte-fournisseur/', { data: payload })
  }

  // Add maitre ouvrage to context
  static async addMaitreOuvrageToContext(payload: { idProduit: number; idMoa: number }) {
    return axiosInstance.post('/contexte-moa/', payload)
  }

  // Remove maitre ouvrage from context
  static async removeMaitreOuvrageFromContext(payload: { idProduit: number; idMoa: number }) {
    return axiosInstance.delete('/contexte-moa/', { data: payload })
  }

  // Add maitre oeuvre to context
  static async addMaitreOeuvreToContext(payload: { idProduit: number; idMoe: number }) {
    return axiosInstance.post('/contexte-moe/', payload)
  }

  // Remove maitre oeuvre from context
  static async removeMaitreOeuvreFromContext(payload: { idProduit: number; idMoe: number }) {
    return axiosInstance.delete('/contexte-moe/', { data: payload })
  }

  // Add soustraitant to context
  static async addSoustraitantToContext(payload: { idProduit: number; idSoustraitant: number }) {
    return axiosInstance.post('/contexte-soustraitant/', payload)
  }

  // Remove soustraitant from context
  static async removeSoustraitantFromContext(payload: { idProduit: number; idSoustraitant: number }) {
    return axiosInstance.delete('/contexte-soustraitant/', { data: payload })
  }

  // Add BET to context
  static async addBETToContext(payload: { idProduit: number; idBET: number }) {
    return axiosInstance.post('/contexte-bureau-etude/', payload)
  }

  // Remove BET from context
  static async removeBETFromContext(payload: { idProduit: number; idBET: number }) {
    return axiosInstance.delete('/contexte-bureau-etude/', { data: payload })
  }

  // Add director to project
  static async addDirectorToProject(payload: { code: string; idDirecteur: number; date_debut?: string; date_fin?: string }) {
    return axiosInstance.post('/projets-directeurs/', payload)
  }

  // Remove director from project
  static async removeDirectorFromProject(payload: { code: string; idDirecteur: number }) {
    return axiosInstance.delete('/projets-directeurs/', { data: payload })
  }

  // ========== ENTITY DOCUMENT VIEWING ==========
  
  // View fournisseur document
  static async viewFournisseurDocument(fournisseurId: number) {
    return axiosInstance.get(`fournisseurs/${fournisseurId}/view-file/`, { responseType: 'blob' })
  }

  // View maitre oeuvre document
  static async viewMaitreOeuvreDocument(maitreOeuvreId: number) {
    return axiosInstance.get(`maitres-oeuvre/${maitreOeuvreId}/view-file/`, { responseType: 'blob' })
  }

  // View maitre ouvrage document
  static async viewMaitreOuvrageDocument(maitreOuvrageId: number) {
    return axiosInstance.get(`maitres-ouvrage/${maitreOuvrageId}/view-file/`, { responseType: 'blob' })
  }

  // View soustraitant document
  static async viewSoustraitantDocument(soustraitantId: number) {
    return axiosInstance.get(`soustraitants/${soustraitantId}/view-file/`, { responseType: 'blob' })
  }

  // View BET document
  static async viewBETDocument(betId: number) {
    return axiosInstance.get(`bureaux-etudes/${betId}/view-file/`, { responseType: 'blob' })
  }

  // ========== ADDITIONAL ENDPOINTS FOUND IN ADDDOCVIEW ==========
  
  // View document photos (used in viewDocument function)
  static async viewDocumentPhotos(documentId: number) {
    return axiosInstance.get(`documents/view-photos/${documentId}/`, { 
      responseType: 'blob',
      signal: new AbortController().signal 
    })
  }

  // Alternative document validation endpoint (PUT method)
  static async validateDocumentPut(documentId: number, data: any) {
    return axiosInstance.put(`documents/create-two-file/${documentId}/`, data)
  }

  // Alternative document creation endpoint
  static async createDocumentAlt(formData: FormData) {
    return axiosInstance.post('documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // Update document with PUT method (used in update operations)
  static async updateDocumentPut(documentId: number, formData: FormData) {
    return axiosInstance.put(`documents/create-two-file/${documentId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // Move document (alternative endpoint)
  static async moveDocumentPost(documentId: number, formData: FormData) {
    return axiosInstance.post(`documents/${documentId}/move/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // Import plan with PUT method (used in import operations)
  static async importPlanPut(documentId: number, formData: FormData) {
    return axiosInstance.put(`documents/create-two-file/${documentId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // Generic context entity POST (used for dynamic endpoints)
  static async postContextEntity(endpoint: string, params: any) {
    return axiosInstance.post(`/${endpoint}/`, params)
  }

  // Generic context entity DELETE (used for dynamic endpoints)
  static async deleteContextEntity(endpoint: string, params: any) {
    return axiosInstance.delete(`/${endpoint}/`, { data: params })
  }

  // Get entity data by product ID (dynamic endpoint)
  static async getEntityByProduct(endpoint: string, produitId: number) {
    return axiosInstance.get(`${endpoint}${produitId}`)
  }

  // ========== NEWLY DISCOVERED ENDPOINTS FROM ADDDOCVIEW ==========
  
  // Get all directions-projets (directors)
  static async getAllDirectionsProjets() {
    return axiosInstance.get('directions-projets/')
  }

  // Dynamic endpoint for getting entities by product (used in context)
  static async getEntityDataByProduct(endpoint: string, produitId: number) {
    return axiosInstance.get(`${endpoint}${produitId}`)
  }

  // Dynamic endpoint for posting to context entities
  static async postToContextEndpoint(endpoint: string, params: any) {
    return axiosInstance.post(`/${endpoint}/`, params)
  }

  // Dynamic endpoint for deleting from context entities  
  static async deleteFromContextEndpoint(endpoint: string, params: any) {
    return axiosInstance.delete(`/${endpoint}/`, { data: params })
  }

}