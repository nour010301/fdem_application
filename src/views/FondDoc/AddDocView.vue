
<template>
  
  <div class="add-doc-root">
    <!-- Toast Notifications -->
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        :class="['toast', toast.type]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✕</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" @click.stop="removeToast(toast.id)">×</button>
      </div>
    </div>
    <!-- Main content with forms -->
    <div class="add-doc-main">
      <h1>Fonds Documentaire pour les Études et Méthodes</h1>

      <!-- INITIAL FORM FIELDS -->
      <form v-if="mode !== 'contexte'" class="structure-step-form" @submit.prevent="submitForm">
        <div class="step">
          <label for="type-produit">Types de produits</label>
          <select id="type-produit" v-model="selectedTypeId">
            <option value="" disabled>Choisir un type</option>
            <option v-for="type in typeProduits" :key="type.idTypeProduit" :value="type.idTypeProduit">
              {{ type.designation }}{{ getCount(type.designation) > 0 ? ` (${getCount(type.designation)} docs)` : '' }}
            </option>
          </select>
        </div>
        <div class="step" v-if="selectedTypeId">
          <label for="produit">Produits</label>
          <select id="produit" v-model="selectedProduitId" :disabled="!filteredProduits.length">
            <option value="" disabled>Choisir un produit</option>
            <option v-for="prod in filteredProduits" :key="prod.idProduit" :value="prod.idProduit">
              {{ prod.designation }}{{ getCount(getTypeDesignation(selectedTypeId), prod.designation) > 0 ? ` (${getCount(getTypeDesignation(selectedTypeId), prod.designation)} docs)` : '' }}
            </option>
          </select>
        </div>
        <div class="step" v-if="selectedProduitId">
          <label for="structure">Structure fond documentaire</label>
          <select id="structure" v-model="selectedStructureId" @change="onStructureChange">
            <option value="" disabled>Choisir une structure</option>
            <option v-for="structure in sortedStructures" :key="structure.idStructure" :value="structure.idStructure">
              {{ structure.nom }}{{ getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), structure.nom) > 0 ? ` (${getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), structure.nom)} docs)` : '' }}
            </option>
          </select>
        </div>

        <!-- STRUCTURE MODE FIELDS -->
        <template v-if="mode === 'structure'">
        <div class="step" v-if="selectedStructureId">
          <label for="section">Sections de produits</label>
          <select id="section" v-model="selectedSectionId" :disabled="!sections.length">
            <option value="" disabled>Choisir une section</option>
            <option v-for="sec in sections" :key="sec.idSectionProduit" :value="sec.idSectionProduit">
              {{ sec.nom }}{{ getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), getStructureDesignation(selectedStructureId), sec.nom) > 0 ? ` (${getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), getStructureDesignation(selectedStructureId), sec.nom)} docs)` : '' }}
            </option>
          </select>
        </div>
        <div class="step" v-if="selectedSectionId">
          <label for="division-nv1">Classes de documents</label>
          <select id="division-nv1" v-model="selectedDivisionId" :disabled="!divisionsNv1.length">
            <option value="" disabled>Choisir une division</option>
            <option v-for="div in divisionsNv1" :key="div.idSubDivisionNv_1" :value="div.idSubDivisionNv_1">
              {{ div.nom }}{{ getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), getStructureDesignation(selectedStructureId), getSectionDesignation(selectedSectionId), div.nom) > 0 ? ` (${getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), getStructureDesignation(selectedStructureId), getSectionDesignation(selectedSectionId), div.nom)} docs)` : '' }}
            </option>
          </select>
        </div>
        <div class="step" v-if="selectedDivisionId && requiresSubDiv2">
          <label for="subdivision-nv2">Types de documents</label>
          <select id="subdivision-nv2" v-model="selectedSubDiv2Id">
            <option value="" disabled>Choisir une sous-division</option>
            <option v-for="item in filteredSubDiv2List" :key="item.idSubDivisionNv_2.idSubDivisionNv_2" :value="item.idSubDivisionNv_2.idSubDivisionNv_2">
              {{ item.idSubDivisionNv_2.nom }}{{ getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), getStructureDesignation(selectedStructureId), getSectionDesignation(selectedSectionId), getDivisionDesignation(selectedDivisionId), item.idSubDivisionNv_2.nom) > 0 ? ` (${getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), getStructureDesignation(selectedStructureId), getSectionDesignation(selectedSectionId), getDivisionDesignation(selectedDivisionId), item.idSubDivisionNv_2.nom)} docs)` : '' }}
            </option>
          </select>
        </div>
        <div class="step" v-if="requiresSubDiv2 && selectedSubDiv2Id && requiresSubDiv3">
          <label for="subdivision-nv3">Documents cibles</label>
          <select id="subdivision-nv3" v-model="selectedSubDiv3Id">
            <option value="" disabled>Choisir une sous-division Niv. 3</option>
            <option v-for="item in filteredSubDiv3List" :key="item.idSubDivisionNv_3.idSubDivisionNv_3" :value="item.idSubDivisionNv_3.idSubDivisionNv_3">
              {{ item.idSubDivisionNv_3.nom }}{{ getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), getStructureDesignation(selectedStructureId), getSectionDesignation(selectedSectionId), getDivisionDesignation(selectedDivisionId), getSubDiv2Designation(selectedSubDiv2Id), item.idSubDivisionNv_3.nom) > 0 ? ` (${getCount(getTypeDesignation(selectedTypeId), getProduitDesignation(selectedProduitId), getStructureDesignation(selectedStructureId), getSectionDesignation(selectedSectionId), getDivisionDesignation(selectedDivisionId), getSubDiv2Designation(selectedSubDiv2Id), item.idSubDivisionNv_3.nom)} docs)` : '' }}
            </option>
          </select>
        </div>
        <p v-if="!isSubDivAllowed && selectedDivisionId" style="color: #E53935;">
          Veuillez continuer la sélection.
        </p>

        <div
          class="button-group responsive-buttons"
          v-if="isSubDivAllowed && (
            (requiresSubDiv2 && selectedSubDiv2Id && filteredSubDiv3List.length === 0) ||
            (!requiresSubDiv2 && selectedDivisionId) ||
            (requiresSubDiv2 && selectedSubDiv3Id) ||
            (requiresSubDiv2 && selectedSubDiv4Id)
          )"
        >
          <button v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION" class="save-btn" type="button" @click="openStructureDocContent" :class="{ 'disabled': !canAddDocuments || isCreatingDocument }" :disabled="!canAddDocuments || isCreatingDocument">
            <span v-if="isCreatingDocument">{{ creationProgress || 'Création en cours...' }}</span>
            <span v-else>Ajouter</span>
          </button>
          <button class="consulter-btn" type="button" @click="showSuccessMessage" :disabled="loadingConsulter">
            <span v-if="loadingConsulter">Chargement en cours...</span>
            <span v-else>Consulter</span>
          </button>
          <button v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION" class="mise-a-jour-btn" type="button" @click="showMiseAJourMessage" :disabled="loadingConsulter">
            <span v-if="loadingConsulter">Chargement en cours...</span>
            <span v-else>Modifier</span>
          </button>
          <button v-if="isPiecesGraphiques && userStore.userRole.value !== userStore.ROLES.CONSULTATION" class="import-dossier-btn" type="button" @click="showImportDossierMessage" :disabled="loadingConsulter">
            <span v-if="loadingConsulter">Chargement en cours...</span>
            <span v-else>Importer Fichiers Source</span>
          </button>
          <button v-if="canDeleteDocuments" class="delete-btn" type="button" @click="showDeleteMessage" :disabled="loadingConsulter">
            <span v-if="loadingConsulter">Chargement en cours...</span>
            <span v-else>Supprimer</span>
          </button>
          <button v-if="canValidateDocuments" class="validate-documents-btn" type="button" @click="showValidationMessage" :disabled="loadingConsulter">
            <span v-if="loadingConsulter">Chargement en cours...</span>
            <span v-else>Valider Document</span>
          </button>
          <button v-if="loadingConsulter" class="cancel-btn" type="button" @click="cancelConsulter">
            Annuler
          </button>
          <!-- <button v-if="isPiecesGraphiques" class="import-btn" type="button" @click="openImportModal" :class="{ 'disabled': !canAddDocuments }" :disabled="!canAddDocuments">Importer Dossier Source</button> -->
          <!-- <button class="delete-btn" type="button" @click="openDocModal('delete')">Supprimer Document</button> -->
        </div>
        </template>
      </form>
      <!-- CONTEXT MODE FORM: Multi-directeurs per project and date -->
   <div v-if="mode === 'contexte'" class="step context-stepper">
        <div class="context-header">
          <button @click="goBackToForm" class="back-btn">← Retour</button>
          <h2>Contexte du Produit</h2>
        </div>
        <div class="context-cards">
          <div
            v-for="entity in contextEntities"
            :key="entity.key"
            class="context-card"
          >
            <span class="context-entity-title">{{ entity.label }}</span>
            <div class="context-actions">
              <button v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION" @click="onAjouter(entity.key)" class="context-action add" :class="{ 'disabled': !canAddDocuments || isCreatingDocument }" :disabled="!canAddDocuments || isCreatingDocument">
                <span v-if="isCreatingDocument">Création...</span>
                <span v-else>+ Ajouter/Maj</span>
              </button>
              <button @click="onConsulterFunction(entity.key)" class="context-action view">Consulter</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resizable divider -->
    <div 
      v-show="mode === 'contexte' || showStructureDocContent || showStructureConsulterContent || showConsulterPanel || showSuccess || showDeleteMode || showMiseAJourMode || showImportDossierMode || showValidationMode"
      class="resize-divider"
      @mousedown="startResize"
    >
      <div class="resize-handle"></div>
    </div>

    <!-- Right sidebar for context and structure modes -->
    <aside class="doc-sidebar" v-show="mode === 'contexte' || showStructureDocContent || showStructureConsulterContent || showConsulterPanel || showSuccess || showDeleteMode || showMiseAJourMode || showImportDossierMode || showValidationMode">

      <!-- Success Message in Sidebar -->
      <!-- <div v-if="showSuccess" class="success-message-sidebar">
        ✓ Consulter action completed successfully!
      </div> -->

      <!-- Consulter content in sidebar -->
      <div v-if="showSuccess" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Consulter Documents</h3>
          <button @click="showSuccess = false" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="loadingDocs" class="loading">Chargement...</div>
          <div v-else>
            <div v-if="docModalError" class="error">{{ docModalError }}</div>
            <div class="section">
              <h4>Documents existants</h4>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher un document..." 
                class="search-input-sidebar"
              />
              
              <!-- Pagination Info -->
              <div v-if="filteredDocList.length > 0" class="pagination-info">
                Affichage de {{ (currentPage - 1) * pageSize + 1 }} à {{ Math.min(currentPage * pageSize, totalDocuments) }} sur {{ totalDocuments }} documents
              </div>
              
              <div class="table-container">
                <table v-if="paginatedDocList.length" class="sidebar-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Fichier PDF</th>
                      <th v-if="isPiecesGraphiques">Fichiers source</th>
                      <th>Vidéo</th>
                      <th>Images</th>
                      <th v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">Validation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="document in paginatedDocList" :key="document.idDocument">
                      <td class="description-cell" :title="document.designation || document.nomFichier || ''">
                        <div class="description-content">
                          <span>{{ getDescriptionDisplay(document) }}</span>
                          <button 
                            v-if="needsTruncation(document.designation || document.nomFichier || '')"
                            @click="toggleDescription(document.idDocument)"
                            class="description-toggle-btn"
                          >
                            {{ isDescriptionExpanded(document.idDocument) ? 'voir moins' : 'voir plus' }}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div v-if="document.nomFichier" class="document-actions">
                          <button @click="viewDocument(document, 'fichier')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>Consulter</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                        <td v-if="isPiecesGraphiques">
                        <button v-if="document.plan && isPiecesGraphiques" @click="downloadFile(document, 'plan')" class="action-btn download-btn" :disabled="!canAccessPlans">
                          💾 Télécharger
                        </button>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.video" class="document-actions">
                          <button @click="viewDocument(document, 'video')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>▶️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.nomPhotos" class="document-actions">
                          <button @click="viewDocument(document, 'photos')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>🖼️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">
                        <span v-if="document.valide === true" class="valide-status valid">Oui</span>
                        <span v-else class="valide-status invalid">Non</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-else-if="!docList.length" class="no-data">
                  Aucun document trouvé pour l'arborescence sélectionnée.
                </div>
                <div v-else-if="filteredDocList.length === 0" class="no-data">
                  Aucun document trouvé pour "{{ searchQuery }}".
                </div>
              </div>
              
              <!-- Pagination Controls - Outside scrollable container -->
              <div v-if="totalPages > 1" class="pagination-container">
                <div class="pagination-controls">
                  <button 
                    @click="previousPageWithParams" 
                    :disabled="!hasPrevious" 
                    class="pagination-btn"
                  >
                    ← Précédent
                  </button>
                  
                  <span class="pagination-pages">
                    <button 
                      v-for="page in Math.min(5, totalPages)" 
                      :key="page" 
                      @click="goToPageWithParams(page)" 
                      :class="['pagination-page', { active: currentPage === page }]"
                    >
                      {{ page }}
                    </button>
                    <span v-if="totalPages > 5" class="pagination-ellipsis">...</span>
                    <button 
                      v-if="totalPages > 5 && currentPage < totalPages - 2" 
                      @click="goToPageWithParams(totalPages)" 
                      :class="['pagination-page', { active: currentPage === totalPages }]"
                    >
                      {{ totalPages }}
                    </button>
                  </span>
                  
                  <button 
                    @click="nextPageWithParams" 
                    :disabled="!hasNext" 
                    class="pagination-btn"
                  >
                    Suivant →
                  </button>
                </div>
                
                <div class="page-size-selector">
                  <label>Éléments par page:</label>
                  <select :value="pageSize" @change="changePageSizeWithParams(($event.target as HTMLSelectElement).value)">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Import Dossier content in sidebar -->
      <div v-if="showImportDossierMode" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Importer Dossier Source</h3>
          <button @click="showImportDossierMode = false" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="loadingDocs" class="loading">Chargement...</div>
          <div v-else>
            <div v-if="docModalError" class="error">{{ docModalError }}</div>
            <div class="section">
              <h4>Documents existants</h4>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher un document..." 
                class="search-input-sidebar"
              />
              
              <!-- Pagination Info -->
              <div v-if="filteredDocList.length > 0" class="pagination-info">
                Affichage de {{ (currentPage - 1) * pageSize + 1 }} à {{ Math.min(currentPage * pageSize, totalDocuments) }} sur {{ totalDocuments }} documents
              </div>
              
              <div class="table-container">
                <table v-if="paginatedDocList.length" class="sidebar-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Fichier PDF</th>
                      <th>Fichiers source</th>
                      <th v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">Validation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="document in paginatedDocList" :key="document.idDocument">
                      <td class="description-cell" :title="document.designation || document.nomFichier || ''">
                        <div class="description-content">
                          <span>{{ getDescriptionDisplay(document) }}</span>
                          <button 
                            v-if="needsTruncation(document.designation || document.nomFichier || '')"
                            @click="toggleDescription(document.idDocument)"
                            class="description-toggle-btn"
                          >
                            {{ isDescriptionExpanded(document.idDocument) ? 'voir moins' : 'voir plus' }}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div v-if="document.nomFichier" class="document-actions">
                          <button @click="viewDocument(document, 'fichier')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>Consulter</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <button v-if="document.plan" @click="downloadFile(document, 'plan')" class="action-btn download-btn" :disabled="!canDownload">
                          💾 Télécharger
                        </button>
                        <button v-else-if="document.nomFichier && !document.plan" @click="openImportPlanModal(document)" class="action-btn import-btn" :disabled="!canAddDocuments">
                          📁 Importer
                        </button>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">
                        <span v-if="document.valide === true" class="valide-status valid">Oui</span>
                        <span v-else class="valide-status invalid">Non</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-else-if="!docList.length" class="no-data">
                  Aucun document trouvé pour l'arborescence sélectionnée.
                </div>
                <div v-else-if="filteredDocList.length === 0" class="no-data">
                  Aucun document trouvé pour "{{ searchQuery }}".
                </div>
              </div>
              
              <!-- Pagination Controls - Outside scrollable container -->
              <div v-if="totalPages > 1" class="pagination-container">
                <div class="pagination-controls">
                  <button 
                    @click="previousPageWithParams" 
                    :disabled="!hasPrevious" 
                    class="pagination-btn"
                  >
                    ← Précédent
                  </button>
                  
                  <span class="pagination-pages">
                    <button 
                      v-for="page in Math.min(5, totalPages)" 
                      :key="page" 
                      @click="goToPageWithParams(page)" 
                      :class="['pagination-page', { active: currentPage === page }]"
                    >
                      {{ page }}
                    </button>
                    <span v-if="totalPages > 5" class="pagination-ellipsis">...</span>
                    <button 
                      v-if="totalPages > 5 && currentPage < totalPages - 2" 
                      @click="goToPageWithParams(totalPages)" 
                      :class="['pagination-page', { active: currentPage === totalPages }]"
                    >
                      {{ totalPages }}
                    </button>
                  </span>
                  
                  <button 
                    @click="nextPageWithParams" 
                    :disabled="!hasNext" 
                    class="pagination-btn"
                  >
                    Suivant →
                  </button>
                </div>
                
                <div class="page-size-selector">
                  <label>Éléments par page:</label>
                  <select :value="pageSize" @change="changePageSizeWithParams(($event.target as HTMLSelectElement).value)">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mise à jour content in sidebar -->
      <div v-if="showMiseAJourMode" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Mise à jour Documents</h3>
          <button @click="showMiseAJourMode = false" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="loadingDocs" class="loading">Chargement...</div>
          <div v-else>
            <div v-if="docModalError" class="error">{{ docModalError }}</div>
            <div class="section">
              <h4>Documents existants</h4>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher un document..." 
                class="search-input-sidebar"
              />
              
              <!-- Pagination Info -->
              <div v-if="filteredDocList.length > 0" class="pagination-info">
                Affichage de {{ (currentPage - 1) * pageSize + 1 }} à {{ Math.min(currentPage * pageSize, totalDocuments) }} sur {{ totalDocuments }} documents
              </div>
              
              <div class="table-container">
                <table v-if="paginatedDocList.length" class="sidebar-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Fichier PDF</th>
                      <th v-if="isPiecesGraphiques">Fichiers source</th>
                      <th>Vidéo</th>
                      <th>Images</th>
                      <th v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">Validation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="document in paginatedDocList" :key="document.idDocument">
                      <td class="description-cell" :title="document.designation || document.nomFichier || ''">
                        <div class="description-content">
                          <span>{{ getDescriptionDisplay(document) }}</span>
                          <button 
                            v-if="needsTruncation(document.designation || document.nomFichier || '')"
                            @click="toggleDescription(document.idDocument)"
                            class="description-toggle-btn"
                          >
                            {{ isDescriptionExpanded(document.idDocument) ? 'voir moins' : 'voir plus' }}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div v-if="document.nomFichier" class="document-actions">
                          <button @click="viewDocument(document, 'fichier')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>Consulter</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td v-if="isPiecesGraphiques">
                        <button v-if="document.plan && isPiecesGraphiques" @click="downloadFile(document, 'plan')" class="action-btn download-btn" :disabled="!canAccessPlans">
                          💾 Télécharger
                        </button>
                        <button v-else-if="document.nomFichier && !document.plan" @click="openImportPlanModal(document)" class="action-btn import-btn" :disabled="!canAddDocuments">
                          📁 Importer
                        </button>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.video" class="document-actions">
                          <button @click="viewDocument(document, 'video')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>▶️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.nomPhotos" class="document-actions">
                          <button @click="viewDocument(document, 'photos')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>🖼️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">
                        <span v-if="document.valide === true" class="valide-status valid">Oui</span>
                        <span v-else class="valide-status invalid">Non</span>
                      </td>
                      <td class="action-buttons">
                        <button class="action-btn update-btn" @click="confirmUpdate(document)" :disabled="!canAddDocuments" title="Modifier">
                          ✎
                        </button>
                        <button class="action-btn move-btn" @click="confirmMove(document)" :disabled="!canAddDocuments" title="Déplacer">
                          <span style="color: white; font-size: 18px;">↗</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-else-if="!docList.length" class="no-data">
                  Aucun document trouvé pour l'arborescence sélectionnée.
                </div>
                <div v-else-if="filteredDocList.length === 0" class="no-data">
                  Aucun document trouvé pour "{{ searchQuery }}".
                </div>
              </div>
              
              <!-- Pagination Controls - Outside scrollable container -->
              <div v-if="totalPages > 1" class="pagination-container">
                <div class="pagination-controls">
                  <button 
                    @click="previousPageWithParams" 
                    :disabled="!hasPrevious" 
                    class="pagination-btn"
                  >
                    ← Précédent
                  </button>
                  
                  <span class="pagination-pages">
                    <button 
                      v-for="page in Math.min(5, totalPages)" 
                      :key="page" 
                      @click="goToPageWithParams(page)" 
                      :class="['pagination-page', { active: currentPage === page }]"
                    >
                      {{ page }}
                    </button>
                    <span v-if="totalPages > 5" class="pagination-ellipsis">...</span>
                    <button 
                      v-if="totalPages > 5 && currentPage < totalPages - 2" 
                      @click="goToPageWithParams(totalPages)" 
                      :class="['pagination-page', { active: currentPage === totalPages }]"
                    >
                      {{ totalPages }}
                    </button>
                  </span>
                  
                  <button 
                    @click="nextPageWithParams" 
                    :disabled="!hasNext" 
                    class="pagination-btn"
                  >
                    Suivant →
                  </button>
                </div>
                
                <div class="page-size-selector">
                  <label>Éléments par page:</label>
                  <select :value="pageSize" @change="changePageSizeWithParams(($event.target as HTMLSelectElement).value)">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation content in sidebar -->
      <div v-if="showValidationMode" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Valider Documents</h3>
          <button @click="showValidationMode = false" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="loadingDocs" class="loading">Chargement...</div>
          <div v-else>
            <div v-if="docModalError" class="error">{{ docModalError }}</div>
            <div class="section">
              <h4>Documents à valider</h4>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher un document..." 
                class="search-input-sidebar"
              />
              
              <!-- Pagination Info -->
              <div v-if="filteredValidationDocList.length > 0" class="pagination-info">
                Affichage de {{ validationPaginationInfo.start }} à {{ validationPaginationInfo.end }} sur {{ validationPaginationInfo.total }} documents
              </div>
              
              <div class="table-container">
                <table v-if="paginatedValidationDocList.length" class="sidebar-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Fichier PDF</th>
                      <th v-if="isPiecesGraphiques">Fichiers source</th>
                      <th>Vidéo</th>
                      <th>Images</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="document in paginatedValidationDocList" :key="document.idDocument">
                      <td class="description-cell" :title="document.designation || document.nomFichier || ''">
                        <div class="description-content">
                          <span>{{ getDescriptionDisplay(document) }}</span>
                          <button 
                            v-if="needsTruncation(document.designation || document.nomFichier || '')"
                            @click="toggleDescription(document.idDocument)"
                            class="description-toggle-btn"
                          >
                            {{ isDescriptionExpanded(document.idDocument) ? 'voir moins' : 'voir plus' }}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div v-if="document.nomFichier" class="document-actions">
                          <button @click="viewDocument(document, 'fichier')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>Consulter</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td v-if="isPiecesGraphiques">
                        <button v-if="document.plan && isPiecesGraphiques" @click="downloadFile(document, 'plan')" class="action-btn download-btn" :disabled="!canAccessPlans">
                          💾 Télécharger
                        </button>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.video" class="document-actions">
                          <button @click="viewDocument(document, 'video')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>▶️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.nomPhotos" class="document-actions">
                          <button @click="viewDocument(document, 'photos')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>🖼️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <button @click="openValidationModal(document)" class="action-btn validate-btn-small" title="Valider" :disabled="validatingDocuments[document.idDocument]">
                          <span v-if="validatingDocuments[document.idDocument]">...</span>
                          <span v-else>✓ Valider</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-else-if="!docList.length" class="no-data">
                  Aucun document trouvé pour l'arborescence sélectionnée.
                </div>
                <div v-else-if="filteredValidationDocList.length === 0" class="no-data">
                  Aucun document à valider trouvé pour "{{ searchQuery }}".
                </div>
              </div>
              
              <!-- Pagination Controls - Outside scrollable container -->
              <div v-if="validationTotalPages > 1" class="pagination-container">
                <div class="pagination-controls">
                  <button 
                    @click="previousPageWithParams" 
                    :disabled="!hasPrevious" 
                    class="pagination-btn"
                  >
                    ← Précédent
                  </button>
                  
                  <span class="pagination-pages">
                    <button 
                      v-for="page in Math.min(5, validationTotalPages)" 
                      :key="page" 
                      @click="goToPageWithParams(page)" 
                      :class="['pagination-page', { active: currentPage === page }]"
                    >
                      {{ page }}
                    </button>
                    <span v-if="validationTotalPages > 5" class="pagination-ellipsis">...</span>
                    <button 
                      v-if="validationTotalPages > 5 && currentPage < validationTotalPages - 2" 
                      @click="goToPageWithParams(validationTotalPages)" 
                      :class="['pagination-page', { active: currentPage === validationTotalPages }]"
                    >
                      {{ validationTotalPages }}
                    </button>
                  </span>
                  
                  <button 
                    @click="nextPageWithParams" 
                    :disabled="!hasNext" 
                    class="pagination-btn"
                  >
                    Suivant →
                  </button>
                </div>
                
                <div class="page-size-selector">
                  <label>Éléments par page:</label>
                  <select :value="pageSize" @change="changePageSizeWithParams(($event.target as HTMLSelectElement).value)">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete content in sidebar -->
      <div v-if="showDeleteMode" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Supprimer Documents</h3>
          <button @click="showDeleteMode = false" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="loadingDocs" class="loading">Chargement...</div>
          <div v-else>
            <div v-if="docModalError" class="error">{{ docModalError }}</div>
            <div class="section">
              <h4>Documents existants</h4>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher un document..." 
                class="search-input-sidebar"
              />
              
              <!-- Pagination Info -->
              <div v-if="filteredDocList.length > 0" class="pagination-info">
                Affichage de {{ (currentPage - 1) * pageSize + 1 }} à {{ Math.min(currentPage * pageSize, totalDocuments) }} sur {{ totalDocuments }} documents
              </div>
              
              <div class="table-container">
                <table v-if="paginatedDocList.length" class="sidebar-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Fichier PDF</th>
                       <th v-if="isPiecesGraphiques">Fichiers source</th>
                      <th>Vidéo</th>
                      <th>Images</th>
                      <th v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">Validation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="document in paginatedDocList" :key="document.idDocument">
                      <td class="description-cell" :title="document.designation || document.nomFichier || ''">
                        <div class="description-content">
                          <span>{{ getDescriptionDisplay(document) }}</span>
                          <button 
                            v-if="needsTruncation(document.designation || document.nomFichier || '')"
                            @click="toggleDescription(document.idDocument)"
                            class="description-toggle-btn"
                          >
                            {{ isDescriptionExpanded(document.idDocument) ? 'voir moins' : 'voir plus' }}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div v-if="document.nomFichier" class="document-actions">
                          <button @click="viewDocument(document, 'fichier')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>Consulter</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td v-if="isPiecesGraphiques">
                        <button v-if="document.plan && isPiecesGraphiques" @click="downloadFile(document, 'plan')" class="action-btn download-btn" :disabled="!canDownload">
                          💾 Télécharger
                        </button>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.video" class="document-actions">
                          <button @click="viewDocument(document, 'video')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>▶️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.nomPhotos" class="document-actions">
                          <button @click="viewDocument(document, 'photos')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>🖼️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td v-if="userStore.userRole.value !== userStore.ROLES.CONSULTATION || userStore.user.value?.valide">
                        <span v-if="document.valide === true" class="valide-status valid">Oui</span>
                        <span v-else class="valide-status invalid">Non</span>
                      </td>
                      <td>
                        <button @click="openDeleteModal(document)" class="action-btn delete-btn-small" title="Supprimer">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-else-if="!docList.length" class="no-data">
                  Aucun document trouvé pour l'arborescence sélectionnée.
                </div>
                <div v-else-if="filteredDocList.length === 0" class="no-data">
                  Aucun document trouvé pour "{{ searchQuery }}".
                </div>
              </div>
              
              <!-- Pagination Controls - Outside scrollable container -->
              <div v-if="totalPages > 1" class="pagination-container">
                <div class="pagination-controls">
                  <button 
                    @click="previousPageWithParams" 
                    :disabled="!hasPrevious" 
                    class="pagination-btn"
                  >
                    ← Précédent
                  </button>
                  
                  <span class="pagination-pages">
                    <button 
                      v-for="page in Math.min(5, totalPages)" 
                      :key="page" 
                      @click="goToPageWithParams(page)" 
                      :class="['pagination-page', { active: currentPage === page }]"
                    >
                      {{ page }}
                    </button>
                    <span v-if="totalPages > 5" class="pagination-ellipsis">...</span>
                    <button 
                      v-if="totalPages > 5 && currentPage < totalPages - 2" 
                      @click="goToPageWithParams(totalPages)" 
                      :class="['pagination-page', { active: currentPage === totalPages }]"
                    >
                      {{ totalPages }}
                    </button>
                  </span>
                  
                  <button 
                    @click="nextPageWithParams" 
                    :disabled="!hasNext" 
                    class="pagination-btn"
                  >
                    Suivant →
                  </button>
                </div>
                
                <div class="page-size-selector">
                  <label>Éléments par page:</label>
                  <select :value="pageSize" @change="changePageSizeWithParams(($event.target as HTMLSelectElement).value)">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Show Arborescence only in context mode -->
      <div v-if="mode === 'contexte'" class="arborescence-section">
        <!-- <h3>Arborescence</h3> -->
        
        <!-- Tree structure for Type Produit and Produit -->
        <div class="tree-structure">
          <div v-if="selectedTypeId" class="tree-node">
            <span class="tree-icon">📁</span>
            <span class="tree-label">{{ getTypeDesignation(selectedTypeId) }}</span>
            <div v-if="selectedProduitId" class="tree-child">
              <span class="tree-icon">📄</span>
              <span class="tree-label selected-produit">{{ getProduitDesignation(selectedProduitId) }}</span>
            </div>
          </div>
        </div>
        
        <ul>
          <!-- CONTEXTE -->
          <template v-if="selectedBureauxEtudes.length > 0
            || selectedFournisseurs.length > 0
            || selectedMaitresOeuvre.length > 0
            || selectedMaitresOuvrage.length > 0
            || selectedSoustraitants.length > 0
            || selectedProjets.length > 0">
            <div class="arb-content">
              <!-- Always show projects -->
              <div v-if="selectedProjetNoms.length" class="arb-line">
                <span class="arb-label">Projets:</span>
                <span class="arb-value">{{ selectedProjetNoms.join(', ') }}<span v-if="hasMoreProjets" class="more-indicator"> (+plus...)</span></span>
              </div>
              
              <!-- Collapsible details section -->
              <div v-if="hasOtherDetails" class="arb-details-section">
                <div class="arb-toggle-container">
                  <button 
                    @click="toggleArborescenceDetails" 
                    class="arb-toggle-btn"
                    :class="{ 'expanded': showArborescenceDetails }"
                  >
                    <span class="arb-toggle-icon">{{ showArborescenceDetails ? '▼' : '▶' }}</span>
                    <span class="arb-toggle-text">{{ showArborescenceDetails ? 'Voir moins' : 'Voir plus' }}</span>
                  </button>
                </div>
                
                <!-- Collapsible content -->
                <div v-show="showArborescenceDetails" class="arb-details-content">
                  <div v-if="selectedMaitreOuvrageNoms.length" class="arb-line">
                    <span class="arb-label">Maîtres d'Ouvrage:</span>
                    <span class="arb-value">{{ selectedMaitreOuvrageNoms.join(', ') }}<span v-if="hasMoreMOA" class="more-indicator"> (+plus...)</span></span>
                  </div>
                  <div v-if="selectedMaitreOeuvreNoms.length" class="arb-line">
                    <span class="arb-label">Maîtres d'Œuvre:</span>
                    <span class="arb-value">{{ selectedMaitreOeuvreNoms.join(', ') }}<span v-if="hasMoreMOE" class="more-indicator"> (+plus...)</span></span>
                  </div>
                  <div v-if="selectedSoustraitantNoms.length" class="arb-line">
                    <span class="arb-label">Sous-traitants:</span>
                    <span class="arb-value">{{ selectedSoustraitantNoms.join(', ') }}<span v-if="hasMoreSoustraitants" class="more-indicator"> (+plus...)</span></span>
                  </div>
                  <div v-if="selectedFournisseurNoms.length" class="arb-line">
                    <span class="arb-label">Fournisseurs:</span>
                    <span class="arb-value">{{ selectedFournisseurNoms.join(', ') }}<span v-if="hasMoreFournisseurs" class="more-indicator"> (+plus...)</span></span>
                  </div>
                  <div v-if="selectedBureauEtudeNoms.length" class="arb-line">
                    <span class="arb-label">Bureaux Études:</span>
                    <span class="arb-value">{{ selectedBureauEtudeNoms.join(', ') }}<span v-if="hasMoreBET" class="more-indicator"> (+plus...)</span></span>
                  </div>
                  <div v-if="selectedDirectionsProjets.length" class="arb-line">
                    <span class="arb-label">Directeurs:</span>
                    <span class="arb-value">{{ selectedDirectionsProjets.map(d => d.nomPrenomDirecteur || `${d.nom} ${d.prenom}`).join(', ') }}<span v-if="hasMoreDirecteurs" class="more-indicator"> (+plus...)</span></span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </ul>
      </div>

      <!-- Ajouter content in sidebar -->
      <div v-if="contextAjouter.visible" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Liste de {{ contextAjouter.entityLabel }}</h3>
          <button @click="closeContextAjouterModal" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <!-- Single Merged Table -->
          <div class="section">
            <!-- <h4>Liste de {{ contextAjouter.entityLabel }}</h4> -->
            <input 
              v-model="contextAjouterSearchQuery" 
              type="text" 
              placeholder="Rechercher..." 
              class="search-input-sidebar"
            />
            <div class="table-container limited">
              <table class="sidebar-table">
                <thead>
                  <tr>
                    <th v-for="header in contextAjouter.columns" :key="header">{{ header }}</th>
                    <th>Action</th>
                    <th v-if="contextAjouter.entityKey !== 'direction_projet' && contextAjouter.entityKey !== 'paq'">Fichier Document</th>
                    <th v-if="contextAjouter.entityKey === 'maitre_ouvrage' || contextAjouter.entityKey === 'maitre_oeuvre' || contextAjouter.entityKey === 'bet_soustraitants_etudes'">Directeurs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in filteredContextAjouterItems"
                    :key="item[contextAjouter.idCol]"
                    :class="{ selected: isAlreadySelected(contextAjouter.entityKey, item) }"
                  >
                    <td v-for="col in contextAjouter.columnKeys" :key="col">
                      <span v-if="contextAjouter.entityKey === 'direction_projet' && col === 'periods'">
                        <div v-if="getDirectorPeriods(item).length > 0" class="director-periods">
                          <div v-for="(period, index) in getDirectorPeriods(item)" :key="index" class="period-item">
                            {{ formatDate(period.date_deb) }} - {{ formatDate(period.date_fin) }}
                          </div>
                          <small class="periods-count">{{ getDirectorPeriods(item).length }} période(s)</small>
                        </div>
                        <span v-else>Aucune période</span>
                      </span>
                      <span v-else-if="contextAjouter.entityKey === 'direction_projet' && (col === 'date_deb' || col === 'date_fin')">
                        {{ getDirectorDateValue(item, col) }}
                      </span>
                      <span v-else>{{ item[col] }}</span>
                    </td>
                    <td>
                      <!-- Show Enlever button if already selected -->
                      <button
                        v-if="isAlreadySelected(contextAjouter.entityKey, item)"
                        class="remove-btn"
                        @click="removeFromSelected(contextAjouter.entityKey, item)"
                      >Enlever</button>
                      <!-- Show Ajouter button if not selected -->
                      <button
                        v-else
                        class="add-btn"
                        @click="contextAjouter.entityKey === 'direction_projet' ? openDateModal(item) : addToSelected(contextAjouter.entityKey, item)"
                        :disabled="!getEntityConfig(contextAjouter.entityKey)?.allowMultiple && contextAjouter.selected.length >= 1"
                      >Ajouter</button>
                      <!-- Add Period button for already selected directors -->
                      <button
                        v-if="isAlreadySelected(contextAjouter.entityKey, item) && contextAjouter.entityKey === 'direction_projet'"
                        class="add-period-btn"
                        @click="openDateModal(item)"
                        title="Ajouter une nouvelle période"
                      >+ Période</button>
                      <!-- Add Director button for selected items -->
                      <button
                        v-if="isAlreadySelected(contextAjouter.entityKey, item) && (contextAjouter.entityKey === 'maitre_ouvrage' || contextAjouter.entityKey === 'maitre_oeuvre' || contextAjouter.entityKey === 'bet_soustraitants_etudes')"
                        class="add-director-btn"
                        @click="openDirecteurModal(item)"
                      >Ajouter Directeur</button>
                    </td>
                    <td v-if="contextAjouter.entityKey !== 'direction_projet' && contextAjouter.entityKey !== 'paq'">
                      <div v-if="isAlreadySelected(contextAjouter.entityKey, item)" class="document-file-container">
                        <div v-if="item.nomFichier" class="document-actions">
                          <button @click="viewEntityDocument(contextAjouter.entityKey, item)" class="action-btn view-btn" :disabled="(loadingViewDocument as Record<string, boolean>)[getEntityDocumentId(contextAjouter.entityKey, item)]">
                            <span v-if="(loadingViewDocument as Record<string, boolean>)[getEntityDocumentId(contextAjouter.entityKey, item)]">...</span>
                            <span v-else>📄 Consulter</span>
                          </button>
                          <button v-if="(loadingViewDocument as Record<string, boolean>)[getEntityDocumentId(contextAjouter.entityKey, item)]" @click="cancelEntityDocumentView(contextAjouter.entityKey, item)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">Aucun fichier</span>
                      </div>
                      <span v-else>-</span>
                    </td>
                    <td v-if="contextAjouter.entityKey === 'maitre_ouvrage' || contextAjouter.entityKey === 'maitre_oeuvre' || contextAjouter.entityKey === 'bet_soustraitants_etudes'">
                      <div v-if="isAlreadySelected(contextAjouter.entityKey, item)" class="dropdown">
                        <button class="dropdown-btn" @click="loadDirecteurs(contextAjouter.entityKey, item)">
                          Liste Directeurs
                          <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="dropdown-content" v-if="activeDropdown === `${contextAjouter.entityKey}-${item[contextAjouter.idCol]}`">
                          <div v-if="loadingDirecteurs" class="dropdown-loading">Chargement...</div>
                          <div v-else-if="directeursList.length === 0" class="dropdown-empty">Aucun directeur</div>
                          <div v-else v-for="directeur in directeursList" :key="directeur.id || directeur.idDirecteur" class="dropdown-item">
                            <div><strong>{{ directeur.nom || directeur.nomDirecteur }} {{ directeur.prenom || directeur.prenomDirecteur }}</strong></div>
                            <div class="dropdown-dates">
                              <small>Début: {{ directeur.date_debut || 'Non défini' }} | Fin: {{ directeur.date_fin || 'Non défini' }}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span v-else>-</span>
                    </td>
                  </tr>
                  <tr v-if="!filteredContextAjouterItems.length">
                    <td :colspan="(contextAjouter.entityKey === 'maitre_ouvrage' || contextAjouter.entityKey === 'maitre_oeuvre' || contextAjouter.entityKey === 'bet_soustraitants_etudes' ? (contextAjouter.columns?.length || 0) + 3 : (contextAjouter.columns?.length || 0) + 2) - (contextAjouter.entityKey === 'direction_projet' || contextAjouter.entityKey === 'paq' ? 1 : 0)" class="no-data">
                      {{ contextAjouterSearchQuery ? `Aucun résultat pour "${contextAjouterSearchQuery}"` : 'Aucun élément à afficher.' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Consulter content in sidebar -->
      <div v-if="contextConsulter.visible" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Consultation - {{ contextConsulter.entityLabel }}</h3>
          <button @click="closeContextConsulterModal" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="contextConsulter.loading" class="loading">Chargement...</div>
          <div v-else-if="contextConsulter.error" class="error">{{ contextConsulter.error }}</div>
          <div v-else class="section">
            <input 
              v-model="contextConsulterSearchQuery" 
              type="text" 
              placeholder="Rechercher..." 
              class="search-input-sidebar"
            />
            <div class="table-container">
              <table v-if="filteredContextConsulterItems.length" class="sidebar-table">
                <thead>
                  <tr>
                    <th v-for="col in contextConsulter.columns" :key="col">{{ col }}</th>
                    <th v-if="contextConsulter.entityKey !== 'direction_projet' && contextConsulter.entityKey !== 'paq'">Fichier Document</th>
                    <th v-if="contextConsulter.entityKey === 'paq'">Actions</th>
                    <th v-if="contextConsulter.entityKey === 'maitre_ouvrage' || contextConsulter.entityKey === 'maitre_oeuvre' || contextConsulter.entityKey === 'bet_soustraitants_etudes'">Directeurs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in filteredContextConsulterItems" :key="contextConsulter.entityKey === 'direction_projet' ? `${row.idDirecteur || row.id}-${row.date_deb}-${row.date_fin}-${index}` : row[contextConsulter.columnKeys[0]]" :class="contextConsulter.entityKey === 'direction_projet' ? getDirectorRowClass(row, index, filteredContextConsulterItems) : ''">
                    <td v-for="colKey in contextConsulter.columnKeys" :key="colKey">
                      <span v-if="contextConsulter.entityKey === 'direction_projet' && colKey === 'nomPrenomDirecteur'">
                        {{ getDirectorDisplayName(row, index, filteredContextConsulterItems) }}
                      </span>
                      <span v-else-if="contextConsulter.entityKey === 'direction_projet' && (colKey === 'date_deb' || colKey === 'date_fin')">
                        {{ row[colKey] ? new Date(row[colKey]).toLocaleDateString('fr-FR') : '-' }}
                      </span>
                      <span v-else>{{ row[colKey] ?? '-' }}</span>
                    </td>
                    <td v-if="contextConsulter.entityKey !== 'direction_projet' && contextConsulter.entityKey !== 'paq'">
                      <div class="document-file-container">
                        <div v-if="row.nomFichier" class="document-actions">
                          <button @click="viewEntityDocument(contextConsulter.entityKey, row)" class="action-btn view-btn" :disabled="(loadingViewDocument as Record<string, boolean>)[getEntityDocumentId(contextConsulter.entityKey, row)]">
                            <span v-if="(loadingViewDocument as Record<string, boolean>)[getEntityDocumentId(contextConsulter.entityKey, row)]">...</span>
                            <span v-else>📄 Consulter</span>
                          </button>
                          <button v-if="(loadingViewDocument as Record<string, boolean>)[getEntityDocumentId(contextConsulter.entityKey, row)]" @click="cancelEntityDocumentView(contextConsulter.entityKey, row)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">Aucun fichier</span>
                      </div>
                    </td>
                    <!-- <td v-if="contextConsulter.entityKey === 'paq'">
                      <div v-if="row.nomFichier" class="document-actions">
                        
                        <button @click="viewPAQFile(row.idPAQ)" class="action-btn view-btn" :disabled="(loadingViewDocument as any)[`paq_${row.idPAQ}`]">
                          <span v-if="(loadingViewDocument as any)[`paq_${row.idPAQ}`]">...</span>
                          <span v-else>👁️ Consulter</span>
                        </button>
                        <button v-if="(loadingViewDocument as any)[`paq_${row.idPAQ}`]" @click="cancelPAQDocumentView(row.idPAQ)" class="action-btn cancel-doc-btn">
                          ✕
                        </button>
                      </div>
                      <span v-else class="no-file">-</span>
                    </td> -->
                    <td v-if="contextConsulter.entityKey === 'maitre_ouvrage' || contextConsulter.entityKey === 'maitre_oeuvre' || contextConsulter.entityKey === 'bet_soustraitants_etudes'">
                      <div class="dropdown">
                        <button class="dropdown-btn" @click="loadDirecteursConsulter(contextConsulter.entityKey, row)">
                          Liste Directeurs
                          <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="dropdown-content" v-if="activeDropdownConsulter === `${contextConsulter.entityKey}-${row[contextConsulter.columnKeys[0]]}`">
                          <div v-if="loadingDirecteursConsulter" class="dropdown-loading">Chargement...</div>
                          <div v-else-if="directeursListConsulter.length === 0" class="dropdown-empty">Aucun directeur</div>
                          <div v-else v-for="directeur in directeursListConsulter" :key="directeur.id || directeur.idDirecteur" class="dropdown-item">
                            <div><strong>{{ directeur.nom || directeur.nomDirecteur }} {{ directeur.prenom || directeur.prenomDirecteur }}</strong></div>
                            <div class="dropdown-dates">
                              <small>Début: {{ directeur.date_debut || 'Non défini' }} | Fin: {{ directeur.date_fin || 'Non défini' }}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!filteredContextConsulterItems.length" class="no-data">
                {{ contextConsulterSearchQuery ? `Aucun résultat pour "${contextConsulterSearchQuery}"` : 'Aucun élément à afficher.' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Structure mode document content in sidebar -->
      <div v-if="showStructureDocContent" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <!-- <h3>Ajouter Document</h3> -->
           <h3>Créer un nouveau document</h3>
          <button @click="closeStructureDocContent" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="loadingDocs" class="loading">Chargement...</div>
          <div v-else>
            <div v-if="docModalError" class="error">{{ docModalError }}</div> 
            <!-- Form for Create Mode -->
            <div v-if="isSubDivAllowed" class="section">
              <!-- <h4>Créer un nouveau document</h4> -->
              <div class="step" id="nonFichier">
                <label for="nonFichier">Description</label>
                <input id="nonFichier-input" v-model="nonFichier" type="text" />
              </div>
              
              <!-- File Upload Options -->
              <div class="upload-options">
                <!-- Option 1: PDF Files -->
                <div class="step upload-option">
                  <label for="file-upload" class="file-upload-label">Sélectionner Fichier PDF</label>
                  <input id="file-upload" type="file" accept=".pdf" @change="onFileChange" />
                  <div v-if="uploadedFile" class="file-info">
                    <span class="file-selected-text">Fichier sélectionné: {{ uploadedFile.name }}</span>
                    <button @click="showPdfDetails = !showPdfDetails" class="toggle-btn">{{ showPdfDetails ? 'Voir moins' : 'Voir plus' }}</button>
                  </div>
                  
                  <div v-if="showPdfDetails && uploadedFile" class="file-details">
                    <div class="file-item">
                      <span>{{ uploadedFile.name }}</span>
                      <button @click="uploadedFile = null" type="button" class="remove-file">Retirer</button>
                    </div>
                  </div>
                  
                  <!-- Plan Files (Only for PiecesGraphiques and when PDF is selected) -->
                  <div v-if="isPiecesGraphiques && uploadedFile" class="plan-section">
                  <label class="file-upload-label">
                    Vous pouvez importer un plan en format source (optionnel)
                  </label>
                  <p style="font-size: 0.85em; color: #6b7280; margin-bottom: 0.5em;">
                    Sélectionnez un fichier ZIP, plusieurs fichiers individuels, ou un dossier complet. Les fichiers individuels et dossiers seront automatiquement zippés.
                  </p>
                  <div style="display: flex; gap: 0.8em; align-items: center; margin-bottom: 0.5em;">
                    
                    <!-- Input for individual files -->
                    <input
                      ref="graphicsFileInput"
                      type="file"
                      accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.dwg,.dxf,.zip"
                      @change="addGraphicsFile"
                      multiple
                      style="display: none;"
                    />
                    
                    <!-- Input for folder selection -->
                    <input
                      ref="graphicsFolderInput"
                      type="file"
                      webkitdirectory
                      @change="addGraphicsFolder"
                      style="display: none;"
                    />
                    
                    <button
                      @click="graphicsFileInput?.click()"
                      class="save-btn"
                      style="font-size: 0.9em; padding: 0.6em 1.2em;"
                    >
                      Sélectionner Fichiers ou ZIP
                    </button>
                    
                    <button
                      @click="graphicsFolderInput?.click()"
                      class="save-btn"
                      style="font-size: 0.9em; padding: 0.6em 1.2em; background: #10b981;"
                    >
                      Sélectionner Dossier
                    </button>
                    
                    <span style="color: #bbdefb; font-size: 0.9em;">
                      {{ graphicsFiles.length }} fichier(s) sélectionné(s)
                    </span>
                  </div>

                  <div v-if="graphicsFiles.length > 0" class="file-info">
                    <span class="file-selected-text">{{ graphicsFiles.length }} fichier(s) sélectionné(s)</span>
                    <button @click="showPlanDetails = !showPlanDetails" class="toggle-btn">
                      {{ showPlanDetails ? 'Voir moins' : 'Voir plus' }}
                    </button>
                  </div>

                  <div v-if="showPlanDetails && graphicsFiles.length > 0" class="file-details">
                    <h4>Fichiers sélectionnés ({{ graphicsFiles.length }}):</h4>
                    <div v-if="graphicsFiles.length === 1 && graphicsFiles[0].name.toLowerCase().endsWith('.zip')" class="zip-info">
                      <div class="file-item zip-file">
                        <span>📦 {{ graphicsFiles[0].name }} (Fichier ZIP)</span>
                        <button
                          @click="removeGraphicsFile(0)"
                          type="button"
                          class="remove-file"
                          title="Retirer ce fichier"
                        >
                          Retirer
                        </button>
                      </div>
                      <small style="color: #10b981; font-style: italic;">Ce fichier ZIP sera envoyé directement</small>
                    </div>
                    <div v-else class="file-list">
                      <div v-if="graphicsFiles.length > 1" class="zip-notice">
                        <small style="color: #f59e0b; font-style: italic;">Ces fichiers seront automatiquement zippés avant l'envoi</small>
                      </div>
                      <div v-for="(file, index) in graphicsFiles" :key="index" class="file-item">
                        <span>{{ file.name }}</span>
                        <button
                          @click="removeGraphicsFile(index)"
                          type="button"
                          class="remove-file"
                          title="Retirer ce fichier"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                </div>
                
                <!-- Option 3: Video Files -->
                <div class="step upload-option">
                  <label for="video-upload" class="file-upload-label">Sélectionner Vidéo</label>
                  <input id="video-upload" type="file" accept=".mp4,.mov,.avi,.mkv,.webm" @change="onVideoChange" />
                  <div v-if="uploadedVideo || isCompressingVideo" class="file-info">
                    <span v-if="isCompressingVideo" class="file-selected-text">{{ compressionProgress }}</span>
                    <span v-else class="file-selected-text">1 vidéo sélectionnée</span>
                    <button v-if="!isCompressingVideo" @click="showVideoDetails = !showVideoDetails" class="toggle-btn">{{ showVideoDetails ? 'Voir moins' : 'Voir plus' }}</button>
                    <span v-if="uploadedVideo?.name?.includes('_compressed')" class="compression-indicator">
                      ✓ Compressée
                    </span>
                  </div>
                  
                  <div v-if="showVideoDetails && uploadedVideo" class="file-details">
                    <div class="file-item">
                      <span>{{ uploadedVideo.name }}</span>
                      <button @click="uploadedVideo = null" type="button" class="remove-file">Retirer</button>
                    </div>
                  </div>
                </div>
                
                <!-- Option 4: Photos (Multiple Images to PDF) -->
                <div class="step upload-option">
                  <label class="file-upload-label">Sélectionner Photos</label>
                  <input ref="photosInput" type="file" accept="image/*" @change="onSinglePhotoChange" style="display: none;" />
                  <div style="display: flex; gap: 1em; align-items: center; justify-content: center; margin-bottom: 1em;">
                    <button @click="photosInput?.click()" class="save-btn" style="font-size: 0.9em; padding: 0.6em 1.2em;">Sélectionner Photo</button>
                    <span style="color: #bbdefb; font-size: 0.9em;">{{ selectedPhotos.length }} photo(s) sélectionnée(s)</span>
                  </div>
                  <div v-if="selectedPhotos.length > 0" class="file-info">
                    <span class="file-selected-text">{{ selectedPhotos.length }} photo(s) sélectionnée(s)</span>
                    <button @click="showPhotosDetails = !showPhotosDetails" class="toggle-btn">{{ showPhotosDetails ? 'Voir moins' : 'Voir plus' }}</button>
                  </div>
                  
                  <div v-if="showPhotosDetails && selectedPhotos.length > 0" class="files-preview">
                    <div class="file-list scrollable-list">
                      <div v-for="(photo, index) in selectedPhotos" :key="index" class="file-item">
                        <span>{{ photo.name }}</span>
                        <button @click="removePhoto(index)" type="button" class="remove-file" title="Retirer cette photo">Retirer</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        <div class="sidebar-footer">
          <button class="validate-btn" @click="submitForm" :class="{ 'disabled': !canAddDocuments || isCompressingVideo || isCreatingDocument }" :disabled="!canAddDocuments || isCompressingVideo || isCreatingDocument">
            <span v-if="isCompressingVideo">Compression en cours...</span>
            <span v-else-if="isCreatingDocument">{{ creationProgress || 'Création en cours...' }}</span>
            <span v-else>Valider Document</span>
          </button>
        </div>
      </div>

      <!-- Structure mode consulter content in sidebar -->
      <div v-if="showStructureConsulterContent" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Consulter Documents - Structure</h3>
          <button @click="closeStructureConsulterContent" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="loadingDocs" class="loading">Chargement...</div>
          <div v-else>
            <div v-if="docModalError" class="error">{{ docModalError }}</div>
            <div class="section">
              <h4>Documents existants</h4>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher un document..." 
                class="search-input-sidebar"
              />
              <div class="table-container">
                <table v-if="filteredDocList.length" class="sidebar-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Fichier PDF</th>
                      <th v-if="isPiecesGraphiques">Fichiers source</th>
                      <th>Vidéo</th>
                      <th>Images</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="document in filteredDocList" :key="document.idDocument">
                      <td class="description-cell" :title="document.designation || document.nomFichier || ''">
                        <div class="description-content">
                          <span>{{ getDescriptionDisplay(document) }}</span>
                          <button 
                            v-if="needsTruncation(document.designation || document.nomFichier || '')"
                            @click="toggleDescription(document.idDocument)"
                            class="description-toggle-btn"
                          >
                            {{ isDescriptionExpanded(document.idDocument) ? 'voir moins' : 'voir plus' }}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div v-if="document.nomFichier" class="document-actions">
                          <button @click="viewDocument(document, 'fichier')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>Consulter</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                        <td v-if="isPiecesGraphiques">
                        <button v-if="document.plan && isPiecesGraphiques" @click="downloadFile(document, 'plan')" class="action-btn download-btn" :disabled="!canAccessPlans">
                          💾 Télécharger
                        </button>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.video" class="document-actions">
                          <button @click="viewDocument(document, 'video')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>▶️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                      <td>
                        <div v-if="document.nomPhotos" class="document-actions">
                          <button @click="viewDocument(document, 'photos')" class="action-btn view-btn" :disabled="isAnyDocumentLoading">
                            <span v-if="loadingViewDocument[document.idDocument]">...</span>
                            <span v-else>🖼️ Voir</span>
                          </button>
                          <button v-if="loadingViewDocument[document.idDocument]" @click="cancelDocumentView(document.idDocument)" class="action-btn cancel-doc-btn">
                            ✕
                          </button>
                        </div>
                        <span v-else class="no-file">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else-if="!docList.length" class="no-data">
                  Aucun document trouvé pour l'arborescence sélectionnée.
                </div>
                <div v-else class="no-data">
                  Aucun document trouvé pour "{{ searchQuery }}".
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- NEW SEPARATE CONSULTER PANEL -->
      <!-- <div v-show="showConsulterPanel" style="background: rgba(255, 255, 255, 0.95); color: #333; padding: 20px; margin: 10px 0; border-radius: 8px; border: 2px solid #43E97B;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #43E97B;">
    <h3 style="color: #43E97B; margin: 0; font-size: 1.3rem; font-weight: 600;">Consulter Documents</h3>
    <button @click="closeConsulterPanel" style="background: none; border: none; color: #333; font-size: 1.5rem; cursor: pointer; padding: 5px; border-radius: 4px;">&times;</button>
  </div>
  <div style="max-height: 70vh; overflow-y: auto;">
    <div v-if="consulterLoading" style="text-align: center; color: #43E97B; font-weight: 600; padding: 2em;">Chargement...</div>
    <div v-else>
      <div v-if="consulterError" style="text-align: center; color: #E53935; padding: 2em;">{{ consulterError }}</div>
      <div v-else>
        <h4 style="color: #333; margin-bottom: 10px; font-size: 1.1rem; font-weight: 600;">Documents existants</h4>
        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px;">
          <table v-if="consulterDocList && consulterDocList.length" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr>
                <th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; background: #f8f9fa; color: #333; font-weight: 600; position: sticky; top: 0;">ID</th>
                <th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; background: #f8f9fa; color: #333; font-weight: 600; position: sticky; top: 0;">Chemin</th>
                <th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; background: #f8f9fa; color: #333; font-weight: 600; position: sticky; top: 0;">Désignation</th>
                <th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; background: #f8f9fa; color: #333; font-weight: 600; position: sticky; top: 0;">Consulter</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="document in consulterDocList" :key="document.idDocument">
                <td style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd;">{{ document.idDocument }}</td>
                <td style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd;">{{ document.chemin }}</td>
                <td style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd;">{{ document.designation || '(non renseigné)' }}</td>
                <td style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd;">
                  <button @click="viewDocument(document)" style="background: #29b6f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Consulter</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else style="text-align: center; font-style: italic; color: #666; padding: 2em;">Aucun document trouvé pour l'arborescence sélectionnée.</div>
        </div>
      </div>
    </div>
  </div>
</div> -->




    </div>
    </aside>

<!-- Ajouter content is now displayed in the sidebar -->

    <!-- New Modal for Adding Directors -->
    <div v-if="directeurModal.visible" class="doc-modal-backdrop">
      <div class="doc-modal" style="min-width:380px;">
        <div class="doc-modal-header">
          <h3>
            Ajouter un Directeur
          </h3>
          <button @click="closeDirecteurModal" class="close-modal">&times;</button>
        </div>
        <div class="doc-modal-body">
          <form @submit.prevent="addDirecteur">
            <div style="margin-bottom: 1em;">
              <label for="nom">Nom:</label>
              <input type="text" id="nom" v-model="directeurModal.nom" required>
            </div>
            <div style="margin-bottom: 1em;">
              <label for="prenom">Prénom:</label>
              <input type="text" id="prenom" v-model="directeurModal.prenom" required>
            </div>
            <div style="margin-bottom: 1em;">
              <label for="date_debut">Date de Début:</label>
              <input type="date" id="date_debut" v-model="directeurModal.date_debut">
            </div>
            <div style="margin-bottom: 1em;">
              <label for="date_fin">Date de Fin:</label>
              <input type="date" id="date_fin" v-model="directeurModal.date_fin">
            </div>
            <div class="doc-modal-footer" style="text-align:right">
              <button type="submit" class="save-btn">Ajouter</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- New Modal for Direction Projet Dates -->
    <div v-if="dateModal.visible" class="doc-modal-backdrop">
      <div class="doc-modal" style="min-width:380px;">
        <div class="doc-modal-header">
          <h3>
            Ajouter Dates pour Direction Projet
          </h3>
          <button @click="closeDateModal" class="close-modal">&times;</button>
        </div>
        <div class="doc-modal-body">
          <form @submit.prevent="addDirectionProjet">
            <div style="margin-bottom: 1em;">
              <label>Directeur: {{ dateModal.directeur?.nomPrenomDirecteur }}</label>
            </div>
            <div style="margin-bottom: 1em;">
              <label for="date_debut_projet">Date de Début:</label>
              <input type="date" id="date_debut_projet" v-model="dateModal.date_debut">
            </div>
            <div style="margin-bottom: 1em;">
              <label for="date_fin_projet">Date de Fin:</label>
              <input type="date" id="date_fin_projet" v-model="dateModal.date_fin">
            </div>
            <div class="doc-modal-footer" style="text-align:right">
              <button type="submit" class="save-btn">Ajouter</button>
            </div>
          </form>
        </div>
      </div>
    </div>


<!-- Consulter content is now displayed in the sidebar -->

 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<!-- Delete context modal  -->
  <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
  <div v-if="contextDelete.visible" class="doc-modal-backdrop">
  <div class="doc-modal" style="width: 900px; min-height: 420px; font-size: 1.2rem;">
    <div class="doc-modal-header">
      <h3 style="font-size: 1.5rem;">
        Supprimer - {{ contextDelete.entityLabel }}
      </h3>
      <button @click="closeContextDeleteModal" class="close-modal" style="font-size:1.5em;">&times;</button>
    </div>
    <div class="doc-modal-body" style="min-height: 220px;">
      <div v-if="contextDelete.loading">Chargement...</div>
      <div v-else-if="contextDelete.error" style="color:#e53935;">{{ contextDelete.error }}</div>
      <div v-else>
        <table v-if="contextDelete.data.length" class="doc-table">
          <thead>
            <tr>
              <th v-for="col in contextDelete.columns" :key="col">{{ col }}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in contextDelete.data" :key="item[contextDelete.idCol]">
              <td v-for="key in contextDelete.columnKeys" :key="key">{{ item[key] }}</td>
              <td>
                <button class="delete-button" @click="askConfirmEntityDelete(item)">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!contextDelete.data.length" style="text-align:center; font-style:italic;">
          Aucun élément à afficher.
        </div>
      </div>
    </div>
  </div>
</div>


 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<!-- Delete context modal  -->
 <!-- Entity row confirmation modal : supprimer in context-->
  <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->

<div v-if="contextDelete.confirmItem" class="doc-modal-backdrop">
  <div class="doc-modal" style="min-width:380px;">
    <div class="doc-modal-header">
      <h3>
        Confirmation de suppression
      </h3>
      <button @click="contextDelete.confirmItem = null" class="close-modal">&times;</button>
    </div>
    <div class="doc-modal-body">
      <p>
        Êtes-vous sûr de vouloir supprimer cet élément du contexte ?
      </p>
      <table class="doc-table">
        <tbody>
          <tr v-for="col in contextDelete.columns" :key="col">
            <th>{{ col }}</th>
            <td>{{ contextDelete.confirmItem[getColKeyByHeader(col)] ?? '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="doc-modal-footer" style="text-align:right">
      <button @click="contextDelete.confirmItem = null" class="view-button">Annuler</button>
      <button @click="performEntityDelete(contextDelete.confirmItem)" class="delete-button" style="margin-left:0.7em;">Supprimer</button>
    </div>
  </div>
</div>

  <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
    <!-- DOCUMENTS MODAL: ajouter supprimer consulter -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<div v-if="showDocModal" class="doc-modal-backdrop">
  <div class="doc-modal">
    <div class="doc-modal-header">
      <h3>
        <span v-if="docModalMode==='create'">Créer un document - Liste existante</span> 
        <span v-else-if="docModalMode==='consult'">Consulter un document</span>
        <!-- <button class="view-button" @click="viewDocument(document)">Consulter Doc</button> -->
        <span v-else-if="docModalMode==='delete'">Supprimer un document</span>
      </h3>
      <button @click="closeDocModal" class="close-modal">&times;</button>
    </div>
    <div class="doc-modal-body">
      <div v-if="loadingDocs" class="modal-loader">Chargement...</div>
      <div v-else>
        <div v-if="docModalError" style="color:red">{{ docModalError }}</div>
        <div style="max-height: 500px; overflow-y: auto; margin-bottom: 0.6em;" v-if="docList.length">
        <table class="doc-table" v-if="docList.length">
          <thead>
            <tr>
              <th>ID</th>
              <th>Chemin</th>
              <th>Désignation</th>
              <th v-if="docModalMode==='consult'">Consulter</th>
              <th v-if="docModalMode==='delete'">Supprimer</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="document in docList" :key="document.idDocument">
              <td>{{ document.idDocument }}</td>
              <td>{{ document.chemin }}</td>
              <td>{{ document.designation || '(non renseigné)' }}</td>
              <td v-if="docModalMode==='consult'">
                <button class="view-button" @click="viewDocument(document)">Consulter Doc</button>
              </td>
              <td v-if="docModalMode==='delete'">
                <button class="delete-button" @click="handleDeleteDocument(document)">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
        <div v-else>
          <em>Aucun document trouvé pour l'arborescence sélectionnée.</em>
        </div>
      </div>

      <!-- Form for Create Mode -->
      <div v-if="docModalMode==='create' && isSubDivAllowed" style="margin-top:2em">
        <h4>Créer un nouveau document:</h4>
        <div class="step" id="nonFichier">
          <label for="nonFichier">Nom Fichier</label>
          <input id="nonFichier-input" v-model="nonFichier" type="text" />
        </div>
        <div class="step">
          <label for="file-upload">Fichier (PDF,TXT,PNG,MP4)</label>
          <input id="file-upload" type="file" accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi" @change="onFileChange" />
          <div v-if="uploadedFile" class="file-info">
            <span>Fichier sélectionné: {{ uploadedFile.name }}</span>
            <button @click="uploadedFile = null" type="button">Retirer</button>
          </div>
        </div>
        
        <div class="step" v-if="selectedStructureId">
          <label for="multiple-images">Ou sélectionner plusieurs images (pour créer un PDF)</label>
          <input id="multiple-images" type="file" multiple accept="image/*" @change="onMultipleImagesChange" />
          <div v-if="multipleImages.length > 0" class="images-preview">
            <h4>Images sélectionnées ({{ multipleImages.length }}):</h4>
            <div class="image-list">
              <div v-for="(image, index) in multipleImages" :key="index" class="image-item">
                <span>{{ image.name }}</span>
                <button @click="removeImage(index)" type="button" class="remove-image">×</button>
              </div>
            </div>
          </div>
        </div>
        <button class="save-btn" @click="submitForm" style="margin-top:1em;" :class="{ 'disabled': !canAddDocuments || isCompressingVideo || isCreatingDocument }" :disabled="!canAddDocuments || isCompressingVideo || isCreatingDocument">
          <span v-if="isCompressingVideo">Compression en cours...</span>
          <span v-else-if="isCreatingDocument">{{ creationProgress || 'Création en cours...' }}</span>
          <span v-else>Ajouter</span>
        </button>
      </div>
      <!-- PDF VIEWER MODAL -->
    <!-- PDF VIEWER MODAL -->
    <!-- <div v-if="selectedDocument" class="modal-overlay">
      <div class="modal">
        <h2>Consulter Document</h2>
        <div class="pdf-viewer-container">
          <PdfViewer :pdfUrl="`${selectedDocument.fichier_pdf}`" />
        </div>
        <div class="modal-actions">
          <button @click="selectedDocument = null" class="cancel">Fermer</button>
        </div>
      </div>
    </div> -->
    

    </div>
  </div>
</div>

<!-- FILE VIEWER MODAL -->
<div v-if="selectedDocument && selectedDocument.fichier" class="modal-overlay">
  <div class="modal pdf-modal">
    <!-- Modal Header with Close Button -->
    <div class="modal-header-fixed">
      <h2>Consulter Document</h2>
      <button @click="closeDocumentViewer" class="modal-close-btn">Fermer</button>
    </div>

    <div class="file-viewer-container">
      <!-- PDF Viewer -->
      <PdfViewer
        v-if="selectedDocument.fichier && getFileType(selectedDocument) === 'pdf'"
        :pdfUrl="selectedDocument.fichier"
        :canDownload="canDownload"
        :canPrint="canPrint"
        :documentId="selectedDocument.idDocument"
        @download="handleDownloadAction"
        @print="handlePrintAction"
      />
      
      <!-- Image Viewer -->
      <ImageViewer
        v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'image'"
        :imageUrl="selectedDocument.fichier"
        :canDownload="canDownload"
        :canPrint="canPrint"
        :documentId="selectedDocument.idDocument"
        @download="handleDownloadAction"
        @print="handlePrintAction"
      />
      
      <!-- Video Viewer -->
      <VideoViewer
        v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'video'"
        :videoUrl="selectedDocument.fichier"
        :canDownload="canDownload"
        :documentId="selectedDocument.idDocument"
        @download="handleDownloadAction"
      />
    </div>
  </div>
</div>

<!-- Import Dossier Source Modal -->
<div v-if="showImportModal" class="doc-modal-backdrop">
  <div class="doc-modal">
    <div class="doc-modal-header">
      <h3>Importer Dossier Source</h3>
      <button @click="closeImportModal" class="close-modal">&times;</button>
    </div>
    <div class="doc-modal-body">
      <div class="step">
        <label for="import-nom-fichier">Nom du Dossier</label>
        <input id="import-nom-fichier" v-model="importNomFichier" type="text" placeholder="Nom du dossier source" />
      </div>
      <div class="step">
        <label>Ajouter des fichiers (plans)</label>
        <div style="display: flex; gap: 1em; align-items: center; margin-bottom: 1em;">
          <input ref="fileInput" type="file" accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi" @change="addSingleFile" style="display: none;" />
          <button @click="fileInput?.click()" class="save-btn" style="font-size: 0.9em; padding: 0.6em 1.2em;">Ajouter Fichier</button>
          <span style="color: #bbdefb; font-size: 0.9em;">{{ importFiles.length }} fichier(s) sélectionné(s)</span>
        </div>
        <div v-if="importFiles.length > 0" class="files-preview">
          <h4>Fichiers sélectionnés ({{ importFiles.length }}):</h4>
          <div class="file-list">
            <div v-for="(file, index) in importFiles" :key="index" class="file-item">
              <span>{{ file.name }}</span>
              <button @click="removeImportFile(index)" type="button" class="remove-file" title="Retirer ce fichier">Retirer</button>
            </div>
          </div>
        </div>
      </div>
      <div class="doc-modal-footer" style="text-align:right; margin-top:1em;">
        <button class="save-btn" @click="submitImportForm" :disabled="!importFiles.length || !importNomFichier || isCreatingDocument" style="font-size:1em;">
          <span v-if="isCreatingDocument">{{ creationProgress || 'Importation en cours...' }}</span>
          <span v-else>Importer Dossier</span>
        </button>
      </div>
    </div>
  </div>
</div>

    <!-- Enhanced Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmModal" class="delete-modal-backdrop">
      <div class="delete-modal">
        <div class="delete-modal-header">
          <div class="delete-modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Supprimer le document</h3>
          <button @click="closeDeleteModal" class="delete-modal-close">&times;</button>
        </div>
        
        <div class="delete-modal-body">
          <div class="delete-warning">
            <p>Vous êtes sur le point de supprimer :</p>
            <div class="document-info">
              <strong>{{ documentToDelete?.designation || documentToDelete?.nomFichier || 'Document sans nom' }}</strong>
            </div>
          </div>
          
          <div class="delete-actions">
            <button @click="confirmFullDelete" class="delete-btn-full">
              <span class="btn-icon">🗑️</span>
              <span class="btn-text">Supprimer complètement</span>
            </button>
            
            <div class="delete-separator">ou</div>
            
            <button @click="showSelectiveDelete" class="delete-btn-selective">
              <span class="btn-icon">📝</span>
              <span class="btn-text">Retirer des Elements du Document</span>
            </button>
          </div>
          
          <!-- Selective file deletion section -->
          <div v-if="deleteMode === 'selective'" class="selective-delete-section">
            <h4>Sélectionnez les elements à retirer :</h4>
            <div class="file-checkboxes">
              <label v-if="documentToDelete?.fichier" class="file-checkbox">
                <input type="checkbox" v-model="filesToDelete.fichier">
                <span>Fichier PDF</span>
              </label>
              <label v-if="documentToDelete?.plan" class="file-checkbox">
                <input type="checkbox" v-model="filesToDelete.plan">
                <span>Fichiers source</span>
              </label>
              <label v-if="documentToDelete?.video" class="file-checkbox">
                <input type="checkbox" v-model="filesToDelete.video">
                <span>Vidéo</span>
              </label>
              <label v-if="documentToDelete?.nomPhotos" class="file-checkbox">
                <input type="checkbox" v-model="filesToDelete.photos">
                <span>Photos</span>
              </label>
            </div>
          </div>
          
          <div class="delete-warning-text">
            ⚠️ Cette action est irréversible
          </div>
        </div>
        
        <div class="delete-modal-footer">
          <button @click="closeDeleteModal" class="btn-cancel">Annuler</button>
          <button v-if="deleteMode === 'full'" @click="executeFullDelete" class="btn-delete">Confirmer la suppression</button>
          <button v-if="deleteMode === 'selective'" @click="executeSelectiveDelete" class="btn-delete" :disabled="!hasSelectedFiles">Retirer les fichiers</button>
        </div>
      </div>
    </div>



    <!-- UPDATE MODAL -->
    <div v-if="documentToUpdate" class="doc-modal-backdrop">
      <div class="doc-modal update-modal white-modal">
        <div class="modal-header">
          <h2><i class="fas fa-edit"></i> Modifier Document</h2>
          <button @click="documentToUpdate = null" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Désignation</label>
              <input v-model="documentToUpdate.designation" :placeholder="documentToUpdate.designation || documentToUpdate.nomFichier || 'Désignation du document'" />
            </div>
            
            <div class="form-group" v-if="false">
              <label>Fichier PDF</label>
              <div class="current-file-info" v-if="documentToUpdate?.fichier">
                <span>Actuel: {{ getFileName(documentToUpdate.fichier) }}</span>
              </div>
              <input type="file" @change="onPdfFileSelect" accept=".pdf" />
              <div v-if="selectedPdfFile" class="file-info">
                <span>Nouveau: {{ selectedPdfFile?.name }}</span>
                <button @click="selectedPdfFile = null" type="button" class="remove-file">Retirer</button>
              </div>
            </div>
            
            <div class="form-group" v-if="false">
              <label>Vidéo</label>
              <div class="current-file-info" v-if="documentToUpdate?.video">
                <span>Actuel: {{ getFileName(documentToUpdate.video) }}</span>
              </div>
              <input type="file" @change="onVideoFileSelect" accept=".mp4,.mov,.avi,.mkv,.webm" />
              <div v-if="selectedVideoFile" class="file-info">
                <span>Nouveau: {{ selectedVideoFile?.name }}</span>
                <button @click="selectedVideoFile = null" type="button" class="remove-file">Retirer</button>
              </div>
            </div>
            
            <div class="form-group" v-if="false && isPiecesGraphiques" >
              <label>Plan (Fichiers ZIP)</label>
              <div class="current-file-info" v-if="documentToUpdate?.plan">
                <span>Actuel: {{ getFileName(documentToUpdate.plan) }}</span>
              </div>
              <input ref="planFilesInput" type="file" accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.dwg,.dxf" @change="addPlanFile" style="display: none;" />
              <button @click="planFilesInput?.click()" class="save-btn" style="font-size: 0.9em; padding: 0.6em 1.2em;">Ajouter Fichier Plan</button>
              <div v-if="selectedPlanFiles.length > 0" class="file-info">
                <span>{{ selectedPlanFiles.length }} fichier(s) sélectionné(s)</span>
                <div class="image-list">
                  <div v-for="(file, index) in selectedPlanFiles" :key="index" class="image-item">
                    <span>{{ file.name }}</span>
                    <button @click="removePlanFile(index)" type="button" class="remove-image">×</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group"  v-if="false">
              <label>Photos (Images)</label>
              <div class="current-file-info" v-if="documentToUpdate?.photos">
                <span>Actuel: {{ getFileName(documentToUpdate.photos) }}</span>
              </div>
              <input ref="photosUpdateInput" type="file" accept="image/*" @change="onSinglePhotoUpdateChange" style="display: none;" />
              <button @click="photosUpdateInput?.click()" class="save-btn" style="font-size: 0.9em; padding: 0.6em 1.2em;">Ajouter Photo</button>
              <div v-if="selectedUpdatePhotos.length > 0" class="file-info">
                <span>{{ selectedUpdatePhotos.length }} photo(s) sélectionnée(s)</span>
                <div class="image-list">
                  <div v-for="(photo, index) in selectedUpdatePhotos" :key="index" class="image-item">
                    <span>{{ photo.name }}</span>
                    <button @click="removeUpdatePhoto(index)" type="button" class="remove-image">×</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="documentToUpdate = null" class="btn-cancel">Annuler</button>
          <button @click="updateDocument" class="btn-update"><i class="fas fa-save"></i> Modifier</button>
        </div>
      </div>
    </div>

    <!-- Import Plan Modal -->
    <div v-if="showImportPlanModal" class="import-plan-modal-backdrop">
      <div class="import-plan-modal">
        <div class="import-plan-modal-header">
          <h3>Importer Fichiers Source</h3>
          <button @click="closeImportPlanModal" class="import-plan-close">&times;</button>
        </div>
        <div class="import-plan-modal-body">
          <p style="font-size: 0.85em; color: #6b7280; margin-bottom: 1em;">
            Sélectionnez un fichier ZIP, plusieurs fichiers individuels, ou un dossier complet. Les fichiers individuels et dossiers seront automatiquement zippés.
          </p>
          <div class="import-plan-step">
            <label class="file-upload-label">Sélectionner un dossier:</label>
            <div class="import-plan-upload">
              <!-- Individual files input -->
              <input ref="planImportFilesInput" type="file" accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.dwg,.dxf,.zip" multiple @change="addPlanImportFiles" style="display: none;" />
              <!-- Folder input -->
              <input ref="planImportInput" type="file" webkitdirectory @change="addPlanImportFolder" style="display: none;" />
              
              <div style="display: flex; gap: 0.5em; margin-bottom: 0.5em;">
                <button @click="planImportFilesInput?.click()" class="import-plan-btn">
                  📄 Sélectionner Fichiers ou ZIP
                </button>
                <button @click="planImportInput?.click()" class="import-plan-btn" style="background: #10b981;">
                  📁 Choisir Dossier
                </button>
              </div>
              <span class="import-plan-count">{{ planImportFiles.length }} fichier(s)</span>
            </div>
            <div v-if="planImportFiles.length > 0" class="import-plan-files">
              <div v-if="planImportFiles.length === 1 && planImportFiles[0].name.toLowerCase().endsWith('.zip')" class="zip-info">
                <div class="import-plan-file zip-file">
                  📦 {{ planImportFiles[0].name }} (Fichier ZIP)
                </div>
                <small style="color: #10b981; font-style: italic;">Ce fichier ZIP sera envoyé directement</small>
              </div>
              <div v-else>
                <div v-if="planImportFiles.length > 1" class="zip-notice" style="margin-bottom: 0.5em;">
                  <small style="color: #f59e0b; font-style: italic;">Ces fichiers seront automatiquement zippés avant l'envoi</small>
                </div>
                <div class="import-plan-file" v-for="(file, index) in planImportFiles.slice(0, 5)" :key="index">
                  <span>{{ file.name }}</span>
                  <button @click="removePlanImportFile(index)" type="button" class="remove-plan-file" title="Retirer ce fichier">×</button>
                </div>
                <div v-if="planImportFiles.length > 5" class="import-plan-more">
                  +{{ planImportFiles.length - 5 }} autres fichiers
                </div>
              </div>
            </div>
          </div>
          <div class="import-plan-footer">
            <button @click="closeImportPlanModal" class="import-plan-cancel">Annuler</button>
            <button @click="submitPlanImport" :disabled="!planImportFiles.length || isUploadingPlan" class="import-plan-submit">
              <span v-if="isUploadingPlan">Importation...</span>
              <span v-else>Importer</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MOVE MODAL -->
    <div v-if="documentToMove" class="doc-modal-backdrop">
      <div class="doc-modal move-modal white-modal">
        <div class="modal-header">
          <h2><i class="fas fa-arrows-alt"></i> Déplacer Document</h2>
          <button @click="documentToMove = null" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Type Produit</label>
              <select v-model="documentToMove.idTypeProduit">
                <option value="">Sélectionner un type produit</option>
                <option v-for="type in typeProduits" :key="type.idTypeProduit" :value="type.idTypeProduit">
                  {{ type.designation }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Produit</label>
              <select v-model="documentToMove.idProduit">
                <option value="">Sélectionner un produit</option>
                <option v-for="prod in produits" :key="prod.idProduit" :value="prod.idProduit">
                  {{ prod.designation }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Structure</label>
              <select v-model="documentToMove.idStructure">
                <option value="">Sélectionner une structure</option>
                <option v-for="str in structures" :key="str.idStructure" :value="str.idStructure">
                  {{ str.designation || str.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Section</label>
              <select v-model="documentToMove.idSection">
                <option value="">Sélectionner une section</option>
                <option v-for="s in sections" :key="s.idSectionProduit" :value="s.idSectionProduit">
                  {{ s.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 1</label>
              <select v-model="documentToMove.idSubDivisionNv_1">
                <option value="">Sélectionner subdivision 1</option>
                <option v-for="sub1 in divisionsNv1" :key="sub1.idSubDivisionNv_1" :value="sub1.idSubDivisionNv_1">
                  {{ sub1.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 2</label>
              <select v-model="documentToMove.idSubDivisionNv_2">
                <option value="">Sélectionner subdivision 2</option>
                <option v-for="sub2 in filteredSubDiv2List" :key="sub2.idSubDivisionNv_2.idSubDivisionNv_2" :value="sub2.idSubDivisionNv_2.idSubDivisionNv_2">
                  {{ sub2.idSubDivisionNv_2.nom }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Subdivision Niveau 3</label>
              <select v-model="documentToMove.idSubDivisionNv_3">
                <option value="">Sélectionner subdivision 3</option>
                <option v-for="sub3 in filteredSubDiv3List" :key="sub3.idSubDivisionNv_3.idSubDivisionNv_3" :value="sub3.idSubDivisionNv_3.idSubDivisionNv_3">
                  {{ sub3.idSubDivisionNv_3.nom }}
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="documentToMove = null" class="btn-cancel">Annuler</button>
          <button @click="moveDocument" class="btn-move"><i class="fas fa-arrows-alt"></i> Déplacer</button>
        </div>
      </div>
    </div>

    <!-- Validation Confirmation Modal -->
    <div v-if="showValidationConfirmModal" class="doc-modal-backdrop">
      <div class="doc-modal" style="min-width:380px;">
        <div class="doc-modal-header">
          <h3>Confirmation de validation</h3>
          <button @click="closeValidationModal" class="close-modal">&times;</button>
        </div>
        <div class="doc-modal-body">
          <p>Êtes-vous sûr de vouloir valider ce document ?</p>
          <div class="document-info">
            <strong>{{ documentToValidate?.designation || documentToValidate?.nomFichier || 'Document sans nom' }}</strong>
          </div>
        </div>
        <div class="doc-modal-footer" style="text-align:right">
          <button @click="closeValidationModal" class="view-button">Annuler</button>
          <button @click="confirmValidation" class="save-btn" style="margin-left:0.7em;" :disabled="validatingDocument">
            <span v-if="validatingDocument">Validation en cours...</span>
            <span v-else>Valider</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import './AddDocView.css';
</style>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import "vue-multiselect/dist/vue-multiselect.css";
import axiosInstance from '../../axios'
import PdfViewer from '../../components/PdfViewer.vue'
import ImageViewer from '../../components/ImageViewer.vue'
import VideoViewer from '../../components/VideoViewer.vue'
import { useUserStore } from '../../store/userStore'
import { logUserAction, LOG_ACTIONS } from '../../services/logService'
import JSZip from 'jszip'
import { useHierarchicalCounts } from '../../composables/useHierarchicalCounts'
import { useDocumentsPagination } from '../../composables/useDocumentsPagination'


// const API_BASE = 'http://10.10.150.75:8000/api'

interface Document {
  idDocument: number
  fichier?: string | null
  video?: string | null
  plan?: string | null
  photos?: string | null
  detectedType?: string
}



// User store for role-based access control
const userStore = useUserStore()
const selectedDocument = ref<Document | null>(null)

// Hierarchical counts composable
const { fetchHierarchicalData, getCount } = useHierarchicalCounts()


// Documents pagination composable
const {
  documents,
  currentPage,
  pageSize,
  totalDocuments,
  totalPages,
  hasNext,
  hasPrevious,
  loading: paginationLoading,
  error: paginationError,
  // pagination,
  fetchDocuments,
  nextPage,
  previousPage,
  goToPage,
  changePageSize
} = useDocumentsPagination()
const loadingViewDocument = ref<Record<number, boolean>>({})
const documentAbortControllers = ref<Record<number, AbortController>>({})
const isAnyDocumentLoading = computed(() => Object.values(loadingViewDocument.value).some(loading => loading))

// Toast notification system
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const toasts = ref<Toast[]>([])
let toastId = 0

function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast: Toast = {
    id: ++toastId,
    message,
    type
  }
  toasts.value.push(toast)
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    removeToast(toast.id)
  }, 4000)
}

function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Computed property to check if user can access "ajouter" buttons
// Users with CONSULTATION profile (3) can only consult, not add
const canAddDocuments = computed(() => {
  return userStore.userRole.value !== userStore.ROLES.CONSULTATION
})

// Computed property to check if user can download files
const canDownload = computed(() => {
  return userStore.canDownloadDocuments.value
})

// Computed property to check if user can print documents
const canPrint = computed(() => {
  return userStore.canPrintDocuments.value
})

// Computed property to check if user can access plans
const canAccessPlans = computed(() => {
  return userStore.canAccessPlans.value
})

// Computed property to check if user can delete documents
const canDeleteDocuments = computed(() => {
  return userStore.user.value?.suppression || false
})

// Computed property to check if user can validate documents
const canValidateDocuments = computed(() => {
  return userStore.user.value?.valide || false
})
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//  script part for doc structuree
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// Structure mode variables and functions
const typeProduits = ref<any[]>([])
const produits = ref<any[]>([])
const sections = ref<any[]>([])
const structures = ref<any[]>([])
const divisionsNv1 = ref<any[]>([])
const allSubDivs1Et2 = ref<any[]>([])
const allSubDivs2Et3 = ref<any[]>([])
const allSubDivs3Et4 = ref<any[]>([])

const selectedTypeId = ref<number | null>(null)
const selectedProduitId = ref<number | null>(null)
const selectedSectionId = ref<number | null>(null)
const selectedStructureId = ref<number | null>(null)
const selectedDivisionId = ref<number | null>(null)
const selectedSubDiv2Id = ref<number | null>(null)
const selectedSubDiv3Id = ref<number | null>(null)
const selectedSubDiv4Id = ref<number | null>(null)

const nonFichier = ref<string>('')
const uploadedFile = ref<File | null>(null)
const uploadedVideo = ref<File | null>(null)
const isCompressingVideo = ref(false)
const compressionProgress = ref('')
const isCreatingDocument = ref(false)
const creationProgress = ref('')
const graphicsFiles = ref<File[]>([])
const graphicsFileInput = ref<HTMLInputElement>()
const graphicsFolderInput = ref<HTMLInputElement>()
const selectedPhotos = ref<File[]>([])
const photosInput = ref<HTMLInputElement>()

// Toggle states for file lists
const showPdfDetails = ref(false)
const showPlanDetails = ref(false)
const showVideoDetails = ref(false)
const showPhotosDetails = ref(false)

// Import Dossier Source variables
const showImportModal = ref(false)
const importFiles = ref<File[]>([])
const importNomFichier = ref<string>('')
const fileInput = ref<HTMLInputElement>()

// Import Plan variables
const showImportPlanModal = ref(false)
const planImportFiles = ref<File[]>([])
const planImportInput = ref<HTMLInputElement>()
const planImportFilesInput = ref<HTMLInputElement>()
const documentToImportPlan = ref<any>(null)
const isUploadingPlan = ref(false)


// Initial fetch
onMounted(async () => {
  await userStore.fetchUserProfile()
  await fetchHierarchicalData()
  try {
    const [typesRes, structuresRes, subDivsRes, subDivs3Res, subDivs4Res] = await Promise.all([
      // axios.get(`${API_BASE}/types/`),
      axiosInstance.get(`types/`),
      axiosInstance.get(`structures/`),
      axiosInstance.get(`subdiv1et2/`),
      axiosInstance.get(`subdiv2et3/`),
      axiosInstance.get(`subdiv3et4/`)
    ])
    typeProduits.value = typesRes.data.sort((a: any, b: any) => (a.designation || '').toString().toLowerCase().localeCompare((b.designation || '').toString().toLowerCase()))
    structures.value = structuresRes.data.sort((a: any, b: any) => (a.designation || '').toString().toLowerCase().localeCompare((b.designation || '').toString().toLowerCase()))
    allSubDivs1Et2.value = subDivsRes.data.sort((a: any, b: any) => (a.idSubDivisionNv_2?.nom || '').toString().toLowerCase().localeCompare((b.idSubDivisionNv_2?.nom || '').toString().toLowerCase()))
    allSubDivs2Et3.value = subDivs3Res.data.sort((a: any, b: any) => (a.idSubDivisionNv_3?.nom || '').toString().toLowerCase().localeCompare((b.idSubDivisionNv_3?.nom || '').toString().toLowerCase()))
    allSubDivs3Et4.value = subDivs4Res.data.sort((a: any, b: any) => (a.idSubDivisionNv_4?.nom || '').toString().toLowerCase().localeCompare((b.idSubDivisionNv_4?.nom || '').toString().toLowerCase()))
  } catch (error) {
    console.error('Erreur lors du chargement initial', error)
  }
})

watch(selectedTypeId, async (newTypeId) => {
  selectedProduitId.value = null
  selectedSectionId.value = null
  produits.value = []
  sections.value = []
  
  // Clear all sidebar content when Type Produit changes
  clearAllSidebarContent()
  
  if (newTypeId !== null) {
    try {
      const [produitsRes, sectionsRes] = await Promise.all([
        axiosInstance.get(`produits/by-type/${newTypeId}/`),
        axiosInstance.get(`sections/by-type/${newTypeId}/`)
      ])
      produits.value = produitsRes.data.sort((a: any, b: any) => (a.designation || '').toString().toLowerCase().localeCompare((b.designation || '').toString().toLowerCase()))
      sections.value = sectionsRes.data.sort((a: any, b: any) => (a.designation || '').toString().toLowerCase().localeCompare((b.designation || '').toString().toLowerCase()))
    } catch (error) {
      console.error('Erreur produits/sections', error)
    }
  }
})

// Add structure change handler
function onStructureChange() {
  selectedDivisionId.value = null
  divisionsNv1.value = []
  
  // Clear all sidebar content when structure changes
  clearAllSidebarContent()
  
  // Reset panel width to default when changing modes
  leftPanelWidth.value = defaultPanelWidth
  
  // Set mode based on selected structure
  if (selectedStructureId.value === 5) {
    // CONTEXTE structure
    mode.value = 'contexte'
  } else {
    // Any other structure
    mode.value = 'structure'
  }
}

// Function to go back to form selection
function goBackToForm() {
  mode.value = ''
  selectedStructureId.value = null
  // Reset panel width to default
  leftPanelWidth.value = defaultPanelWidth
  // Clear all sidebar content when going back
  clearAllSidebarContent()
}

watch(selectedProduitId, () => {
  // Reset all downstream selections when Produit changes
  selectedStructureId.value = null
  selectedSectionId.value = null
  selectedDivisionId.value = null
  selectedSubDiv2Id.value = null
  selectedSubDiv3Id.value = null
  selectedSubDiv4Id.value = null
  
  // Clear downstream data arrays
  divisionsNv1.value = []
  
  // Clear all sidebar content when Produit changes
  clearAllSidebarContent()
})

watch(selectedSectionId, () => {
  // Reset all downstream selections when Section changes
  selectedDivisionId.value = null
  selectedSubDiv2Id.value = null
  selectedSubDiv3Id.value = null
  selectedSubDiv4Id.value = null
  
  // Clear all sidebar content when Section changes
  clearAllSidebarContent()
})

watch(selectedDivisionId, () => {
  // Reset all downstream selections when Division changes
  selectedSubDiv2Id.value = null
  selectedSubDiv3Id.value = null
  selectedSubDiv4Id.value = null
  
  // Clear all sidebar content when Division changes
  clearAllSidebarContent()
})

watch(selectedSubDiv2Id, () => {
  // Reset all downstream selections when SubDiv2 changes
  selectedSubDiv3Id.value = null
  selectedSubDiv4Id.value = null
  
  // Clear all sidebar content when SubDiv2 changes
  clearAllSidebarContent()
})

watch(selectedSubDiv3Id, () => {
  // Reset all downstream selections when SubDiv3 changes
  selectedSubDiv4Id.value = null
  
  // Clear all sidebar content when SubDiv3 changes
  clearAllSidebarContent()
})

watch(selectedStructureId, async (newStructureId) => {
  // Reset all downstream selections when Structure changes
  selectedSectionId.value = null
  selectedDivisionId.value = null
  selectedSubDiv2Id.value = null
  selectedSubDiv3Id.value = null
  selectedSubDiv4Id.value = null
  
  // Clear downstream data arrays
  divisionsNv1.value = []
  
  // Clear all sidebar content when Structure changes
  clearAllSidebarContent()
  
  if (newStructureId !== null) {
    try {
      const res = await axiosInstance.get(`subdivision-nv1/by-structure/${newStructureId}/`)
      divisionsNv1.value = res.data.sort((a: any, b: any) => (a.ordre || 0) - (b.ordre || 0))
    } catch (error) {
      console.error('Erreur divisions nv1', error)
    }
  }
})

// Watch for any select input changes to clear sidebar content
watch([selectedSectionId, selectedDivisionId, selectedSubDiv2Id, selectedSubDiv3Id], () => {
  // Clear sidebar content when any subdivision selection changes
  showDeleteMode.value = false
  showSuccess.value = false
  showStructureDocContent.value = false
  showValidationMode.value = false
})

// Computed property to sort structures by ordre field
const sortedStructures = computed(() => {
  return structures.value.sort((a: any, b: any) => (a.ordre || 0) - (b.ordre || 0))
})

// Computed property to filter products where date_suppression is null
const filteredProduits = computed(() => {
  return produits.value.filter(prod => prod.date_suppression === null)
})

// Computed properties to filter other entities where date_suppression is null
const filteredFournisseurs = computed(() => {
  return fournisseursList.value.filter(item => item.date_suppression === null)
})

const filteredMaitresOuvrage = computed(() => {
  return maitresOuvrageList.value.filter(item => item.date_suppression === null)
})

const filteredMaitresOeuvre = computed(() => {
  return maitresOeuvreList.value.filter(item => item.date_suppression === null)
})

const filteredSoustraitants = computed(() => {
  return soustraitantsList.value.filter(item => item.date_suppression === null)
})

const filteredBureauxEtudes = computed(() => {
  return bureauxEtudesList.value.filter(item => item.date_suppression === null)
})

const requiresSubDiv2 = computed(() => {
  const division = divisionsNv1.value.find(d => d.idSubDivisionNv_1 === selectedDivisionId.value)
  return division?.subDiv === true
})

const requiresSubDiv3 = computed(() => {
  if (!selectedSubDiv2Id.value) return false
  const subDiv2Item = filteredSubDiv2List.value.find(
    item => item.idSubDivisionNv_2.idSubDivisionNv_2 === selectedSubDiv2Id.value
  )
  return subDiv2Item?.idSubDivisionNv_2.subDiv === true
})
const filteredSubDiv2List = computed(() => {
  return allSubDivs1Et2.value.filter(
    item => item.idSubDivisionNv_1.idSubDivisionNv_1 === selectedDivisionId.value
  )
})
const filteredSubDiv3List = computed(() => {
  return allSubDivs2Et3.value.filter(
    item => item.idSubDivisionNv_2.idSubDivisionNv_2 === selectedSubDiv2Id.value
  )
})
const filteredSubDiv4List = computed(() => {
  if (!selectedSubDiv3Id.value) return []
  const selectedSubDiv3Name = getSubDiv3Designation(selectedSubDiv3Id.value)
  return allSubDivs3Et4.value.filter(
    item => item.idSubDivisionNv_3?.nom === selectedSubDiv3Name && item.idSubDivisionNv_4
  )
})

const isSubDivAllowed = computed(() => {
  if (!selectedDivisionId.value) return false
  const division = divisionsNv1.value.find(d => d.idSubDivisionNv_1 === selectedDivisionId.value)
  if (!division) return false
  if (!division.subDiv) return true
  const relatedSubDiv2List = filteredSubDiv2List.value
  if (relatedSubDiv2List.length === 0) return true
  if (!selectedSubDiv2Id.value) return false
  const subDiv2Item = relatedSubDiv2List.find(
    item => item.idSubDivisionNv_2.idSubDivisionNv_2 === selectedSubDiv2Id.value
  )
  if (!subDiv2Item) return false
  if (!subDiv2Item.idSubDivisionNv_2.subDiv) return true
  const relatedSubDiv3List = filteredSubDiv3List.value
  if (relatedSubDiv3List.length === 0) return true
  // Allow subdivision level 3 selection even if there are level 4 options
  if (selectedSubDiv3Id.value) return true
  return false
})

const isPiecesGraphiques = computed(() => {
  if (!selectedDivisionId.value) return false
  const division = divisionsNv1.value.find(d => d.idSubDivisionNv_1 === selectedDivisionId.value)
  return division?.nom?.toUpperCase().includes('PIECES GRAPHIQUES') || division?.nom?.toUpperCase().includes('PIECE GRAPHIQUES') || false
})

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    const file = files[0]
    console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size)
    uploadedFile.value = file
    // Reset PDF details state when a new file is selected
    showPdfDetails.value = false
    // Don't clear other file selections - allow multiple file types
  }
}

async function onVideoChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    const originalVideo = files[0]
    
      // Small videos, use as-is
    uploadedVideo.value = originalVideo
    
  }
}

function addGraphicsFile(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    // Check if it's a single ZIP file
    if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
      graphicsFiles.value = [files[0]]
      showToast(`Fichier ZIP sélectionné: ${files[0].name}`, 'success')
    } else {
      // Multiple files - we'll zip them later
      graphicsFiles.value = [...graphicsFiles.value, ...Array.from(files)]
      console.log(
        'Fichiers ajoutés:',
        Array.from(files).map(f => f.name),
        'Total fichiers:',
        graphicsFiles.value.length
      )
    }

    showPlanDetails.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

// Function to handle folder selection
async function addGraphicsFolder(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    try {
      showToast('Création du fichier ZIP à partir du dossier...', 'success')
      
      // Create ZIP from folder
      const zip = new JSZip()
      const fileArray = Array.from(files)
      
      // Add all files to ZIP maintaining folder structure
      for (const file of fileArray) {
        const relativePath = file.webkitRelativePath || file.name
        zip.file(relativePath, file)
      }
      
      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Create a File object from the blob
      const folderName = fileArray[0].webkitRelativePath?.split('/')[0] || 'dossier'
      const zipFile = new File([zipBlob], `${folderName}.zip`, { type: 'application/zip' })
      
      // Replace current files with the ZIP
      graphicsFiles.value = [zipFile]
      
      showToast(`Dossier zippé avec succès: ${zipFile.name} (${fileArray.length} fichiers)`, 'success')
      showPlanDetails.value = false
      ;(e.target as HTMLInputElement).value = ''
      
    } catch (error) {
      console.error('Erreur lors de la création du ZIP:', error)
      showToast('Erreur lors de la création du fichier ZIP', 'error')
    }
  }
}

// Function to handle individual files for plan import
function addPlanImportFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    // Check if it's a single ZIP file
    if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
      planImportFiles.value = [files[0]]
      showToast(`Fichier ZIP sélectionné: ${files[0].name}`, 'success')
    } else {
      // Multiple files - we'll zip them later
      planImportFiles.value = [...planImportFiles.value, ...Array.from(files)]
    }
    ;(e.target as HTMLInputElement).value = ''
  }
}

// Function to handle folder selection for plan import
async function addPlanImportFolder(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    try {
      showToast('Création du fichier ZIP à partir du dossier...', 'success')
      
      // Create ZIP from folder
      const zip = new JSZip()
      const fileArray = Array.from(files)
      
      // Add all files to ZIP maintaining folder structure
      for (const file of fileArray) {
        const relativePath = file.webkitRelativePath || file.name
        zip.file(relativePath, file)
      }
      
      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Create a File object from the blob
      const folderName = fileArray[0].webkitRelativePath?.split('/')[0] || 'dossier'
      const zipFile = new File([zipBlob], `${folderName}.zip`, { type: 'application/zip' })
      
      // Replace current files with the ZIP
      planImportFiles.value = [zipFile]
      
      showToast(`Dossier zippé avec succès: ${zipFile.name} (${fileArray.length} fichiers)`, 'success')
      ;(e.target as HTMLInputElement).value = ''
      
    } catch (error) {
      console.error('Erreur lors de la création du ZIP:', error)
      showToast('Erreur lors de la création du fichier ZIP', 'error')
    }
  }
}



function removeGraphicsFile(index: number) {
  graphicsFiles.value.splice(index, 1)
}

// Function to remove individual files from plan import
function removePlanImportFile(index: number) {
  planImportFiles.value.splice(index, 1)
}



function removeImage(index: number) {
  multipleImages.value.splice(index, 1)
  showImageToPdfOption.value = multipleImages.value.length > 0
}

function onSinglePhotoChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      // Check if photo already exists
      if (!selectedPhotos.value.some(p => p.name === file.name && p.size === file.size)) {
        selectedPhotos.value.push(file)
        showToast(`Photo "${file.name}" ajoutée!`, 'success')
      }
      // Clear the input so the same file can be selected again
      ;(e.target as HTMLInputElement).value = ''
    }
  }
}

function removePhoto(index: number) {
  selectedPhotos.value.splice(index, 1)
}



async function convertPhotosToPdf(): Promise<File> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF('p', 'mm', 'a4')
  
  for (let i = 0; i < selectedPhotos.value.length; i++) {
    const file = selectedPhotos.value[i]
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    await new Promise((resolve) => {
      img.onload = () => {
        // A4 dimensions in mm: 210 x 297, with margins
        const pageWidth = 210
        const pageHeight = 297
        const margin = 5 // Smaller margins for larger image
        const maxWidth = pageWidth - (margin * 2)
        const maxHeight = pageHeight - (margin * 2)
        
        // Use original image dimensions for maximum quality
        let { width, height } = img
        
        // Calculate dimensions to fit page while maintaining aspect ratio
        const widthRatio = maxWidth / width
        const heightRatio = maxHeight / height
        const ratio = Math.min(widthRatio, heightRatio)
        
        const finalWidth = width * ratio
        const finalHeight = height * ratio
        
        // Use original image dimensions for canvas to preserve quality
        canvas.width = width
        canvas.height = height
        
        // Disable image smoothing for crisp quality
        ctx.imageSmoothingEnabled = false
        
        // Draw image at original size
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to maximum quality JPEG (1.0 = no compression)
        const imgData = canvas.toDataURL('image/jpeg', 1.0)
        
        if (i > 0) pdf.addPage()
        
        // Center image on page
        const x = (pageWidth - finalWidth) / 2
        const y = (pageHeight - finalHeight) / 2
        
        pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight)
        resolve(null)
      }
      img.src = URL.createObjectURL(file)
    })
  }
  
  const pdfBlob = pdf.output('blob')
  return new File([pdfBlob], `${nonFichier.value || 'photos'}.pdf`, { type: 'application/pdf' })
}

async function convertUpdatePhotosToPdf(): Promise<File> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF('p', 'mm', 'a4')
  
  for (let i = 0; i < selectedUpdatePhotos.value.length; i++) {
    const file = selectedUpdatePhotos.value[i]
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    await new Promise((resolve) => {
      img.onload = () => {
        const pageWidth = 210
        const pageHeight = 297
        const margin = 5
        const maxWidth = pageWidth - (margin * 2)
        const maxHeight = pageHeight - (margin * 2)
        
        let { width, height } = img
        
        const widthRatio = maxWidth / width
        const heightRatio = maxHeight / height
        const ratio = Math.min(widthRatio, heightRatio)
        
        const finalWidth = width * ratio
        const finalHeight = height * ratio
        
        canvas.width = width
        canvas.height = height
        
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0, width, height)
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0)
        
        if (i > 0) pdf.addPage()
        
        const x = (pageWidth - finalWidth) / 2
        const y = (pageHeight - finalHeight) / 2
        
        pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight)
        resolve(null)
      }
      img.src = URL.createObjectURL(file)
    })
  }
  
  const pdfBlob = pdf.output('blob')
  return new File([pdfBlob], 'update-photos.pdf', { type: 'application/pdf' })
}

function getTypeDesignation(id: number | null) {
  return typeProduits.value.find(t => t.idTypeProduit === id)?.designation || ''
}
function getProduitDesignation(id: number | null) {
  return produits.value.find(p => p.idProduit === id)?.designation || ''
}
function getStructureDesignation(id: number | null) {
  return structures.value.find(s => s.idStructure === id)?.nom || ''
}
function getSectionDesignation(id: number | null) {
  return sections.value.find(s => s.idSectionProduit === id)?.nom || ''
}
function getDivisionDesignation(id: number | null) {
  return divisionsNv1.value.find(d => d.idSubDivisionNv_1 === id)?.nom || ''
}
// function getSubDiv2Designation(id: number | null) {
//   return filteredSubDiv2List.value.find(i => i.idSubDivisionNv_2.idSubDivisionNv_2 === id)?.idSubDivisionNv_2.nom || ''
// }
// function getSubDiv2Designation(id: number | null) {
//   return filteredSubDiv2List.value.find(i => i.idSubDivisionNv_2.idSubDivisionNv_2 === id)?.idSubDivisionNv_2.nom || ''
// }
function getSubDiv2Designation(id: number | null) {
  return filteredSubDiv2List.value.find(i => i.idSubDivisionNv_2.idSubDivisionNv_2 === id)?.idSubDivisionNv_2.nom || ''
}
function getSubDiv3Designation(id: number | null) {
  return filteredSubDiv3List.value.find(i => i.idSubDivisionNv_3.idSubDivisionNv_3 === id)?.idSubDivisionNv_3.nom || ''
}
function getSubDiv4Designation(id: number | null) {
  return filteredSubDiv4List.value.find(i => i.id === id)?.idSubDivisionNv_4?.nom || ''
}

// Helper function to truncate file names to 90 characters
function truncateFileName(fileName: string, maxLength: number = 90): string {
  if (!fileName || fileName.length <= maxLength) {
    return fileName;
  }
  
  // Find the last dot to preserve file extension
  const lastDotIndex = fileName.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    // No extension, just truncate
    return fileName.substring(0, maxLength);
  }
  
  const extension = fileName.substring(lastDotIndex);
  const nameWithoutExtension = fileName.substring(0, lastDotIndex);
  
  // Calculate how much space we have for the name part
  const availableLength = maxLength - extension.length;
  
  if (availableLength <= 0) {
    // Extension is too long, just truncate the whole thing
    return fileName.substring(0, maxLength);
  }
  
  // Truncate the name part and add the extension
  return nameWithoutExtension.substring(0, availableLength) + extension;
}

async function submitForm() {
  if (isCreatingDocument.value) return; // Prevent multiple submissions
  
  isCreatingDocument.value = true;
  creationProgress.value = 'Préparation du document...';
  
  const formData = new FormData();
  
  // Add current date for creation and modification
  const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  formData.append('idTypeProduit', String(selectedTypeId.value || ''));
  formData.append('idProduit', String(selectedProduitId.value || ''));
  formData.append('idStructure', String(selectedStructureId.value || ''));
  formData.append('idSection', String(selectedSectionId.value || ''));
  formData.append('idSubDivisionNv_1', String(selectedDivisionId.value || ''));
  
  // Only add subdivision fields if they have values
  if (selectedSubDiv2Id.value) {
    formData.append('idSubDivisionNv_2', String(selectedSubDiv2Id.value));
  }
  if (selectedSubDiv3Id.value) {
    formData.append('idSubDivisionNv_3', String(selectedSubDiv3Id.value));
  }
  
  if (selectedSubDiv4Id.value) {
    formData.append('idSubDivisionNv_4', String(selectedSubDiv4Id.value));
  }
  
  formData.append('typeProduitDesignation', getTypeDesignation(selectedTypeId.value) || '');
  formData.append('produitDesignation', getProduitDesignation(selectedProduitId.value) || '');
  formData.append('structureNom', getStructureDesignation(selectedStructureId.value) || '');
  formData.append('sectionNom', getSectionDesignation(selectedSectionId.value) || '');
  formData.append('subDivisionNv1Nom', getDivisionDesignation(selectedDivisionId.value) || '');
  formData.append('subDivisionNv3Nom', getSubDiv3Designation(selectedSubDiv3Id.value) || '');
  formData.append('subDivisionNv4Nom', getSubDiv4Designation(selectedSubDiv4Id.value) || '');
  formData.append('designation', nonFichier.value || '');
  formData.append('chemin', 'No chemin'); // Remove extra space
  formData.append('version', '1.0'); // Add default version
  formData.append('dateCreation', currentDate);
  formData.append('dateModification', currentDate);
  
  // Add the current user's ID as creerPar
  if (userStore.user.value?.idUser) {
    formData.append('creerPar', String(userStore.user.value.idUser));
  }
  
  try {
    let fileToUpload = uploadedFile.value;
    
    // If multiple images are selected, convert them to PDF
    if (multipleImages.value.length > 0 && !uploadedFile.value) {
      creationProgress.value = 'Conversion des images en PDF...';
      fileToUpload = await convertPhotosToPdf();
    }
    
    // Handle normal files - append as 'fichier'
    if (fileToUpload) {
      const truncatedFileName = truncateFileName(fileToUpload.name);
      console.log('Appending file to FormData:', truncatedFileName, 'Type:', fileToUpload.type, 'Size:', fileToUpload.size)
      formData.append('fichier', fileToUpload, truncatedFileName);
    }
    
    // Handle video files - append as 'video'
    if (uploadedVideo.value) {
      const truncatedVideoName = truncateFileName(uploadedVideo.value.name);
      console.log('Appending video to FormData:', truncatedVideoName, 'Type:', uploadedVideo.value.type, 'Size:', uploadedVideo.value.size)
      formData.append('video', uploadedVideo.value, truncatedVideoName);
    }
    
    // Handle graphics files (zip them for PiecesGraphiques) - append as 'plan'
    if (graphicsFiles.value.length > 0) {
      let planFile: File;
      
      // If we have a single ZIP file, use it directly
      if (graphicsFiles.value.length === 1 && graphicsFiles.value[0].name.toLowerCase().endsWith('.zip')) {
        planFile = graphicsFiles.value[0];
      } else {
        // Multiple files - create ZIP
        creationProgress.value = 'Création du fichier ZIP...';
        const zip = new JSZip();
        
        // Add all files to ZIP
        for (const file of graphicsFiles.value) {
          zip.file(file.name, file);
        }
        
        // Generate ZIP blob
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        planFile = new File([zipBlob], 'plan_files.zip', { type: 'application/zip' });
      }
      
      const truncatedPlanName = truncateFileName(planFile.name);
      formData.append('plan', planFile, truncatedPlanName);
    }

    
    // Handle photos (convert to PDF) - append as 'photos'
    if (selectedPhotos.value.length > 0) {
      creationProgress.value = 'Conversion des photos en PDF...';
      const photosPdf = await convertPhotosToPdf();
      const truncatedPhotosName = truncateFileName(photosPdf.name);
      console.log('Appending photos to FormData:', truncatedPhotosName, 'Type:', photosPdf.type, 'Size:', photosPdf.size)
      formData.append('photos', photosPdf, truncatedPhotosName);
    }
    
    // Debug: Log all FormData entries
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name} (${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    creationProgress.value = 'Envoi du document au serveur...';
    const response = await axiosInstance.post('documents/create-two-file/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    showToast('Document créé avec succès!', 'success');
    console.log(response.data);
    
    // Reset form
    nonFichier.value = '';
    uploadedFile.value = null;
    uploadedVideo.value = null;
    graphicsFiles.value = [];
    multipleImages.value = [];
    showImageToPdfOption.value = false;
    selectedPhotos.value = [];
    // Reset toggle states
    showPdfDetails.value = false;
    showPlanDetails.value = false;
    showVideoDetails.value = false;
    showPhotosDetails.value = false;
    
    // Close modal or sidebar if open
    if (showDocModal.value) {
      closeDocModal();
      fetchDocListForCurrentSelection(); // Refresh the document list
    } else if (showStructureConsulterContent.value || showStructureDocContent.value) {
    // else if (showStructureDocContent.value || showStructureConsulterContent.value) {
      fetchDocListForCurrentSelection(); // Refresh the document list
    }
    
  } catch (error: any) {
    console.error('Erreur lors de la création du document', error);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
      showToast('Erreur: ' + JSON.stringify(error.response.data), 'error');
    } else {
      showToast('Erreur lors de la création du document', 'error');
    }
  } finally {
    isCreatingDocument.value = false;
    creationProgress.value = '';
  }
}

// DOC TABLE POPUP MODAL
const showDocModal = ref(false);
const docModalMode = ref<'create'|'consult'|'delete'|''>('');
const loadingDocs = computed(() => paginationLoading.value)
const docList = ref<any[]>([]);
const docModalError = computed(() => paginationError.value || '')

// Structure mode sidebar content
const showStructureDocContent = ref(false);
const showStructureConsulterContent = ref(false);

// SUCCESS MESSAGE VARIABLE
const showSuccess = ref(false);
const showDeleteMode = ref(false);
const showMiseAJourMode = ref(false);
const showImportDossierMode = ref(false);
const showValidationMode = ref(false);
const loadingConsulter = ref(false);
const consulterAbortController = ref<AbortController | null>(null);





// Validation modal states
const showValidationConfirmModal = ref(false);
const documentToValidate = ref<any>(null);
const validatingDocument = ref(false);
const validatingDocuments = ref<Record<number, boolean>>({});

// Document to update and move states
const documentToUpdate = ref<any>(null);
const documentToMove = ref<any>(null);
const selectedFile = ref<File | null>(null);
const multipleImages = ref<File[]>([]);
const showImageToPdfOption = ref(false);

// Update modal file states
const selectedPdfFile = ref<File | null>(null);
const selectedVideoFile = ref<File | null>(null);
const selectedPlanFiles = ref<File[]>([]);
const selectedUpdatePhotos = ref<File[]>([]);
const planFilesInput = ref<HTMLInputElement>();
const photosUpdateInput = ref<HTMLInputElement>();

// Search functionality
const searchQuery = ref('');

// Context search functionality
const contextAjouterSearchQuery = ref('');
const contextConsulterSearchQuery = ref('');

// Remove legacy pagination - now using server-side pagination from composable

// Expandable description functionality
const expandedDescriptions = ref<Record<number, boolean>>({});

// Function to truncate description text
function truncateDescription(text: string, maxLength: number = 30): string {
  if (!text) return '(non renseigné)';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Function to toggle description expansion
function toggleDescription(documentId: number) {
  expandedDescriptions.value[documentId] = !expandedDescriptions.value[documentId];
}

// Function to check if description is expanded
function isDescriptionExpanded(documentId: number): boolean {
  return expandedDescriptions.value[documentId] || false;
}

// Function to get display text for description
function getDescriptionDisplay(document: any): string {
  const text = document.designation || document.nomFichier || '';
  if (!text) return '(non renseigné)';
  
  if (isDescriptionExpanded(document.idDocument)) {
    return text;
  }
  
  return truncateDescription(text, 30);
}

// Function to check if description needs truncation
function needsTruncation(text: string): boolean {
  if (!text) return false;
  return text.length > 30;
}

// Function to get director periods for display
function getDirectorPeriods(director: any): any[] {
  if (!isAlreadySelected('direction_projet', director)) {
    return [];
  }
  
  // Get all periods for this director from selectedDirectionsProjets
  const directorPeriods = selectedDirectionsProjets.value.filter(selected => {
    // Match by ID or name
    if (director.idDirecteur && selected.idDirecteur && director.idDirecteur === selected.idDirecteur) {
      return true;
    }
    if (director.id && selected.id && director.id === selected.id) {
      return true;
    }
    const directorName = director.nomPrenomDirecteur || `${director.nom || ''} ${director.prenom || ''}`.trim();
    const selectedName = selected.nomPrenomDirecteur || `${selected.nom || ''} ${selected.prenom || ''}`.trim();
    return directorName === selectedName;
  });
  
  return directorPeriods.map(period => ({
    date_deb: period.date_deb,
    date_fin: period.date_fin
  }));
}

// Function to format date for display
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

// Function to get director date value for contextAjouter table (legacy support)
function getDirectorDateValue(director: any, column: string): string {
  // Only show dates if the director is actually selected (has Enlever button)
  if (!isAlreadySelected('direction_projet', director)) {
    return '-';
  }
  
  // Find the matching selected director by ID or name
  const selectedDirector = selectedDirectionsProjets.value.find(selected => {
    // Try matching by various ID fields
    if (director.idDirecteur && selected.idDirecteur && director.idDirecteur === selected.idDirecteur) {
      return true;
    }
    if (director.id && selected.id && director.id === selected.id) {
      return true;
    }
    // Try matching by name combination
    const directorName = director.nomPrenomDirecteur || `${director.nom || ''} ${director.prenom || ''}`.trim();
    const selectedName = selected.nomPrenomDirecteur || `${selected.nom || ''} ${selected.prenom || ''}`.trim();
    return directorName === selectedName;
  });
  
  if (selectedDirector && selectedDirector[column]) {
    return new Date(selectedDirector[column]).toLocaleDateString('fr-FR');
  }
  
  return '-';
}

// Director consultation functions from DirectorConsultationFix.js
function getDirectorRowClass(row: any, index: number, allRows: any[]): string {
  if (index === 0) return 'director-first-period';
  
  const currentDirector = row.nomPrenomDirecteur || '';
  const previousDirector = allRows[index - 1]?.nomPrenomDirecteur || '';
  
  if (currentDirector === previousDirector) {
    return 'director-additional-period';
  }
  
  return 'director-first-period';
}

function getDirectorDisplayName(row: any, index: number, allRows: any[]): string {
  if (index === 0) return row.nomPrenomDirecteur || '';
  
  const currentDirector = row.nomPrenomDirecteur || '';
  const previousDirector = allRows[index - 1]?.nomPrenomDirecteur || '';
  
  // If same director as previous row, show "↳ Période 2", "↳ Période 3", etc.
  if (currentDirector === previousDirector) {
    let periodCount = 1;
    for (let i = 0; i < index; i++) {
      if (allRows[i].nomPrenomDirecteur === currentDirector) {
        periodCount++;
      }
    }
    return `↳ Période ${periodCount}`;
  }
  
  return currentDirector;
}

// Pagination functions with server-side support
function goToPageWithParams(page: number) {
  const params = getCurrentDocumentParams();
  goToPage(page, params);
}

function nextPageWithParams() {
  const params = getCurrentDocumentParams();
  nextPage(params);
}

function previousPageWithParams() {
  const params = getCurrentDocumentParams();
  previousPage(params);
}

function getCurrentDocumentParams() {
  const params: any = {};
  if (selectedTypeId.value) params.idTypeProduit = selectedTypeId.value;
  if (selectedProduitId.value) params.idProduit = selectedProduitId.value;
  if (selectedStructureId.value) params.idStructure = selectedStructureId.value;
  if (selectedSectionId.value) params.idSection = selectedSectionId.value;
  if (selectedDivisionId.value) params.idSubDivisionNv_1 = selectedDivisionId.value;
  if (selectedSubDiv2Id.value) params.idSubDivisionNv_2 = selectedSubDiv2Id.value;
  if (selectedSubDiv3Id.value) params.idSubDivisionNv_3 = selectedSubDiv3Id.value;
  if (selectedSubDiv4Id.value) params.idSubDivisionNv_4 = selectedSubDiv4Id.value;
  return params;
}

function changePageSizeWithParams(newSize: string) {
  const params = getCurrentDocumentParams();
  changePageSize(parseInt(newSize), params);
}



// Reset pagination when search changes
watch(searchQuery, () => {
  const params = getCurrentDocumentParams();
  fetchDocuments(params, 1);
});

// Function to fetch documents for current selection
async function fetchDocListForCurrentSelection() {
  if (!selectedTypeId.value || !selectedProduitId.value || !selectedStructureId.value || !selectedSectionId.value || !selectedDivisionId.value) {
    return;
  }

  const params: any = {
    idTypeProduit: selectedTypeId.value,
    idProduit: selectedProduitId.value,
    idStructure: selectedStructureId.value,
    idSection: selectedSectionId.value,
    idSubDivisionNv_1: selectedDivisionId.value
  };

  if (selectedSubDiv2Id.value) {
    params.idSubDivisionNv_2 = selectedSubDiv2Id.value;
  }
  if (selectedSubDiv3Id.value) {
    params.idSubDivisionNv_3 = selectedSubDiv3Id.value;
  }
  if (selectedSubDiv4Id.value) {
    params.idSubDivisionNv_4 = selectedSubDiv4Id.value;
  }

  await fetchDocuments(params);
}



// Documents are now paginated from server, apply user permissions
const filteredDocList = computed(() => {
  let filteredDocs = paginatedDocuments.value;
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filteredDocs = filteredDocs.filter((doc: any) => {
      const designation = doc.designation || doc.nomFichier || '';
      return designation.toLowerCase().includes(query);
    });
  }
  
  // Filter out documents with valide null or false for users with profile ID 3 (CONSULTATION) who don't have validation permission
  if (userStore.userRole.value === userStore.ROLES.CONSULTATION && !userStore.user.value?.valide) {
    filteredDocs = filteredDocs.filter((doc: any) => doc.valide === true);
  }
  
  return filteredDocs;
});

// Server-side pagination - documents are already paginated
const paginatedDocList = computed(() => filteredDocList.value);

// Computed property for pagination info
// const paginationInfo = computed(() => {
//   const total = totalDocuments.value;
//   const start = total === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1;
//   const end = Math.min(currentPage.value * pageSize.value, total);
//   return { start, end, total };
// });

// Alias for compatibility
const paginatedDocuments = computed(() => documents.value);

// Computed property to filter documents for validation (only documents with valide: false)
const filteredValidationDocList = computed(() => {
  return paginatedDocuments.value.filter((doc: any) => doc.valide === false);
});

// Documents are already paginated from API
const paginatedValidationDocList = computed(() => filteredValidationDocList.value);

// Use server pagination for validation
const validationTotalPages = computed(() => totalPages.value);

// Computed property for validation pagination info
const validationPaginationInfo = computed(() => {
  const total = totalDocuments.value;
  const start = total === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1;
  const end = Math.min(currentPage.value * pageSize.value, total);
  return { start, end, total };
});

// Computed property to filter context ajouter items
const filteredContextAjouterItems = computed(() => {
  // Get the filtered list based on entity type
  let baseList = contextAjouter.value.all;
  
  // Apply date_suppression filter based on entity type
  if (contextAjouter.value.entityKey === 'fournisseur') {
    baseList = baseList.filter(item => item.date_suppression === null);
  } else if (contextAjouter.value.entityKey === 'maitre_ouvrage') {
    baseList = baseList.filter(item => item.date_suppression === null);
  } else if (contextAjouter.value.entityKey === 'maitre_oeuvre') {
    baseList = baseList.filter(item => item.date_suppression === null);
  } else if (contextAjouter.value.entityKey === 'soustraitants_tvx') {
    baseList = baseList.filter(item => item.date_suppression === null);
  } else if (contextAjouter.value.entityKey === 'bet_soustraitants_etudes') {
    baseList = baseList.filter(item => item.date_suppression === null);
  }
  
  // Apply search filter if search query exists
  if (!contextAjouterSearchQuery.value.trim()) {
    return baseList;
  }
  
  const query = contextAjouterSearchQuery.value.toLowerCase().trim();
  return baseList.filter(item => 
    contextAjouter.value.columnKeys.some(key => 
      (item[key]?.toString() || '').toLowerCase().includes(query)
    )
  );
});

// Computed property to filter context consulter items
const filteredContextConsulterItems = computed(() => {
  if (!contextConsulterSearchQuery.value.trim()) {
    return contextConsulter.value.data;
  }
  
  const query = contextConsulterSearchQuery.value.toLowerCase().trim();
  return contextConsulter.value.data.filter(item => 
    contextConsulter.value.columnKeys.some(key => 
      (item[key]?.toString() || '').toLowerCase().includes(query)
    )
  );
});

// Resizable panels functionality
const leftPanelWidth = ref(36); // percentage
const defaultPanelWidth = 36; // default percentage
const isResizing = ref(false);

function startResize(e: MouseEvent) {
  isResizing.value = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  e.preventDefault();
}

function handleResize(e: MouseEvent) {
  if (!isResizing.value) return;
  
  const containerWidth = window.innerWidth;
  const newLeftWidth = (e.clientX / containerWidth) * 100;
  
  // Constrain between 30% and 80%
  if (newLeftWidth >= 30 && newLeftWidth <= 80) {
    leftPanelWidth.value = newLeftWidth;
  }
}

function stopResize() {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
}

// NEW SEPARATE CONSULTER VARIABLES
const showConsulterPanel = ref(false);
// const consulterDocList = ref<any[]>([]);
// const consulterLoading = ref(false);
// const consulterError = ref('');


// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//  script part for Context
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


// type ContextEntityKey =
//   | 'projet'
//   | 'maitre_ouvrage'
//   | 'maitre_oeuvre'
//   | 'soustraitants_tvx'
//   | 'fournisseur'
//   | 'bet_soustraitants_etudes'
//   | 'direction_projet';

// interface ContextEntityConfig {
//   label: string;
//   api: string;
//   idCol: string;
//   columns: string[];
//   columnKeys: string[];
//   listRef: any;
//   selectedRef: any;
//   allowMultiple: boolean;
// }


// --- New reactive state for context consulter modal ---
const contextConsulter = ref({
  visible: false,
  entityKey: '',
  entityLabel: '',
  loading: false,
  error: '',
  columns: [] as string[],
  columnKeys: [] as string[],
  data: [] as any[]
});
// --- Per-entity configuration. You can move this to a constants file if you want. ---
interface EntityConfig {
  label: string;
  endpoint: ProduitEndpoint | ProjetEndpoint;
  columns: string[];
  columnKeys: string[];
}

const contextConsulterEntityConfig: Record<string, EntityConfig> = {
  projet: {
    label: "Projet",
    endpoint: ((produitId: number) => `projets/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["Code", "Description", "Wilaya", "Commune"],
    columnKeys: ["code", "description", "wilaya", "commune"]
  },
  fournisseur: {
    label: "Fournisseur",
    endpoint: ((produitId: number) => `fournisseur/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["Désignation", "Description", "Adresse"],
    columnKeys: ["designationFournisseur", "description", "adresse"]
  },
  maitre_oeuvre: {
    label: "Maîtres d'Œuvre(BCS)",
    endpoint: ((produitId: number) => `/moe/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["Désignation", "Description", "Adresse"],
    columnKeys: ["designationMO", "description", "adresse"]
  },
  maitre_ouvrage: {
    label: "Maîtres d'Ouvrage",
    endpoint: ((produitId: number) => `moa/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["Désignation", "Description", "Adresse", "Email"],
    columnKeys: ["designationMOg", "description", "adresse", "email"]
  },
  soustraitants_tvx: {
    label: "Sous-traitants Travaux",
    endpoint: ((produitId: number) => `soustraitants/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["Désignation", "Description", "Adresse", "Téléphone", "Email"],
    columnKeys: ["designationStt", "description", "adresse", "telephone", "email"]
  },
  bet_soustraitants_etudes: {
    label: "BET Sous-traitants",
    endpoint: ((produitId: number) => `bet/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["Nom", "Description"],
    columnKeys: ["nom", "description"]
  },
  direction_projet: {
    label: "Direction du Projet",
    endpoint: ((projetCode: string) => `directeurs-by-projet/${projetCode}`) as ProjetEndpoint,
    columns: ["Nom", "Fonction", "Téléphone", "Périodes"],
    columnKeys: ["nomPrenomDirecteur", "fonction", "telephone", "periods"]
  },
  // paq: {
  //   label: "PAQ",
  //   endpoint: (() => `paqs/`) as ProduitEndpoint,
  //   columns: ["Désignation", "Description"],
  //   columnKeys: ["designationPAQ", "description"]
  // }
};

// Define interfaces for API endpoints
interface ProduitEndpoint {
  (produitId: number): string;
}

interface ProjetEndpoint {
  (projetCode: string): string;
}

// Define an interface for the directeur object
// Update the Directeur interface to match the actual data structure
interface Directeur {
  id?: number;
  idDirecteur?: number;
  nom?: string;
  nomDirecteur?: string;
  prenom?: string;
  prenomDirecteur?: string;
  date_debut?: string;
  date_fin?: string;
}


// Update the state variables with proper types
const directeursList = ref<Directeur[]>([]);
const loadingDirecteurs = ref<boolean>(false);
const activeDropdown = ref<string | null>(null);

// For consulter modal
const directeursListConsulter = ref<Directeur[]>([]);
const loadingDirecteursConsulter = ref<boolean>(false);
const activeDropdownConsulter = ref<string | null>(null);

// PAQ file viewing
// const loadingDocumentId = ref<number | null>(null);



// --- Function to open the consulter popup and fetch data ---
async function onConsulterFunction(entityKey: string) {
  // Close ajouter modal if open
  contextAjouter.value.visible = false;
  
  const config = contextConsulterEntityConfig[entityKey as keyof typeof contextConsulterEntityConfig];
  if (!config) {
    showToast(`Consulter config manquante pour: ${entityKey}`, 'error');
    return;
  }

  // Check if the entity is 'direction_projet' and if a project is selected
if (entityKey === 'direction_projet') {
  if (!selectedProjets.value.length) {
    showToast("Veuillez d'abord sélectionner un projet.", 'error');
    return;
  }
  contextConsulter.value.visible = true;
  contextConsulter.value.loading = true;
  contextConsulter.value.error = '';
  contextConsulter.value.entityKey = entityKey;
  contextConsulter.value.entityLabel = config.label;
  contextConsulter.value.columns = config.columns;
  contextConsulter.value.columnKeys = config.columnKeys;
  contextConsulter.value.data = [];

  try {
    const code = selectedProjets.value[0].code;
    const { data } = await axiosInstance.get((config.endpoint as ProjetEndpoint)(encodeURIComponent(code)));
    let rows = Array.isArray(data) ? data : [data];
    contextConsulter.value.data = rows;
  } catch (e) {
    contextConsulter.value.error = "Erreur lors du chargement des données.";
    contextConsulter.value.data = [];
  } finally {
    contextConsulter.value.loading = false;
  }
} else if (entityKey === 'paq') {
  // PAQ doesn't require product selection - it shows all PAQs from bibliotheque
  contextConsulter.value.visible = true;
  contextConsulter.value.loading = true;
  contextConsulter.value.error = '';
  contextConsulter.value.entityKey = entityKey;
  contextConsulter.value.entityLabel = config.label;
  contextConsulter.value.columns = config.columns;
  contextConsulter.value.columnKeys = config.columnKeys;
  contextConsulter.value.data = [];

  try {
    const { data } = await axiosInstance.get((config.endpoint as any)());
    let rows = Array.isArray(data) ? data : [data];
    contextConsulter.value.data = rows;
  } catch (e) {
    contextConsulter.value.error = "Erreur lors du chargement des données.";
    contextConsulter.value.data = [];
  } finally {
    contextConsulter.value.loading = false;
  }
} else {
  // The rest of your code for other entities...

    if (!selectedProduitId.value) {
      showToast("Veuillez d'abord sélectionner un produit.", 'error');
      return;
    }
    contextConsulter.value.visible = true;
    contextConsulter.value.loading = true;
    contextConsulter.value.error = '';
    contextConsulter.value.entityKey = entityKey;
    contextConsulter.value.entityLabel = config.label;
    contextConsulter.value.columns = config.columns;
    contextConsulter.value.columnKeys = config.columnKeys;
    contextConsulter.value.data = [];

    try {
      const { data } = await axiosInstance.get((config.endpoint as ProduitEndpoint)(selectedProduitId.value));
      let rows = Array.isArray(data) ? data : [data];
      contextConsulter.value.data = rows;
    } catch (e) {
      contextConsulter.value.error = "Erreur lors du chargement des données.";
      contextConsulter.value.data = [];
    } finally {
      contextConsulter.value.loading = false;
    }
  }
}


// --- Function to close popup ---
function closeContextConsulterModal() {
  contextConsulter.value.visible = false;
  contextConsulterSearchQuery.value = '';
}

// PAQ file viewing function
// async function viewPAQFile(paqId: number) {
//   const documentId = `paq_${paqId}`;
//   const loadingViewDocument = ref<{ [key: string]: boolean }>({});
//   loadingViewDocument.value[documentId] = true;
//   showToast('Veuillez patienter, le document PAQ se charge...', 'success');
  
//   // Create abort controller for this document
//   const abortController = new AbortController();
//   const documentAbortControllers = ref<{ [key: string]: AbortController }>({});
//   documentAbortControllers.value[documentId] = abortController;
  
//   try {
//     const response = await axiosInstance.get(`paqs/${paqId}/view-file/`, {
//       signal: abortController.signal,
//       responseType: 'blob'
//     });
    
//     const blob = new Blob([response.data], { type: 'application/pdf' });
//     const url = URL.createObjectURL(blob);
    
//     selectedDocument.value = {
//       idDocument: paqId,
//       fichier: url,
//       detectedType: 'pdf'
//     };
//   } catch (error: any) {
//     if (error.name === 'AbortError') {
//       console.log('PAQ document loading cancelled');
//     } else {
//       console.error('Erreur lors du chargement du fichier PAQ:', error);
//       showToast('Erreur lors du chargement du fichier PAQ', 'error');
//     }
//   } finally {
//     delete loadingViewDocument.value[documentId];
//     delete documentAbortControllers.value[documentId];
//   }
// }

// Helper function to get unique document ID for entity
function getEntityDocumentId(entityKey: string, item: any): string {
  switch (entityKey) {
    case 'fournisseur':
      return `${entityKey}_${item.idFournisseur}`;
    case 'maitre_oeuvre':
      return `${entityKey}_${item.idMaitreOeuvre}`;
    case 'maitre_ouvrage':
      return `${entityKey}_${item.idMaitreOuvrage}`;
    case 'soustraitants_tvx':
      return `${entityKey}_${item.idSoustraitants}`;
    case 'bet_soustraitants_etudes':
      return `${entityKey}_${item.idBET}`;
    case 'projet':
      return `${entityKey}_${item.code}`;
    default:
      return `${entityKey}_${item.id || 'unknown'}`;
  }
}

// Function to cancel entity document view
function cancelEntityDocumentView(entityKey: string, item: any) {
  const documentId = getEntityDocumentId(entityKey, item);
  const documentAbortControllers = ref<{ [key: string]: AbortController }>({});
  const loadingViewDocument = ref<{ [key: string]: boolean }>({});
  const controller = documentAbortControllers.value[documentId];
  if (controller) {
    controller.abort();
    delete documentAbortControllers.value[documentId];
    
    delete loadingViewDocument.value[documentId];
  }
}

// Function to cancel PAQ document view
// function cancelPAQDocumentView(paqId: number) {
//   const documentId = `paq_${paqId}`;
// const controller = (documentAbortControllers.value as any)[documentId];
//   if (controller) {
//     controller.abort();
//     delete (documentAbortControllers.value as any)[documentId];
//     delete (loadingViewDocument.value as any)[documentId];
//   }
// }
  

// Entity document viewing function
async function viewEntityDocument(entityKey: string, item: any) {
  if (!item.nomFichier) {
    showToast('Aucun fichier disponible', 'error');
    return;
  }
  
  const documentId = getEntityDocumentId(entityKey, item);
  (loadingViewDocument.value as any)[documentId] = true;
  showToast('Veuillez patienter, le document se charge...', 'success');
  
  // Create abort controller for this document
  const abortController = new AbortController();
  (documentAbortControllers.value as any)[documentId] = abortController;
  
  try {
    let endpoint = '';
    
    // Map entity keys to their API endpoints using the new URL patterns
    switch (entityKey) {
      case 'fournisseur':
        endpoint = `fournisseurs/${item.idFournisseur}/view-file/`;
        break;
      case 'maitre_oeuvre':
        endpoint = `maitres-oeuvre/${item.idMaitreOeuvre}/view-file/`;
        break;
      case 'maitre_ouvrage':
        endpoint = `maitres-ouvrage/${item.idMaitreOuvrage}/view-file/`;
        break;
      case 'soustraitants_tvx':
        endpoint = `soustraitants/${item.idSoustraitants}/view-file/`;
        break;
      case 'bet_soustraitants_etudes':
        endpoint = `bureaux-etudes/${item.idBET}/view-file/`;
        break;
      case 'projet':
        endpoint = `projets/${item.code}/view-file/`;
        break;
      case 'direction_projet':
        endpoint = `directions-projets/${item.idDirecteur}/view-file/`;
        break;
      default:
        showToast('Type d\'entité non supporté', 'error');
        return;
    }

    const response = await axiosInstance.get(endpoint, {
      signal: abortController.signal,
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    selectedDocument.value = {
      idDocument: parseInt(documentId.split('_')[1]),
      fichier: url,
      detectedType: 'pdf'
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Entity document loading cancelled');
    } else {
      console.error('Erreur lors du chargement du fichier:', error);
      showToast('Erreur lors du chargement du fichier', 'error');
    }
  } finally {
    delete (loadingViewDocument.value as any)[documentId];
    delete (documentAbortControllers.value as any)[documentId];
  }
}

const contextDelete = ref({
  visible: false,
  loading: false,
  error: '',
  entityKey: '',
  entityLabel: '',
  columns: [] as string[],
  columnKeys: [] as string[],
  idCol: '',
  data: [] as any[],
  confirmItem: null as null | any,
});

// Map endpoints & request payload for DELETE per entity
// Map endpoints & request payload for DELETE per entity
const contextEntityDeleteConfig = {
  projet: {
    endpoint: '/contexte-projet/',
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, code: String(item.code) }),
  },
  maitre_oeuvre: {
    endpoint: '/contexte-moe/',
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idMoe: item.idMaitreOeuvre }),
  },
  maitre_ouvrage: {
    endpoint: '/contexte-moa/',
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idMoa: item.idMaitreOuvrage }),
  },
  soustraitants_tvx: {
    endpoint: '/contexte-soustraitant/',
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idSoustraitant: item.idSoustraitants }),
  },
  fournisseur: {
    endpoint: '/contexte-fournisseur/',
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idFournisseur: item.idFournisseur }),
  },
  bet_soustraitants_etudes: {
    endpoint: '/contexte-bureau-etude/',
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idBET: item.idBET }),
  }
}; 
// const endpoints = {
//   bureau_etude: {
//     endpoint: '/projets-bet/',
//     getPayload: (item: any) => ({
//       selectedProduitId: selectedProduitId.value,
//       idBET: item.idBET
//     }),
//   },
//   direction_projet: {
//     endpoint: '/projets-directeurs/',
//     getPayload: (item: any) => ({
//       code: String(selectedProjets.value[0]?.code),
//       idDirecteur: item.idDirecteur
//     }),
//   }
// };


// Helper: check column key by 'columns' header for confirm table
// Helper: check column key by 'columns' header for confirm table
function getColKeyByHeader(header: string) {
  const idx = contextDelete.value.columns.indexOf(header);
  return idx !== -1 ? contextDelete.value.columnKeys[idx] : header;
}


// Context entities list for UI
const contextEntities = [
  { key: "projet", label: "Projet" },
  { key: "maitre_ouvrage", label: "Maîtres d'Ouvrage" },
  { key: "maitre_oeuvre", label: "Maîtres d'Œuvre(BCS)" },
  { key: "soustraitants_tvx", label: "Sous-traitants de Travaux" },
  { key: "fournisseur", label: "Fournisseur" },
  { key: "bet_soustraitants_etudes", label: "BET Sous-traitants" },
  { key: "direction_projet", label: "Direction du Projet" },
  // { key: "paq", label: "PAQ" }
];
// MODAL STATE FOR CONTEXTE "AJOUTER"
const contextAjouter = ref({
  visible: false,
  entityKey: '',
  entityLabel: '',
  all: [] as any[],
  selected: [] as any[],
  columns: [] as string[],
  columnKeys: [] as string[],
  idCol: '',
});

// New date modal for Direction Projet
const dateModal = ref({
  visible: false,
  directeur: null as any,
  date_debut: null as string | null,
  date_fin: null as string | null
})


// Function to open date modal for Direction Projet
function openDateModal(directeur: any) {
  dateModal.value.visible = true;
  dateModal.value.directeur = directeur;
  dateModal.value.date_debut = null;
  dateModal.value.date_fin = null;
}

// Function to close date modal
function closeDateModal() {
  dateModal.value.visible = false;
}
// Function to add Direction Projet with dates
async function addDirectionProjet() {
  if (!selectedProjets.value.length || !dateModal.value.directeur) {
    showToast("Veuillez sélectionner un projet et un directeur", 'error');
    return;
  }

  try {
    const payload = {
      code: String(selectedProjets.value[0].code),
      idDirecteur: dateModal.value.directeur.idDirecteur,
      date_debut: dateModal.value.date_debut,
      date_fin: dateModal.value.date_fin
    };

    await axiosInstance.post('/projets-directeurs/', payload);
    
    // Add to selected list
    const directeur = dateModal.value.directeur;
    if (!isAlreadySelected('direction_projet', directeur)) {
      selectedDirectionsProjets.value.push(directeur);
      contextAjouter.value.selected = [...selectedDirectionsProjets.value];
    }
    
    closeDateModal();
    showToast("Directeur ajouté avec succès!", 'success');
  } catch (e) {
    showToast("Erreur lors de l'ajout du directeur au projet", 'error');
  }
}




const contextSelectedEntitiesApi: Record<string, ProduitEndpoint | ProjetEndpoint> = {
  projet: ((produitId: number) => `projets/by-produit/${produitId}`) as ProduitEndpoint,
  maitre_ouvrage: ((produitId: number) => `moa/by-produit/${produitId}`) as ProduitEndpoint,
  maitre_oeuvre: ((produitId: number) => `moe/by-produit/${produitId}`) as ProduitEndpoint,
  fournisseur: ((produitId: number) => `fournisseur/by-produit/${produitId}`) as ProduitEndpoint,
  soustraitants_tvx: ((produitId: number) => `soustraitants/by-produit/${produitId}`) as ProduitEndpoint,
  bet_soustraitants_etudes: ((produitId: number) => `bet/by-produit/${produitId}`) as ProduitEndpoint,
  direction_projet: ((projetCode: string) => `directeurs-by-projet/${encodeURIComponent(projetCode)}`) as ProjetEndpoint,
};

// Helper: returns which param is needed per entity
function getSelectedApiParam(entityKey: string): { produit?: number; projet?: string } {
  if (entityKey === 'direction_projet') {
    const code = selectedProjets.value[0]?.code;
    return { projet: code };
  }
  return { produit: typeof selectedProduitId.value === 'number' ? selectedProduitId.value : undefined };
}

// Modify the onAjouter function
async function onAjouter(entityKey: string) {
  // Clear all sidebar content when opening ajouter
 // clearAllSidebarContent();
  
  // Close consulter modal if open
  contextConsulter.value.visible = false;
  
  const config = contextEntitiesConfig[entityKey as keyof typeof contextEntitiesConfig];
  if (!config) {
    showToast(`Config manquante pour: ${entityKey}`, 'error');
    return;
  }
  contextAjouter.value.entityKey = entityKey;
  contextAjouter.value.entityLabel = config.label;
  contextAjouter.value.idCol = config.idCol;
  contextAjouter.value.columns = config.columns;
  contextAjouter.value.columnKeys = config.columnKeys;

  // Fetch all possible items for right-table
  const originalListRef = entityKey === 'fournisseur' ? fournisseursList :
                         entityKey === 'maitre_ouvrage' ? maitresOuvrageList :
                         entityKey === 'maitre_oeuvre' ? maitresOeuvreList :
                         entityKey === 'soustraitants_tvx' ? soustraitantsList :
                         entityKey === 'bet_soustraitants_etudes' ? bureauxEtudesList :
                         config.listRef;
  
  if (originalListRef.value.length === 0) {
    try {
      const { data } = await axiosInstance.get(config.api);
      // Sort the data alphabetically based on the primary display field
      let sortedData = data;
      if (entityKey === 'projet') {
        sortedData = data.sort((a: any, b: any) => (a.code || '').toString().toLowerCase().localeCompare((b.code || '').toString().toLowerCase()));
      } else if (entityKey === 'fournisseur') {
        sortedData = data.sort((a: any, b: any) => (a.designationFournisseur || '').toString().toLowerCase().localeCompare((b.designationFournisseur || '').toString().toLowerCase()));
      } else if (entityKey === 'maitre_ouvrage') {
        sortedData = data.sort((a: any, b: any) => (a.designationMOg || '').toString().toLowerCase().localeCompare((b.designationMOg || '').toString().toLowerCase()));
      } else if (entityKey === 'maitre_oeuvre') {
        sortedData = data.sort((a: any, b: any) => (a.designationMO || '').toString().toLowerCase().localeCompare((b.designationMO || '').toString().toLowerCase()));
      } else if (entityKey === 'soustraitants_tvx') {
        sortedData = data.sort((a: any, b: any) => (a.designationStt || '').toString().toLowerCase().localeCompare((b.designationStt || '').toString().toLowerCase()));
      } else if (entityKey === 'bet_soustraitants_etudes') {
        sortedData = data.sort((a: any, b: any) => (a.nom || '').toString().toLowerCase().localeCompare((b.nom || '').toString().toLowerCase()));
      } else if (entityKey === 'direction_projet') {
        sortedData = data.sort((a: any, b: any) => (a.nomPrenomDirecteur || '').toString().toLowerCase().localeCompare((b.nomPrenomDirecteur || '').toString().toLowerCase()));
      }
      originalListRef.value = sortedData;
    } catch (e) {
      showToast("Erreur lors du chargement des " + config.label, 'error');
      contextAjouter.value.visible = false;
      return;
    }
  }
  // Use filtered list (excludes deleted items) for display
  const filteredListRef = entityKey === 'fournisseur' ? filteredFournisseurs :
                         entityKey === 'maitre_ouvrage' ? filteredMaitresOuvrage :
                         entityKey === 'maitre_oeuvre' ? filteredMaitresOeuvre :
                         entityKey === 'soustraitants_tvx' ? filteredSoustraitants :
                         entityKey === 'bet_soustraitants_etudes' ? filteredBureauxEtudes :
                         config.listRef;
  contextAjouter.value.all = filteredListRef.value;

  // Fetch already selected items from backend for left-table
  let selectedList: any[] = [];
  try {
    const selectedApi = contextSelectedEntitiesApi[entityKey as keyof typeof contextSelectedEntitiesApi];
    const { produit, projet } = getSelectedApiParam(entityKey);
    if (!selectedApi || (produit === undefined && projet === undefined)) {
      contextAjouter.value.selected = [];
    } else {
      const url = produit !== undefined 
    ? (selectedApi as ProduitEndpoint)(produit) 
    : (selectedApi as ProjetEndpoint)(projet as string);
      const { data } = await axiosInstance.get(url);
      selectedList = Array.isArray(data) ? data : [data];
      selectedList = selectedList.filter(x => typeof x === 'object' && x != null);
      console.log('Selected items with hasFichier:', selectedList);
    }
  } catch (e) {
    selectedList = [];
  }
  // Single-select: keep at most 1
  if (!config.allowMultiple && selectedList.length > 1) {
    selectedList = [selectedList[0]];
  }
  // Multi-select: dedupe by idCol
  if (config.allowMultiple && selectedList.length > 0) {
    const unique: Record<string, any> = {};
    for (const item of selectedList)
      unique[String(item[config.idCol])] = item;
    selectedList = Object.values(unique);
  }
  // For direction_projet, check if a project is selected
  if (entityKey === 'direction_projet' && !selectedProjets.value.length) {
    showToast("Veuillez d'abord sélectionner un projet", 'error');
    return;
  }
  config.selectedRef.value = selectedList;
  contextAjouter.value.selected = [...selectedList];
  
  // Merge hasFichier property from selected items into all items
  contextAjouter.value.all = contextAjouter.value.all.map(item => {
    const selectedItem = selectedList.find(selected => selected[config.idCol] === item[config.idCol]);
    return {
      ...item,
      hasFichier: selectedItem?.hasFichier || false
    };
  });
  
  contextAjouter.value.visible = true;
}


// Add: In addToSelected(), block adding if !allowMultiple && already has 1
// Modify the addToSelected function
// Modify the addToSelected function

async function addToSelected(entityKey: string, item: any) {
  const config = contextEntitiesConfig[entityKey as keyof typeof contextEntitiesConfig];
  if (!config) return;
  if (!config.allowMultiple && config.selectedRef.value.length >= 1) return;
  if (!isAlreadySelected(entityKey, item)) {
    try {
      let payload = {};
      let endpoint = '';

      switch (entityKey) {
        case 'maitre_ouvrage':
          endpoint = 'contexte-moa';
          payload = { idProduit: selectedProduitId.value, idMaitreOuvrage: item.idMaitreOuvrage };
          break;
        case 'maitre_oeuvre':
          endpoint = 'contexte-moe';
          payload = { idProduit: selectedProduitId.value, idMaitreOeuvre: item.idMaitreOeuvre };
          break;
       case 'soustraitants_tvx':
  endpoint = 'contexte-soustraitant';
  payload = { 
    idProduit: selectedProduitId.value, 
    idSoustraitant: item.idSoustraitants // Use the correct property name
  };
  break;


        case 'fournisseur':
          endpoint = 'contexte-fournisseur';
          payload = { idProduit: selectedProduitId.value, idFournisseur: item.idFournisseur };
          break;
        case 'bet_soustraitants_etudes':
          endpoint = 'contexte-bureau-etude';
          payload = { idProduit: selectedProduitId.value, idBET: item.idBET };
          break;
        case 'direction_projet':
          endpoint = 'projets-directeurs';
          payload = {
            code: String(selectedProjets.value[0]?.code),
            idDirecteurs: item.idDirecteur,
            date_debut: null,
            date_fin: null,
          };
          break;
        default:
          endpoint = `contexte-${entityKey}`;
          payload = { idProduit: selectedProduitId.value, [config.idCol]: item[config.idCol] };
      }

      await axiosInstance.post(`/${endpoint}/`, payload);
      config.selectedRef.value.push(item);
      contextAjouter.value.selected = [...config.selectedRef.value];
    } catch (e) {
      showToast("Erreur lors de l'ajout de l'entité.", 'error');
    }
  }
}




// Remove from user's selection
// Modify the removeFromSelected function

async function removeFromSelected(entityKey: string, item: any) {
  const config = contextEntitiesConfig[entityKey as keyof typeof contextEntitiesConfig];
  if (!config) return;
  try {
    let payload = {};
    let endpoint = '';

    switch (entityKey) {
      case 'maitre_ouvrage':
        endpoint = 'contexte-moa';
        payload = { idProduit: selectedProduitId.value, idMaitreOuvrage: item.idMaitreOuvrage };
        break;
      case 'maitre_oeuvre':
        endpoint = 'contexte-moe';
        payload = { idProduit: selectedProduitId.value, idMaitreOeuvre: item.idMaitreOeuvre };
        break;
    case 'soustraitants_tvx':
  endpoint = 'contexte-soustraitant';
  payload = { 
    idProduit: selectedProduitId.value, 
    idSoustraitant: item.idSoustraitants // Use the correct property name
  };
  break;


      case 'fournisseur':
        endpoint = 'contexte-fournisseur';
        payload = { idProduit: selectedProduitId.value, idFournisseur: item.idFournisseur };
        break;
      case 'bet_soustraitants_etudes':
        endpoint = 'contexte-bureau-etude';
        payload = { idProduit: selectedProduitId.value, idBET: item.idBET };
        break;
      case 'direction_projet':
        endpoint = 'projets-directeurs';
        payload = {
          code: String(selectedProjets.value[0]?.code),
          idDirecteurs: item.idDirecteur,
        };
        break;
      default:
        endpoint = `contexte-${entityKey}`;
        payload = { idProduit: selectedProduitId.value, [config.idCol]: item[config.idCol] };
    }

    await axiosInstance.delete(`/${endpoint}/`, { data: payload });
    config.selectedRef.value = config.selectedRef.value.filter(
      (i: any) => i[config.idCol] !== item[config.idCol]
    );
    contextAjouter.value.selected = [...config.selectedRef.value];
  } catch (e) {
    showToast("Erreur lors de la suppression de l'entité.", 'error');
  }
}






// Add a new modal for adding directors
const directeurModal = ref({
  visible: false,
  entityKey: '',
  entityLabel: '',
  idEntity: null,
  nom: '',
  prenom: '',
  date_debut: null,
  date_fin: null,
})

// Function to open the director modal
function openDirecteurModal(item: any) {
  directeurModal.value.visible = true;
  directeurModal.value.entityKey = contextAjouter.value.entityKey;
  directeurModal.value.idEntity = item[contextAjouter.value.idCol];
}


// Function to close the director modal
function closeDirecteurModal() {
  directeurModal.value.visible = false;
  directeurModal.value.nom = '';
  directeurModal.value.prenom = '';
  directeurModal.value.date_debut = null;
  directeurModal.value.date_fin = null;
}

// Function to add a director
// Function to add a director
async function addDirecteur() {
  try {
    let payload = {};
    let endpoint = '';

    // Determine the payload and endpoint based on the entity type
    switch (directeurModal.value.entityKey) {
      case 'maitre_ouvrage':
        payload = {
          idProduit: selectedProduitId.value,
          idMaitreOuvrage: directeurModal.value.idEntity,
          nom: directeurModal.value.nom,
          prenom: directeurModal.value.prenom,
          date_debut: directeurModal.value.date_debut,
          date_fin: directeurModal.value.date_fin,
        };
        endpoint = 'contexte-moa/add-directeur';
        break;
      case 'maitre_oeuvre':
        payload = {
          idProduit: selectedProduitId.value,
          idMaitreOeuvre: directeurModal.value.idEntity,
          nom: directeurModal.value.nom,
          prenom: directeurModal.value.prenom,
          date_debut: directeurModal.value.date_debut,
          date_fin: directeurModal.value.date_fin,
        };
        endpoint = 'contexte-moe/add-directeur';
        break;


 case 'bet_soustraitants_etudes':
        payload = {
          idProduit: selectedProduitId.value,
          idBET: directeurModal.value.idEntity,
          nom: directeurModal.value.nom,
          prenom: directeurModal.value.prenom,
          date_debut: directeurModal.value.date_debut,
          date_fin: directeurModal.value.date_fin,
        };
        endpoint = 'contexte-bet/add-directeur';
        break;



      case 'direction_projet':
        payload = {
          code: String(selectedProjets.value[0]?.code),
          idDirecteurs: directeurModal.value.idEntity,
          date_debut: directeurModal.value.date_debut,
          date_fin: directeurModal.value.date_fin,
        };
        endpoint = 'projets-directeurs';
        break;
      default:
        showToast("Type d'entité non pris en charge pour l'ajout d'un directeur.", 'error');
        return;
    }

    await axiosInstance.post(`/${endpoint}/`, payload);
    showToast("Directeur ajouté avec succès !", 'success');
    closeDirecteurModal();
  } catch (e) {
    showToast("Erreur lors de l'ajout du directeur.", 'error');
  }
}





















// Utility to bulk-create context links for entity


// Update your saveSelectedContextEntities to call the above function
function closeContextAjouterModal() {
  contextAjouter.value.visible = false
  contextAjouterSearchQuery.value = ''
}



// Prevent double-adding
// Function to check if an item is already selected
function isAlreadySelected(entityKey: string, item: any) {
  const config = contextEntitiesConfig[entityKey as keyof typeof contextEntitiesConfig];
  if (!config) return false;
  return config.selectedRef.value.some((i: any) => i[config.idCol] === item[config.idCol]);
}

// Save user's selection (and close modal)
// Simplify the saveSelectedContextEntities function
// function saveSelectedContextEntities() {
//   alert("Les entités sont enregistrées automatiquement.");
//   closeContextAjouterModal();
// }

// async function onSupprimer(entityKey: string) {
//   const entityDef = contextConsulterEntityConfig[entityKey as keyof typeof contextConsulterEntityConfig];
//   const entityDeleteDef = contextEntityDeleteConfig[entityKey as keyof typeof contextEntityDeleteConfig];

  
//   if (!entityDef || !entityDeleteDef) {
//     alert('Suppression non supportée pour cette entité: ' + entityKey);
//     return;
//   }

  
//   if (entityKey !== 'direction_projet' && (selectedProduitId.value === null || selectedProduitId.value === undefined)) {
//     alert("Veuillez d'abord sélectionner un produit.");
//     return;
//   }

  
//   contextDelete.value.entityKey = entityKey;
//   contextDelete.value.entityLabel = entityDef.label;
//   contextDelete.value.columns = entityDef.columns;
//   contextDelete.value.columnKeys = entityDef.columnKeys;
//   contextDelete.value.idCol = entityDef.columnKeys[0];
//   contextDelete.value.data = [];
//   contextDelete.value.error = '';
//   contextDelete.value.loading = true;
//   contextDelete.value.visible = true;
//   contextDelete.value.confirmItem = null;

//   try {
//     let rows: any[] = [];

    
//     if (entityKey === 'direction_projet') {
//       if (!selectedProjets.value.length) {
//         throw new Error('Sélectionnez un projet avant');
//       }

//       const idProjet = selectedProjets.value[0].idProjet;
//       const res = await axios.get(`directeurs-by-projet/${idProjet}`);
//       rows = Array.isArray(res.data) ? res.data : [res.data];

//     } else {
      
//       const produitId = selectedProduitId.value!;
//       const res = await axios.get(entityDef.endpoint(produitId));
//       rows = Array.isArray(res.data) ? res.data : [res.data];
//     }

//     contextDelete.value.data = rows;

//   } catch (e: any) {
//     contextDelete.value.error = 'Erreur lors du chargement des données : ' + (e?.message || '');
//     contextDelete.value.data = [];
//   } finally {
//     contextDelete.value.loading = false;
//   }
// }


// open confirmation for an item
function askConfirmEntityDelete(item:any) {
  contextDelete.value.confirmItem = item;
}

// close modal
function closeContextDeleteModal() {
  contextDelete.value.visible = false;
  contextDelete.value.error = '';
  contextDelete.value.data = [];
  contextDelete.value.confirmItem = null;
}

// Actually call API to delete context entity row
async function performEntityDelete(item:any) {
  const entityKey = contextDelete.value.entityKey;
  const entityDeleteDef = contextEntityDeleteConfig[entityKey as keyof typeof contextEntityDeleteConfig];
  if (!entityDeleteDef) {
    alert('Suppression non supportée pour cette entité');
    return;
  }
  try {
    contextDelete.value.loading = true;
    await axiosInstance.post(`${entityDeleteDef.endpoint}`, entityDeleteDef.getPayload(item));
    contextDelete.value.confirmItem = null;
    // Remove from list in modal UI
    contextDelete.value.data = contextDelete.value.data.filter((row:any) => row[contextDelete.value.idCol] !== item[contextDelete.value.idCol]);
    showToast('Elément supprimé avec succès', 'success');
  } catch(e:any) {
    showToast('Erreur lors de la suppression: ' + (e?.message || ''), 'error');
  } finally {
    contextDelete.value.loading = false;
  }
}








// function openDocModal(mode: 'create'|'consult'|'delete') {
//   docModalMode.value = mode;
//   showDocModal.value = true;
//   fetchDocListForCurrentSelection();
// }

function closeDocModal() {
  showDocModal.value = false;
}

// Structure mode sidebar functions
function openStructureDocContent() {
  contextAjouter.value.visible = false; // Close context ajouter modal
  showSuccess.value = false; // Close success message if open
  showDeleteMode.value = false; // Close delete mode if open
  showMiseAJourMode.value = false; // Close mise à jour mode if open
  showImportDossierMode.value = false; // Close import dossier mode if open
  showValidationMode.value = false; // Close validation mode if open
  showConsulterPanel.value = false; // Close NEW consulter if open
  showStructureDocContent.value = true;
  showStructureConsulterContent.value = false; // Close consulter if open
  fetchDocListForCurrentSelection();
}

function closeStructureDocContent() {
  showStructureDocContent.value = false;
}

function closeStructureConsulterContent() {
  showStructureConsulterContent.value = false;
}

// SUCCESS MESSAGE FUNCTION
async function showSuccessMessage() {
  if (loadingConsulter.value) return; // Prevent multiple clicks
  
  loadingConsulter.value = true;
  showStructureDocContent.value = false; // Close ajouter content
  showDeleteMode.value = false; // Close delete mode
  showMiseAJourMode.value = false; // Close mise à jour mode
  showImportDossierMode.value = false; // Close import dossier mode
  showValidationMode.value = false; // Close validation mode
  showSuccess.value = true;
  
  // Create abort controller for this request
  consulterAbortController.value = new AbortController();
  
  try {
    await fetchDocListForCurrentSelection();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      showToast('Chargement annulé', 'error');
      showSuccess.value = false;
    } else {
      console.error('Error in showSuccessMessage:', error);
    }
  } finally {
    loadingConsulter.value = false;
    consulterAbortController.value = null;
  }
}

// MISE À JOUR MESSAGE FUNCTION
async function showMiseAJourMessage() {
  if (loadingConsulter.value) return; // Prevent multiple clicks
  
  loadingConsulter.value = true;
  showStructureDocContent.value = false; // Close ajouter content
  showSuccess.value = false; // Close consulter mode
  showDeleteMode.value = false; // Close delete mode
  showImportDossierMode.value = false; // Close import dossier mode
  showValidationMode.value = false; // Close validation mode
  showMiseAJourMode.value = true;
  
  // Create abort controller for this request
  consulterAbortController.value = new AbortController();
  
  try {
    await fetchDocListForCurrentSelection();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      showToast('Chargement annulé', 'error');
      showMiseAJourMode.value = false;
    } else {
      console.error('Error in showMiseAJourMessage:', error);
    }
  } finally {
    loadingConsulter.value = false;
    consulterAbortController.value = null;
  }
}

// IMPORT DOSSIER MESSAGE FUNCTION
async function showImportDossierMessage() {
  if (loadingConsulter.value) return; // Prevent multiple clicks
  
  loadingConsulter.value = true;
  showStructureDocContent.value = false; // Close ajouter content
  showSuccess.value = false; // Close consulter mode
  showDeleteMode.value = false; // Close delete mode
  showMiseAJourMode.value = false; // Close mise à jour mode
  showValidationMode.value = false; // Close validation mode
  showImportDossierMode.value = true;
  
  // Create abort controller for this request
  consulterAbortController.value = new AbortController();
  
  try {
    await fetchDocListForCurrentSelection();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      showToast('Chargement annulé', 'error');
      showImportDossierMode.value = false;
    } else {
      console.error('Error in showImportDossierMessage:', error);
    }
  } finally {
    loadingConsulter.value = false;
    consulterAbortController.value = null;
  }
}

// DELETE MESSAGE FUNCTION
async function showDeleteMessage() {
  if (loadingConsulter.value) return; // Prevent multiple clicks
  
  loadingConsulter.value = true;
  showStructureDocContent.value = false; // Close ajouter content
  showSuccess.value = false; // Close consulter mode
  showMiseAJourMode.value = false; // Close mise à jour mode
  showImportDossierMode.value = false; // Close import dossier mode
  showValidationMode.value = false; // Close validation mode
  showDeleteMode.value = true;
  
  // Create abort controller for this request
  consulterAbortController.value = new AbortController();
  
  try {
    await fetchDocListForCurrentSelection();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      showToast('Chargement annulé', 'error');
      showDeleteMode.value = false;
    } else {
      console.error('Error in showDeleteMessage:', error);
    }
  } finally {
    loadingConsulter.value = false;
    consulterAbortController.value = null;
  }
}

// VALIDATION MESSAGE FUNCTION
async function showValidationMessage() {
  if (loadingConsulter.value) return; // Prevent multiple clicks
  
  loadingConsulter.value = true;
  showStructureDocContent.value = false; // Close ajouter content
  showSuccess.value = false; // Close consulter mode
  showDeleteMode.value = false; // Close delete mode
  showMiseAJourMode.value = false; // Close mise à jour mode
  showImportDossierMode.value = false; // Close import dossier mode
  showValidationMode.value = true;
  
  // Create abort controller for this request
  consulterAbortController.value = new AbortController();
  
  try {
    await fetchDocListForCurrentSelection();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      showToast('Chargement annulé', 'error');
      showValidationMode.value = false;
    } else {
      console.error('Error in showValidationMessage:', error);
    }
  } finally {
    loadingConsulter.value = false;
    consulterAbortController.value = null;
  }
}

// Function to open validation confirmation modal
function openValidationModal(document: any) {
  documentToValidate.value = document;
  showValidationConfirmModal.value = true;
}

// Function to close validation modal
function closeValidationModal() {
  showValidationConfirmModal.value = false;
  documentToValidate.value = null;
  validatingDocument.value = false;
}

// Function to confirm validation
async function confirmValidation() {
  if (!documentToValidate.value || validatingDocument.value) return;
  
  validatingDocument.value = true;
  validatingDocuments.value[documentToValidate.value.idDocument] = true;
  
  try {
    await axiosInstance.put(`documents/create-two-file/${documentToValidate.value.idDocument}/`, {
      valide: true
    });
    
    showToast('Document validé avec succès!', 'success');
    
    // Refresh the document list
    await fetchDocListForCurrentSelection();
    
    closeValidationModal();
  } catch (error: any) {
    console.error('Error validating document:', error);
    showToast('Erreur lors de la validation du document', 'error');
  } finally {
    validatingDocument.value = false;
    if (documentToValidate.value) {
      delete validatingDocuments.value[documentToValidate.value.idDocument];
    }
  }
}

// CANCEL CONSULTER FUNCTION
function cancelConsulter() {
  if (consulterAbortController.value) {
    consulterAbortController.value.abort();
    consulterAbortController.value = null;
  }
  loadingConsulter.value = false;
  showSuccess.value = false;
  showToast('Chargement annulé', 'error');
}


// async function loadConsulterDocs() {
//   console.log('Loading consulter docs');
//   if (!selectedTypeId.value || !selectedProduitId.value || !selectedStructureId.value || !selectedSectionId.value) {
//     console.log('Missing required IDs');
//     consulterDocList.value = [];
//     return;
//   }

//   consulterLoading.value = true;
//   consulterError.value = '';
//   try {
//     const params: Record<string, string | number> = {
//       idTypeProduit: selectedTypeId.value,
//       idProduit: selectedProduitId.value,
//       idStructure: selectedStructureId.value,
//       idSection: selectedSectionId.value
//     };

//     if (selectedDivisionId.value) params.idSubDivisionNv_1 = selectedDivisionId.value;
//     if (requiresSubDiv2.value && selectedSubDiv2Id.value) {
//       params.idSubDivisionNv_2 = selectedSubDiv2Id.value;
//     }
//     if (requiresSubDiv2.value && selectedSubDiv3Id.value) {
//       params.idSubDivisionNv_3 = selectedSubDiv3Id.value;
//     }
//     if (requiresSubDiv2.value && selectedSubDiv4Id.value) {
//       params.idSubDivisionNv_4 = selectedSubDiv4Id.value;
//     }

//     console.log('Params:', params);
//     const { data } = await axios.get('documentsFilter/', { params });
//     console.log('API Response:', data);
//     consulterDocList.value = Array.isArray(data) ? data : [];
//     console.log('consulterDocList:', consulterDocList.value); // Add this line
//   } catch(e: any) {
//     console.error('Error loading consulter docs:', e);
//     consulterError.value = "Erreur lors du chargement des documents.";
//     consulterDocList.value = [];
//   } finally {
//     consulterLoading.value = false;
//   }
// }


// function openStructureConsulterContent() {
//   showStructureConsulterContent.value = true;
//   showStructureDocContent.value = false; // Close ajouter if open
//   fetchDocListForCurrentSelection();
// }

// function closeStructureConsulterContent() {
//   showStructureConsulterContent.value = false;
//   docModalError.value = '';
// }
async function handleDeleteDocument(document: any) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
  try {
    await axiosInstance.delete(`documents/${document.idDocument}`);
    showToast("Document supprimé !", 'success');
    fetchDocListForCurrentSelection();
  } catch (e) {
    showToast("Erreur lors de la suppression.", 'error');
  }
}

// State for delete confirmation modal
const showDeleteConfirmModal = ref(false);
const documentToDelete = ref<any>(null);
const deleteMode = ref<'full' | 'selective'>('full');
const filesToDelete = ref({
  fichier: false,
  plan: false,
  video: false,
  photos: false
});



const hasSelectedFiles = computed(() => {
  return filesToDelete.value.fichier || filesToDelete.value.plan || filesToDelete.value.video || filesToDelete.value.photos;
});

// Computed properties for delete modal






















// Open delete modal function
function openDeleteModal(document: any) {
  documentToDelete.value = document;
  showDeleteConfirmModal.value = true;
}



// Close delete modal
function closeDeleteModal() {
  showDeleteConfirmModal.value = false;
  documentToDelete.value = null;
}

// Confirm full delete
function confirmFullDelete() {
  // This function can be used for additional confirmation if needed
}

// Show selective delete mode
function showSelectiveDelete() {
  deleteMode.value = 'selective';
  // Reset file selection
  filesToDelete.value = {
    fichier: false,
    plan: false,
    video: false,
    photos: false
  };
}

// Execute full delete
async function executeFullDelete() {
  if (!documentToDelete.value) return;
  
  try {
    await axiosInstance.delete(`documents/${documentToDelete.value.idDocument}/`);
    showToast("Document supprimé avec succès!", 'success');
    await fetchDocListForCurrentSelection();
  } catch (e: any) {
    console.error('Error deleting document:', e);
    showToast("Erreur lors de la suppression du document.", 'error');
  } finally {
    closeDeleteModal();
  }
}

// Execute selective delete
async function executeSelectiveDelete() {
  if (!documentToDelete.value || !hasSelectedFiles.value) return;
  
  try {
    const formData = new FormData();
    
    // Set files to null for selected ones
    if (filesToDelete.value.fichier) {
      formData.append('fichier', 'null');
    }
    if (filesToDelete.value.plan) {
      formData.append('plan', 'null');
    }
    if (filesToDelete.value.video) {
      formData.append('video', 'null');
    }
    if (filesToDelete.value.photos) {
      formData.append('photos', 'null');
    }
    
    // Use the PUT endpoint to update the document
    await axiosInstance.put(`documents/create-two-file/${documentToDelete.value.idDocument}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    showToast("Fichiers retirés avec succès!", 'success');
    await fetchDocListForCurrentSelection();
  } catch (e: any) {
    console.error('Error removing files:', e);
    showToast("Erreur lors de la suppression des fichiers.", 'error');
  } finally {
    closeDeleteModal();
  }
}

async function viewDocument(document: Document, fileType: 'fichier' | 'video' | 'photos' = 'fichier') {
  if (loadingViewDocument.value[document.idDocument]) return
  
  loadingViewDocument.value[document.idDocument] = true
  showToast('Veuillez patienter, le document se charge...', 'success')
  
  // Log the consult action
  await logUserAction(document.idDocument, LOG_ACTIONS.CONSULT_FILE)
  
  const abortController = new AbortController()
  documentAbortControllers.value[document.idDocument] = abortController
  
  try {
    if (fileType === 'video' && document.video) {
      selectedDocument.value = {
        ...document,
        fichier: document.video,
        detectedType: 'video'
      }
    } else if (fileType === 'photos') {
      // Use the specific API endpoint for photos
      const response = await axiosInstance.get(`documents/view-photos/${document.idDocument}/`, {
        signal: abortController.signal,
        responseType: 'blob'
      })
      
      if (abortController.signal.aborted) {
        throw new Error('Request was cancelled')
      }
      
      const blob = response.data
      const fileUrl = URL.createObjectURL(blob)
      
      selectedDocument.value = {
        ...document,
        fichier: fileUrl,
        detectedType: 'pdf'
      }
    } else {
      // For fichier, use the view-file endpoint
      const response = await fetch(`http://10.10.150.75:8000/api/documents/view-file/${document.idDocument}/`, {
        signal: abortController.signal
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const fileUrl = URL.createObjectURL(blob)
        
        // Detect file type from blob content-type
        let detectedType = 'pdf'
        if (blob.type.startsWith('image/')) {
          detectedType = 'image'
        }
        
        selectedDocument.value = {
          ...document,
          fichier: fileUrl,
          detectedType: detectedType
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message === 'Request was cancelled') {
      showToast('Chargement du document annulé', 'error')
    } else {
      console.error('Error loading document:', error)
      showToast('Erreur lors du chargement du document', 'error')
    }
  } finally {
    loadingViewDocument.value[document.idDocument] = false
    delete documentAbortControllers.value[document.idDocument]
  }
}

// Function to handle file downloads with permission checks
async function downloadFile(document: any, fileType: 'plan' | 'fichier' | 'video' | 'photos') {
  if (fileType === 'plan') {
    // Use the specific plan download function
    await downloadPlan(document)
    return
  }
  
  if ((fileType === 'fichier' || fileType === 'video' || fileType === 'photos') && !canDownload.value) {
    showToast('Vous n\'avez pas l\'autorisation de télécharger des fichiers', 'error')
    return
  }
  
  try {
    await logUserAction(document.idDocument, LOG_ACTIONS.DOWNLOAD_FILE)
    const a = document.createElement('a')
    a.href = `documents/download-${fileType}/${document.idDocument}/`
    a.download = `${fileType}_${document.idDocument}`
    a.click()
    showToast('Téléchargement démarré', 'success')
  } catch (error) {
    showToast('Erreur lors du téléchargement', 'error')
  }
}

// Download plan function (same as Documents.vue)
async function downloadPlan(doc: any) {
  if (!doc.plan || !canAccessPlans.value) {
    console.warn('Plan download not allowed: missing plan or insufficient permissions')
    showToast('Vous n\'avez pas l\'autorisation d\'accéder aux plans', 'error')
    return
  }
  
  try {
    // Log the download action
    await logUserAction(doc.idDocument, LOG_ACTIONS.DOWNLOAD_FILE)
    
    const response = await fetch(doc.plan)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `plan-${doc.idDocument}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    showToast('Téléchargement du plan démarré', 'success')
  } catch (error) {
    console.error('Plan download failed:', error)
    showToast('Erreur lors du téléchargement du plan', 'error')
  }
}





function cancelDocumentView(documentId: number) {
  const controller = documentAbortControllers.value[documentId]
  if (controller) {
    controller.abort()
    delete documentAbortControllers.value[documentId]
  }
  loadingViewDocument.value[documentId] = false
  showToast('Chargement du document annulé', 'error')
}

// Function to close document viewer
// Duplicate functions removed - keeping the ones at the end of the file

// ==== Context directors logic: string keys for TS safety ====
// Context mode variables
const mode = ref<'structure' | 'contexte' | ''>('')
const loadingContexteLists = ref(false)
const bureauxEtudesList = ref<any[]>([])
const fournisseursList = ref<any[]>([])
const maitresOeuvreList = ref<any[]>([])
const maitresOuvrageList = ref<any[]>([])
const soustraitantsList = ref<any[]>([])
const projetsList = ref<any[]>([])
const directionsProjetsList = ref<any[]>([])
const selectedBureauxEtudes = ref<any[]>([])
const selectedFournisseurs = ref<any[]>([])
const selectedMaitresOeuvre = ref<any[]>([])
const selectedMaitresOuvrage = ref<any[]>([])
const selectedSoustraitants = ref<any[]>([])
const selectedProjets = ref<any[]>([])
const selectedDirectionsProjets = ref<any[]>([])







// const projectDirectorsForm = ref<Record<string, {
//   selectedDirecteurs: any[],
//   dates: Record<string, { dateDebut: string, dateFin: string }>
// }>>({});


// const fetchDirectionsForProjet = async (idProjet: number) => {
//   const pid = String(idProjet)
//   try {
//     const res = await axios.get(`directions-projets/?projet=${idProjet}`)
//     directionsProjets.value[pid] = res.data
//   } catch {
//     directionsProjets.value[pid] = []
//   }
// }


// const handleProjectSelection = async () => {
//   for (const projet of selectedProjets.value) {
//     const pid = String(projet.idProjet)
//     if (!directionsProjets.value[pid]) {
//       await fetchDirectionsForProjet(projet.idProjet)
//     }
//     if (!projectDirectorsForm.value[pid]) {
//       projectDirectorsForm.value[pid] = {
//         selectedDirecteurs: [],
//         dates: {}
//       }
//     }
//   }
//   const selectedIds = selectedProjets.value.map((p: any) => String(p.idProjet))
//   for (const pid of Object.keys(projectDirectorsForm.value)) {
//     if (!selectedIds.includes(pid)) {
//       delete projectDirectorsForm.value[pid]
//     }
//   }
//   for (const pid of Object.keys(directionsProjets.value)) {
//     if (!selectedIds.includes(pid)) {
//       delete directionsProjets.value[pid]
//     }
//   }
// }



// watch(selectedProjets, { immediate: false })

const selectedBureauEtudeNoms = computed(() =>
  selectedBureauxEtudes.value.map(b => b.nom)
)
const selectedFournisseurNoms = computed(() =>
  selectedFournisseurs.value.map(f => f.designationFournisseur)
)
const selectedMaitreOeuvreNoms = computed(() =>
  selectedMaitresOeuvre.value.map(m => m.designationMO)
)
const selectedMaitreOuvrageNoms = computed(() =>
  selectedMaitresOuvrage.value.map(m => m.designationMOg)
)
const selectedSoustraitantNoms = computed(() =>
  selectedSoustraitants.value.map(s => s.designationStt)
)
const selectedProjetNoms = computed(() =>
  selectedProjets.value.map(p => `${p.code} / ${p.description}`)
)

// Computed properties to check if there are more items than displayed
const hasMoreProjets = ref(false)
const hasMoreBET = ref(false)
const hasMoreFournisseurs = ref(false)
const hasMoreMOE = ref(false)
const hasMoreMOA = ref(false)
const hasMoreSoustraitants = ref(false)
const hasMoreDirecteurs = ref(false)

// Arborescence collapsible state
const showArborescenceDetails = ref(false)

// Computed property to check if there are other details besides projects
const hasOtherDetails = computed(() => {
  return selectedBureauxEtudes.value.length > 0 ||
         selectedFournisseurs.value.length > 0 ||
         selectedMaitresOeuvre.value.length > 0 ||
         selectedMaitresOuvrage.value.length > 0 ||
         selectedSoustraitants.value.length > 0 ||
         selectedDirectionsProjets.value.length > 0
})

// Function to toggle arborescence details
function toggleArborescenceDetails() {
  showArborescenceDetails.value = !showArborescenceDetails.value
}



// Watch for mode changes
watch(mode, async (val) => {
  if (val === 'contexte') {
    loadingContexteLists.value = true;
    try {
      const [
        betRes,
        fourRes,
        moeurRes,
        mouvRes,
        sttRes,
        projetsRes,
        directionsRes
      ] = await Promise.all([
        axiosInstance.get(`bureaux-etudes/`),
        axiosInstance.get(`fournisseurs/`),
        axiosInstance.get(`maitres-oeuvre/`),
        axiosInstance.get(`maitres-ouvrage/`),
        axiosInstance.get(`soustraitants/`),
        axiosInstance.get(`projets/`),
        axiosInstance.get(`directions-projets/`)
      ]);
      bureauxEtudesList.value = betRes.data;
      fournisseursList.value = fourRes.data;
      maitresOeuvreList.value = moeurRes.data;
      maitresOuvrageList.value = mouvRes.data;
      soustraitantsList.value = sttRes.data;
      projetsList.value = projetsRes.data;
      directionsProjetsList.value = directionsRes.data;
      
      // Auto-load existing context data for arborescence
      await loadExistingContextData();
    } catch (e) {
      showToast("Erreur de chargement des listes de contexte.", 'error');
    } finally {
      loadingContexteLists.value = false;
    }
  }
})

// function consultDocument() {
//   alert('Consulter Document clicked!');
//   // Add logic to consult the document
// }

// function deleteDocument() {
//   if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
//     alert('Supprimer Document clicked!');
//     // Add logic to delete the document
//   }
// }


// Auto-load existing context data when entering context mode
async function loadExistingContextData() {
  if (!selectedProduitId.value) return;
  
  try {
    // Load existing context entities (limit to 3 items each)
    const contextPromises = [
      loadExistingEntity('projet', 'projets/by-produit/', selectedProjets),
      loadExistingEntity('fournisseur', 'fournisseur/by-produit/', selectedFournisseurs),
      loadExistingEntity('maitre_ouvrage', 'moa/by-produit/', selectedMaitresOuvrage),
      loadExistingEntity('maitre_oeuvre', 'moe/by-produit/', selectedMaitresOeuvre),
      loadExistingEntity('soustraitants_tvx', 'soustraitants/by-produit/', selectedSoustraitants),
      loadExistingEntity('bet_soustraitants_etudes', 'bet/by-produit/', selectedBureauxEtudes)
    ];
    
    await Promise.all(contextPromises);
    
    // Load direction projet if projet is selected
    if (selectedProjets.value.length > 0) {
      await loadExistingDirectionProjet();
    }
  } catch (e) {
    console.error('Error loading existing context data:', e);
  }
}

async function loadExistingEntity(entityKey: string, endpoint: string, targetRef: any) {
  try {
    const { data } = await axiosInstance.get(`${endpoint}${selectedProduitId.value}`);
    const items = Array.isArray(data) ? data : [data];
    const validItems = items.filter(item => item && typeof item === 'object');
    
    // Set "more" flags based on entity type
    switch (entityKey) {
      case 'projet':
        hasMoreProjets.value = validItems.length > 3;
        break;
      case 'bet_soustraitants_etudes':
        hasMoreBET.value = validItems.length > 3;
        break;
      case 'fournisseur':
        hasMoreFournisseurs.value = validItems.length > 3;
        break;
      case 'maitre_oeuvre':
        hasMoreMOE.value = validItems.length > 3;
        break;
      case 'maitre_ouvrage':
        hasMoreMOA.value = validItems.length > 3;
        break;
      case 'soustraitants_tvx':
        hasMoreSoustraitants.value = validItems.length > 3;
        break;
    }
    
    // Limit to 3 items for initial display
    targetRef.value = validItems.slice(0, 3);
  } catch (e) {
    targetRef.value = [];
  }
}

async function loadExistingDirectionProjet() {
  if (!selectedProjets.value.length) return;
  
  try {
    const code = selectedProjets.value[0].code;
    const { data } = await axiosInstance.get(`directeurs-by-projet/${encodeURIComponent(code)}`);
    const items = Array.isArray(data) ? data : [data];
    const validItems = items.filter(item => item && typeof item === 'object');
    
    hasMoreDirecteurs.value = validItems.length > 3;
    selectedDirectionsProjets.value = validItems.slice(0, 3);
  } catch (e) {
    selectedDirectionsProjets.value = [];
    hasMoreDirecteurs.value = false;
  }
}

// Context entities configuration
const contextEntitiesConfig = {
  projet: {
    label: 'Projet',
    api: '/projets/',
    idCol: 'code',
    columns: ['Code', 'Description'],
    columnKeys: ['code', 'description'],
    listRef: projetsList,
    selectedRef: selectedProjets,
    allowMultiple: false,
  },
  fournisseur: {
    label: 'Fournisseur',
    api: '/fournisseurs/',
    idCol: 'idFournisseur',
    columns: ['ID', 'Désignation', 'Description', 'Téléphone', 'Email'],
    columnKeys: ['idFournisseur', 'designationFournisseur', 'description', 'telephone', 'email'],
    listRef: fournisseursList,
    selectedRef: selectedFournisseurs,
    allowMultiple: true,
  },
  maitre_ouvrage: {
    label: "Maître d'Ouvrage",
    api: '/maitres-ouvrage/',
    idCol: 'idMaitreOuvrage',
    columns: ['ID', 'Désignation', 'Description', 'Email'],
    columnKeys: ['idMaitreOuvrage', 'designationMOg', 'description', 'email'],
    listRef: maitresOuvrageList,
    selectedRef: selectedMaitresOuvrage,
    allowMultiple: false,
  },
  maitre_oeuvre: {
    label: "Maître d'Œuvre",
    api: '/maitres-oeuvre/',
    idCol: 'idMaitreOeuvre',
    columns: ['ID', 'Désignation', 'Description', 'Email'],
    columnKeys: ['idMaitreOeuvre', 'designationMO', 'description', 'email'],
    listRef: maitresOeuvreList,
    selectedRef: selectedMaitresOeuvre,
    allowMultiple: false,
  },
  soustraitants_tvx: {
    label: "Soustraitants de Travaux",
    api: '/soustraitants/',
    idCol: 'idSoustraitants',
    columns: ['ID', 'Désignation', 'Description', 'Téléphone', 'Email'],
    columnKeys: ['idSoustraitants', 'designationStt', 'description', 'telephone', 'email'],
    listRef: soustraitantsList,
    selectedRef: selectedSoustraitants,
    allowMultiple: true,
  },
  bet_soustraitants_etudes: {
    label: "BET Soustraitants Études",
    api: '/bureaux-etudes/',
    idCol: 'idBET',
    columns: ['ID', 'Nom', 'Description', 'Téléphone', 'Email'],
    columnKeys: ['idBetSoustraitant', 'nom', 'description', 'telephone', 'email'],
    listRef: bureauxEtudesList,
    selectedRef: selectedBureauxEtudes,
    allowMultiple: true,
  },
  direction_projet: {
    label: "Direction du Projet",
    api: '/directions-projets/',
    idCol: 'idDirecteur',
    columns: ['ID', 'Nom', 'Fonction', 'Téléphone', 'Date debut', 'Date fin'],
    columnKeys: ['idDirecteur', 'nomPrenomDirecteur', 'fonction', 'telephone', 'date_deb', 'date_fin'],
    listRef: directionsProjetsList,
    selectedRef: selectedDirectionsProjets,
    allowMultiple: true,
  }
};

// Function to load directors for an entity in Ajouter modal
async function loadDirecteurs(entityKey: string, item: any) {
  const dropdownId = `${entityKey}-${item[contextAjouter.value.idCol]}`
  
  // Toggle dropdown
  if (activeDropdown.value === dropdownId) {
    activeDropdown.value = null
    return
  }
  
  activeDropdown.value = dropdownId
  loadingDirecteurs.value = true
  directeursList.value = []
  
  try {
    let endpoint = ''
    let params = {}
    
    switch (entityKey) {
      case 'maitre_ouvrage':
        endpoint = `contexte-moa/directeurs`
        params = { idProduit: selectedProduitId.value, idMaitreOuvrage: item.idMaitreOuvrage }
        break
      case 'maitre_oeuvre':
        endpoint = `contexte-moe/directeurs`
        params = { idProduit: selectedProduitId.value, idMaitreOeuvre: item.idMaitreOeuvre }
        break
      case 'bet_soustraitants_etudes':
        endpoint = `contexte-bet/directeurs`
        params = { idProduit: selectedProduitId.value, idBET: item.idBET }
        break
      default:
        throw new Error('Type d\'entité non supporté')
    }
    
    const { data } = await axiosInstance.post(`/${endpoint}/`, params)
    // Extract directors from the nested structure
    directeursList.value = data.directeurs || []
  } catch (error) {
    console.error('Erreur lors du chargement des directeurs', error)
    directeursList.value = []
  } finally {
    loadingDirecteurs.value = false
  }
}

// Function to load directors for an entity in Consulter modal
async function loadDirecteursConsulter(entityKey: string, item: any) {
  const dropdownId = `${entityKey}-${item[contextConsulter.value.columnKeys[0]]}`
  
  // Toggle dropdown
  if (activeDropdownConsulter.value === dropdownId) {
    activeDropdownConsulter.value = null
    return
  }
  
  activeDropdownConsulter.value = dropdownId
  loadingDirecteursConsulter.value = true
  directeursListConsulter.value = []
  
  try {
    let endpoint = ''
    let params = {}
    
    switch (entityKey) {
      case 'maitre_ouvrage':
        endpoint = `contexte-moa/directeurs`
        params = { idProduit: selectedProduitId.value, idMaitreOuvrage: item.idMaitreOuvrage }
        break
      case 'maitre_oeuvre':
        endpoint = `contexte-moe/directeurs`
        params = { idProduit: selectedProduitId.value, idMaitreOeuvre: item.idMaitreOeuvre }
        break
      case 'bet_soustraitants_etudes':
        endpoint = `contexte-bet/directeurs`
        params = { idProduit: selectedProduitId.value, idBET: item.idBET }
        break
      default:
        throw new Error('Type d\'entité non supporté')
    }
    
    const { data } = await axiosInstance.post(`/${endpoint}/`, params)
    // Extract directors from the nested structure
    directeursListConsulter.value = data.directeurs || []
  } catch (error) {
    console.error('Erreur lors du chargement des directeurs', error)
    directeursListConsulter.value = []
  } finally {
    loadingDirecteursConsulter.value = false
  }
}











function getEntityConfig(key: string) {
  return contextEntitiesConfig[key as keyof typeof contextEntitiesConfig];
}

function getFileType(document: any): string {
  // Use detected type if available
  if (document.detectedType) {
    return document.detectedType
  }
  
  if (!document.fichier) return 'pdf'
  
  const url = document.fichier.toLowerCase()
  if (url.includes('png') || url.includes('jpg') || url.includes('jpeg') || url.includes('gif')) return 'image'
  if (url.includes('mp4') || url.includes('mov') || url.includes('avi')) return 'video'
  return 'pdf'
}

// function getDocumentType(document: any): string {
//   if (!document.nomFichier) return 'Document'
  
//   const fileName = document.nomFichier.toLowerCase()
//   if (fileName.endsWith('.pdf')) return 'PDF'
//   if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif')) return 'Image'
//   if (fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.avi')) return 'Vidéo'
//   if (fileName.endsWith('.txt')) return 'Texte'
//   if (fileName.endsWith('.zip')) return 'Archive'
//   return 'Document'
// }







// Handle download action from viewer components
async function handleDownloadAction(documentId: number) {
  await logUserAction(documentId, LOG_ACTIONS.DOWNLOAD_FILE)
}

// Handle print action from viewer components
async function handlePrintAction(documentId: number) {
  await logUserAction(documentId, LOG_ACTIONS.PRINT_FILE)
}

function closeDocumentViewer() {
  if (selectedDocument.value?.fichier) {
    URL.revokeObjectURL(selectedDocument.value.fichier)
  }
  selectedDocument.value = null
}

// Helper function to clear all sidebar content and reset states
function clearAllSidebarContent() {
  // Close all modals and sidebar content
  showStructureDocContent.value = false
  showSuccess.value = false
  showDeleteMode.value = false
  showMiseAJourMode.value = false
  showImportDossierMode.value = false
  showValidationMode.value = false
  showConsulterPanel.value = false
  showStructureConsulterContent.value = false
  showDocModal.value = false
  showImportModal.value = false
  showImportPlanModal.value = false
  
  // Close context modals
  contextAjouter.value.visible = false
  contextConsulter.value.visible = false
  contextDelete.value.visible = false
  directeurModal.value.visible = false
  dateModal.value.visible = false
  
  // Clear document viewer
  if (selectedDocument.value) {
    closeDocumentViewer()
  }
  
  // Clear form data
  nonFichier.value = ''
  uploadedFile.value = null
  uploadedVideo.value = null
  graphicsFiles.value = []
  multipleImages.value = []
  showImageToPdfOption.value = false
  selectedPhotos.value = []
  importFiles.value = []
  importNomFichier.value = ''
  // Reset toggle states
  showPdfDetails.value = false
  showPlanDetails.value = false
  showVideoDetails.value = false
  showPhotosDetails.value = false
  
  // Clear document lists
  docList.value = []
  
  // Clear context selections
  selectedBureauxEtudes.value = []
  selectedFournisseurs.value = []
  selectedMaitresOeuvre.value = []
  selectedMaitresOuvrage.value = []
  selectedSoustraitants.value = []
  selectedProjets.value = []
  selectedDirectionsProjets.value = []
  
  // Reset dropdown states
  activeDropdown.value = null
  activeDropdownConsulter.value = null
  directeursList.value = []
  directeursListConsulter.value = []
  loadingDirecteurs.value = false
  loadingDirecteursConsulter.value = false
}

// Import Dossier Source functions
// function openImportModal() {
//   showImportModal.value = true
//   importFiles.value = []
//   importNomFichier.value = ''
// }

function closeImportModal() {
  showImportModal.value = false
  importFiles.value = []
  importNomFichier.value = ''
}

function addSingleFile(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    // Add the selected file to existing ones
    const newFile = files[0]
    importFiles.value = [...importFiles.value, newFile]
    // Clear the input so the same file can be selected again
    ;(e.target as HTMLInputElement).value = ''
  }
}

function removeImportFile(index: number) {
  importFiles.value.splice(index, 1)
}

// Import Plan functions
function openImportPlanModal(document: any) {
  documentToImportPlan.value = document
  showImportPlanModal.value = true
  planImportFiles.value = []
}

function closeImportPlanModal() {
  showImportPlanModal.value = false
  planImportFiles.value = []
  documentToImportPlan.value = null
  isUploadingPlan.value = false
}



async function submitPlanImport() {
  if (!planImportFiles.value.length || !documentToImportPlan.value) {
    showToast('Veuillez sélectionner des fichiers', 'error')
    return
  }
  
  isUploadingPlan.value = true
  
  try {
    const formData = new FormData()
    
    // Handle graphics files (zip them automatically) - similar to main form
    if (planImportFiles.value.length > 0) {
      let planFile: File;
      
      // If we have a single ZIP file, use it directly
      if (planImportFiles.value.length === 1 && planImportFiles.value[0].name.toLowerCase().endsWith('.zip')) {
        planFile = planImportFiles.value[0];
      } else {
        // Multiple files - create ZIP automatically
        const zip = new JSZip();
        
        // Add all files to ZIP
        for (const file of planImportFiles.value) {
          zip.file(file.name, file);
        }
        
        // Generate ZIP blob
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        planFile = new File([zipBlob], `plan-${documentToImportPlan.value.idDocument}.zip`, { type: 'application/zip' });
      }
      
      const truncatedPlanName = truncateFileName(planFile.name);
      formData.append('plan', planFile, truncatedPlanName);
    }
    
    // Use the PUT endpoint to update the document with the plan
    await axiosInstance.put(`documents/create-two-file/${documentToImportPlan.value.idDocument}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    showToast('Plan importé avec succès!', 'success')
    await fetchDocListForCurrentSelection()
    closeImportPlanModal()
  } catch (error: any) {
    console.error('Error importing plan:', error)
    showToast('Erreur lors de l\'importation du plan', 'error')
  } finally {
    isUploadingPlan.value = false
  }
}

async function createZipFile(files: File[], zipName: string): Promise<File> {
  // @ts-ignore
  const JSZip = (await import('jszip')).default
  // @ts-ignore
  const zip = new JSZip()
  
  // Add each file to the zip
  for (const file of files) {
    zip.file(file.name, file)
  }
  
  // Generate the zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  return new File([zipBlob], `${zipName}.zip`, { type: 'application/zip' })
}

// Functions for document update and move (from Documents.vue)
function confirmUpdate(document: any) {
  documentToUpdate.value = { ...document }
  selectedFile.value = null
  multipleImages.value = []
  showImageToPdfOption.value = false
  // Clear update modal file states
  selectedPdfFile.value = null
  selectedVideoFile.value = null
  selectedPlanFiles.value = []
  selectedUpdatePhotos.value = []
}

// Update modal file handling functions
function onPdfFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedPdfFile.value = target.files[0]
  }
}

function onVideoFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedVideoFile.value = target.files[0]
  }
}

function addPlanFile(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    const newFile = files[0]
    selectedPlanFiles.value = [...selectedPlanFiles.value, newFile]
    ;(e.target as HTMLInputElement).value = ''
  }
}

function removePlanFile(index: number) {
  selectedPlanFiles.value.splice(index, 1)
}

function onSinglePhotoUpdateChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      selectedUpdatePhotos.value.push(file)
      ;(e.target as HTMLInputElement).value = ''
    }
  }
}

function removeUpdatePhoto(index: number) {
  selectedUpdatePhotos.value.splice(index, 1)
}

function confirmMove(document: any) {
  documentToMove.value = { 
    ...document,
    // Ensure all subdivision properties exist
    idSubDivisionNv_1: document.idSubDivisionNv_1 || null,
    idSubDivisionNv_2: document.idSubDivisionNv_2 || null,
    idSubDivisionNv_3: document.idSubDivisionNv_3 || null,
    idSubDivisionNv_4: document.idSubDivisionNv_4 || null
  }
}



function onMultipleImagesChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    multipleImages.value = Array.from(target.files).filter(file => 
      file.type.startsWith('image/')
    )
    showImageToPdfOption.value = multipleImages.value.length > 0
    // Clear single file if multiple images are selected
    if (multipleImages.value.length > 0) {
      selectedFile.value = null
    }
  }
}

function getFileName(filePath: string): string {
  if (!filePath) return 'Aucun fichier'
  return filePath.split('/').pop() || filePath
}

async function updateDocument() {
  if (!documentToUpdate.value) return
  try {
    const formData = new FormData()
    
    // Add designation
    formData.append('designation', documentToUpdate.value.designation || '')
    
    // Add PDF file if selected
    if (selectedPdfFile.value) {
      formData.append('fichier', selectedPdfFile.value)
    }
    
    // Add video file if selected
    if (selectedVideoFile.value) {
      formData.append('video', selectedVideoFile.value)
    }
    
    // Add plan files (zip them) if selected
    if (selectedPlanFiles.value.length > 0) {
      const zipFile = await createZipFile(selectedPlanFiles.value, 'plan-files')
      formData.append('plan', zipFile)
    }
    
    // Add photos (convert to PDF) if selected
    if (selectedUpdatePhotos.value.length > 0) {
      const photosPdf = await convertUpdatePhotosToPdf()
      formData.append('photos', photosPdf)
    }
    
    // Use the new API endpoint
    await axiosInstance.put(`documents/create-two-file/${documentToUpdate.value.idDocument}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    await fetchDocListForCurrentSelection()
    documentToUpdate.value = null
    selectedFile.value = null
    multipleImages.value = []
    showImageToPdfOption.value = false
    selectedPdfFile.value = null
    selectedVideoFile.value = null
    selectedPlanFiles.value = []
    selectedUpdatePhotos.value = []
    showToast('Document modifié avec succès!', 'success')
  } catch (e: any) {
    showToast('Erreur lors de la modification : ' + (e?.message || 'Erreur inconnue'), 'error')
  }
}

async function moveDocument() {
  if (!documentToMove.value) return
  try {
    const formData = new FormData()
    
    // Add all fields to form data, including empty ones as empty strings
    formData.append('idTypeProduit', documentToMove.value.idTypeProduit?.toString() || '')
    formData.append('idProduit', documentToMove.value.idProduit?.toString() || '')
    formData.append('idStructure', documentToMove.value.idStructure?.toString() || '')
    formData.append('idSection', documentToMove.value.idSection?.toString() || '')
    formData.append('idSubDivisionNv_1', documentToMove.value.idSubDivisionNv_1?.toString() || '')
    formData.append('idSubDivisionNv_2', documentToMove.value.idSubDivisionNv_2?.toString() || '')
    formData.append('idSubDivisionNv_3', documentToMove.value.idSubDivisionNv_3?.toString() || '')
    formData.append('idSubDivisionNv_4', documentToMove.value.idSubDivisionNv_4?.toString() || '')
    
    await axiosInstance.post(`documents/${documentToMove.value.idDocument}/move/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    await fetchDocListForCurrentSelection()
    documentToMove.value = null
    showToast('Document déplacé avec succès!', 'success')
  } catch (e: any) {
    showToast('Erreur lors du déplacement : ' + (e?.message || 'Erreur inconnue'), 'error')
  }
}

async function submitImportForm() {
  if (!importFiles.value.length || !importNomFichier.value) {
    showToast('Veuillez sélectionner des fichiers et saisir un nom de dossier', 'error')
    return
  }
  
  if (isCreatingDocument.value) return; // Prevent multiple submissions
  
  isCreatingDocument.value = true;
  creationProgress.value = 'Préparation de l\'importation...';

  const formData = new FormData()
  
  // Add current date for creation and modification
  const currentDate = new Date().toISOString().split('T')[0]
  
  formData.append('idTypeProduit', String(selectedTypeId.value || ''))
  formData.append('idProduit', String(selectedProduitId.value || ''))
  formData.append('idStructure', String(selectedStructureId.value || ''))
  formData.append('idSection', String(selectedSectionId.value || ''))
  formData.append('idSubDivisionNv_1', String(selectedDivisionId.value || ''))
  
  // Only add subdivision fields if they have values
  if (selectedSubDiv2Id.value) {
    formData.append('idSubDivisionNv_2', String(selectedSubDiv2Id.value))
  }
  if (selectedSubDiv3Id.value) {
    formData.append('idSubDivisionNv_3', String(selectedSubDiv3Id.value))
  }
  if (selectedSubDiv4Id.value) {
    formData.append('idSubDivisionNv_4', String(selectedSubDiv4Id.value))
  }
  
  formData.append('typeProduitDesignation', getTypeDesignation(selectedTypeId.value) || '')
  formData.append('produitDesignation', getProduitDesignation(selectedProduitId.value) || '')
  formData.append('structureNom', getStructureDesignation(selectedStructureId.value) || '')
  formData.append('sectionNom', getSectionDesignation(selectedSectionId.value) || '')
  formData.append('subDivisionNv1Nom', getDivisionDesignation(selectedDivisionId.value) || '')
  formData.append('subDivisionNv3Nom', getSubDiv3Designation(selectedSubDiv3Id.value) || '')
  formData.append('subDivisionNv4Nom', getSubDiv4Designation(selectedSubDiv4Id.value) || '')
  formData.append('designation', importNomFichier.value || '')
  formData.append('chemin', 'No chemin')
  formData.append('version', '1.0')
  formData.append('dateCreation', currentDate)
  formData.append('dateModification', currentDate)
  
  // Add the current user's ID as creerPar
  if (userStore.user.value?.idUser) {
    formData.append('creerPar', String(userStore.user.value.idUser))
  }
  
  try {
    // Create zip file from selected files
    creationProgress.value = 'Compression des fichiers...';
    const zipFile = await createZipFile(importFiles.value, importNomFichier.value)
    formData.append('plan', zipFile)
    
    creationProgress.value = 'Envoi du dossier au serveur...';

    const response = await axiosInstance.post('documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    showToast('Dossier source importé avec succès!', 'success')
    console.log(response.data)
    
    // Reset form and close modal
    closeImportModal()
    
    // Refresh document list if modal or sidebar is open
    if (showDocModal.value || showStructureDocContent.value || showStructureConsulterContent.value) {
      fetchDocListForCurrentSelection()
    }
    
  } catch (error: any) {
    console.error('Erreur lors de l\'importation du dossier source', error)
    if (error.response?.data) {
      console.error('Response data:', error.response.data)
      showToast('Erreur: ' + JSON.stringify(error.response.data), 'error')
    } else {
      showToast('Erreur lors de l\'importation du dossier source', 'error')
    }
  } finally {
    isCreatingDocument.value = false;
    creationProgress.value = '';
  }
}



</script>


<!-- Important: Add this style line for vue-multiselect default style. For better integration, you can extend it in your <style scoped> -->
<!-- <style src="vue-multiselect/dist/vue-multiselect.min.css"></style> -->

<style scoped>
@import './AddDocView.css';
/* Resizable divider styles */
.resize-divider {
  width: 8px;
  background: #232f4b;
  cursor: col-resize;
  order: 2;
  position: relative;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-divider:hover {
  background: #43E97B;
}

.resize-handle {
  width: 2px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
}

.resize-divider:hover .resize-handle {
  background: rgba(255, 255, 255, 0.8);
}

@media (max-width: 600px) {
  .doc-sidebar {
    padding: 1em 0.5em;
  }
  
  .sidebar-table th,
  .sidebar-table td {
    padding: 0.3em 0.4em;
  }
  
  .add-btn, .remove-btn, .add-director-btn {
    padding: 0.25em 0.5em;
    font-size: 0.7rem;
    margin-right: 0.25em;
  }
  
  .dropdown-btn {
    min-width: 100px;
    font-size: 0.7rem;
    padding: 4px 8px;
  }
  
  .resize-divider {
    display: none;
  }
}
</style>
