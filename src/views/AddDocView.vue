
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
      <h1>Fond Documentaire</h1>

      <!-- INITIAL FORM FIELDS -->
      <form v-if="mode !== 'contexte'" class="structure-step-form" @submit.prevent="submitForm">
        <div class="step">
          <label for="type-produit">Type de Produit</label>
          <select id="type-produit" v-model="selectedTypeId">
            <option value="" disabled>Choisir un type</option>
            <option v-for="type in typeProduits" :key="type.idTypeProduit" :value="type.idTypeProduit">
              {{ type.designation }}
            </option>
          </select>
        </div>
        <div class="step" v-if="selectedTypeId">
          <label for="produit">Produit</label>
          <select id="produit" v-model="selectedProduitId" :disabled="!produits.length">
            <option value="" disabled>Choisir un produit</option>
            <option v-for="prod in produits" :key="prod.idProduit" :value="prod.idProduit">
              {{ prod.designation }}
            </option>
          </select>
        </div>
        <div class="step" v-if="selectedProduitId">
          <label for="structure">Structure fond documentaire</label>
          <select id="structure" v-model="selectedStructureId" @change="onStructureChange">
            <option value="" disabled>Choisir une structure</option>
            <option v-for="structure in structures" :key="structure.idStructure" :value="structure.idStructure">
              {{ structure.designation }}
            </option>
          </select>
        </div>

        <!-- STRUCTURE MODE FIELDS -->
        <template v-if="mode === 'structure'">
        <div class="step" v-if="selectedStructureId">
          <label for="section">Section</label>
          <select id="section" v-model="selectedSectionId" :disabled="!sections.length">
            <option value="" disabled>Choisir une section</option>
            <option v-for="sec in sections" :key="sec.idSectionProduit" :value="sec.idSectionProduit">
              {{ sec.designation }}
            </option>
          </select>
        </div>
        <div class="step" v-if="selectedSectionId">
          <label for="division-nv1">Subdivision 1</label>
          <select id="division-nv1" v-model="selectedDivisionId" :disabled="!divisionsNv1.length">
            <option value="" disabled>Choisir une division</option>
            <option v-for="div in divisionsNv1" :key="div.idSubDivisionNv_1" :value="div.idSubDivisionNv_1">
              {{ div.nom }}
            </option>
          </select>
        </div>
        <div class="step" v-if="selectedDivisionId && requiresSubDiv2">
          <label for="subdivision-nv2">Subdivision 2</label>
          <select id="subdivision-nv2" v-model="selectedSubDiv2Id">
            <option value="" disabled>Choisir une sous-division</option>
            <option v-for="item in filteredSubDiv2List" :key="item.idSubDivisionNv_2.idSubDivisionNv_2" :value="item.idSubDivisionNv_2.idSubDivisionNv_2">
              {{ item.idSubDivisionNv_2.nom }}
            </option>
          </select>
        </div>
        <div class="step" v-if="requiresSubDiv2 && selectedSubDiv2Id && requiresSubDiv3">
          <label for="subdivision-nv3">Subdivision 3</label>
          <select id="subdivision-nv3" v-model="selectedSubDiv3Id">
            <option value="" disabled>Choisir une sous-division Niv. 3</option>
            <option v-for="item in filteredSubDiv3List" :key="item.idSubDivisionNv_3.idSubDivisionNv_3" :value="item.idSubDivisionNv_3.idSubDivisionNv_3">
              {{ item.idSubDivisionNv_3.nom }}
            </option>
          </select>
        </div>
        <!-- <div class="step" v-if="requiresSubDiv2 && selectedSubDiv3Id && filteredSubDiv4List.length > 0">
          <label for="subdivision-nv4">Subdivision Niveau 4</label>
          <select id="subdivision-nv4" v-model="selectedSubDiv4Id">
            <option value="" disabled>Choisir une sous-division Niv. 4</option>
            <option v-for="item in filteredSubDiv4List" :key="item.id" :value="item.id">
              {{ item.idSubDivisionNv_4?.nom }}
            </option>
          </select>
        </div> -->
        <p v-if="!isSubDivAllowed && selectedDivisionId" style="color: #E53935;">
          Cette subdivision ne permet pas la création de documents.
        </p>

        <div
          class="button-group"
          v-if="isSubDivAllowed && (
            (requiresSubDiv2 && selectedSubDiv2Id && filteredSubDiv3List.length === 0) ||
            (!requiresSubDiv2 && selectedDivisionId) ||
            (requiresSubDiv2 && selectedSubDiv3Id) ||
            (requiresSubDiv2 && selectedSubDiv4Id)
          )"
        >
          <button class="save-btn" type="button" @click="openStructureDocContent" :class="{ 'disabled': !canAddDocuments }" :disabled="!canAddDocuments">Ajouter </button>
          <button class="consulter-btn" type="button" @click="showSuccessMessage" :disabled="loadingConsulter">
            <span v-if="loadingConsulter">Chargement en cours...</span>
            <span v-else>Consulter</span>
          </button>
          <!-- <button v-if="isPiecesGraphiques" class="import-btn" type="button" @click="openImportModal" :class="{ 'disabled': !canAddDocuments }" :disabled="!canAddDocuments">Importer Dossier Source</button> -->
          <!-- <button class="delete-btn" type="button" @click="openDocModal('delete')">Supprimer Document</button> -->
        </div>
        </template>
      </form>
      <!-- CONTEXT MODE FORM: Multi-directeurs per project and date -->
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
              <button @click="onAjouter(entity.key)" class="context-action add" :class="{ 'disabled': !canAddDocuments }" :disabled="!canAddDocuments">+ Ajouter/Maj</button>
              <button @click="onConsulterFunction(entity.key)" class="context-action view">Consulter</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right sidebar for context and structure modes -->
    <aside class="doc-sidebar" v-show="mode === 'contexte' || showStructureDocContent || showStructureConsulterContent || showConsulterPanel || showSuccess">

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
              <div class="table-container">
                <table v-if="docList.length" class="sidebar-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Type Document</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="document in docList" :key="document.idDocument">
                      <td>{{ document.designation || document.nomFichier || '(non renseigné)' }}</td>
                      <td>{{ getDocumentType(document) }}</td>
                      <td>
                        <button @click="viewDocument(document)" class="consulter-view-btn" :disabled="isAnyDocumentLoading">
                          <span v-if="loadingViewDocument[document.idDocument]">Chargement...</span>
                          <span v-else>Consulter</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="no-data">
                  Aucun document trouvé pour l'arborescence sélectionnée.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Show Arborescence only in context mode -->
      <div v-if="mode === 'contexte'" class="arborescence-section">
        <h3>Arborescence</h3>
        
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
              <div v-if="selectedProjetNoms.length" class="arb-line">
                <span class="arb-label">Projets:</span>
                <span class="arb-value">{{ selectedProjetNoms.join(', ') }}<span v-if="hasMoreProjets" class="more-indicator"> (+plus...)</span></span>
              </div>
              <div v-if="selectedBureauEtudeNoms.length" class="arb-line">
                <span class="arb-label">Bureaux Études:</span>
                <span class="arb-value">{{ selectedBureauEtudeNoms.join(', ') }}<span v-if="hasMoreBET" class="more-indicator"> (+plus...)</span></span>
              </div>
              <div v-if="selectedFournisseurNoms.length" class="arb-line">
                <span class="arb-label">Fournisseurs:</span>
                <span class="arb-value">{{ selectedFournisseurNoms.join(', ') }}<span v-if="hasMoreFournisseurs" class="more-indicator"> (+plus...)</span></span>
              </div>
              <div v-if="selectedMaitreOeuvreNoms.length" class="arb-line">
                <span class="arb-label">Maîtres d'Œuvre:</span>
                <span class="arb-value">{{ selectedMaitreOeuvreNoms.join(', ') }}<span v-if="hasMoreMOE" class="more-indicator"> (+plus...)</span></span>
              </div>
              <div v-if="selectedMaitreOuvrageNoms.length" class="arb-line">
                <span class="arb-label">Maîtres d'Ouvrage:</span>
                <span class="arb-value">{{ selectedMaitreOuvrageNoms.join(', ') }}<span v-if="hasMoreMOA" class="more-indicator"> (+plus...)</span></span>
              </div>
              <div v-if="selectedSoustraitantNoms.length" class="arb-line">
                <span class="arb-label">Soustraitants:</span>
                <span class="arb-value">{{ selectedSoustraitantNoms.join(', ') }}<span v-if="hasMoreSoustraitants" class="more-indicator"> (+plus...)</span></span>
              </div>
              <div v-if="selectedDirectionsProjets.length" class="arb-line">
                <span class="arb-label">Directeurs:</span>
                <span class="arb-value">{{ selectedDirectionsProjets.map(d => d.nomPrenomDirecteur || `${d.nom} ${d.prenom}`).join(', ') }}<span v-if="hasMoreDirecteurs" class="more-indicator"> (+plus...)</span></span>
              </div>
            </div>
          </template>
        </ul>
      </div>

      <!-- Ajouter content in sidebar -->
      <div v-if="contextAjouter.visible" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Ajouter {{ contextAjouter.entityLabel }}</h3>
          <button @click="closeContextAjouterModal" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <!-- LEFT: All Items Table -->
          <div class="section">
            <h4>Liste de {{ contextAjouter.entityLabel }}</h4>
            <div class="table-container limited">
              <table class="sidebar-table">
                <thead>
                  <tr>
                    <th v-for="header in contextAjouter.columns" :key="header">{{ header }}</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in contextAjouter.all"
                    :key="item[contextAjouter.idCol]"
                    :class="{ selected: isAlreadySelected(contextAjouter.entityKey, item) }"
                  >
                    <td v-for="col in contextAjouter.columnKeys" :key="col">{{ item[col] }}</td>
                    <td>
                      <button
                        class="add-btn"
                        @click="contextAjouter.entityKey === 'direction_projet' ? openDateModal(item) : addToSelected(contextAjouter.entityKey, item)"
                        :disabled="isAlreadySelected(contextAjouter.entityKey, item) || (!getEntityConfig(contextAjouter.entityKey)?.allowMultiple && contextAjouter.selected.length >= 1)"
                      >Ajouter</button>
                    </td>
                  </tr>
                  <tr v-if="!contextAjouter.all.length">
                    <td :colspan="contextAjouter.columns.length + 1" class="no-data">
                      Aucun élément à afficher.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- RIGHT: Selected Table -->
          <div class="section">
            <h4>Votre sélection</h4>
            <div class="table-container limited">
              <table class="sidebar-table">
                <thead>
                  <tr>
                    <th v-for="header in contextAjouter.columns" :key="header">{{ header }}</th>
                    <th>Actions</th>
                    <th v-if="contextAjouter.entityKey === 'maitre_ouvrage' || contextAjouter.entityKey === 'maitre_oeuvre' || contextAjouter.entityKey === 'bet_soustraitants_etudes'">Directeurs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in contextAjouter.selected" :key="item[contextAjouter.idCol]">
                    <td v-for="col in contextAjouter.columnKeys" :key="col">{{ item[col] }}</td>
                    <td>
                      <button class="remove-btn" @click="removeFromSelected(contextAjouter.entityKey, item)">Enlever</button>
                      <button
                        v-if="contextAjouter.entityKey === 'maitre_ouvrage' || contextAjouter.entityKey === 'maitre_oeuvre' || contextAjouter.entityKey === 'bet_soustraitants_etudes'"
                        class="add-director-btn"
                        @click="openDirecteurModal(item)"
                      >Ajouter Directeur</button>
                    </td>
                    <td v-if="contextAjouter.entityKey === 'maitre_ouvrage' || contextAjouter.entityKey === 'maitre_oeuvre' || contextAjouter.entityKey === 'bet_soustraitants_etudes'">
                      <div class="dropdown">
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
                    </td>
                  </tr>
                  <tr v-if="!contextAjouter.selected.length">
                    <td :colspan="contextAjouter.entityKey === 'maitre_ouvrage' || contextAjouter.entityKey === 'maitre_oeuvre' || contextAjouter.entityKey === 'bet_soustraitants_etudes' ? contextAjouter.columns.length + 2 : contextAjouter.columns.length + 1" class="no-data">
                      Aucune sélection pour l'instant.
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
          <h3>Consulter - {{ contextConsulter.entityLabel }}</h3>
          <button @click="closeContextConsulterModal" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="contextConsulter.loading" class="loading">Chargement...</div>
          <div v-else-if="contextConsulter.error" class="error">{{ contextConsulter.error }}</div>
          <div v-else class="section">
            <div class="table-container">
              <table v-if="contextConsulter.data.length" class="sidebar-table">
                <thead>
                  <tr>
                    <th v-for="col in contextConsulter.columns" :key="col">{{ col }}</th>
                    <th v-if="contextConsulter.entityKey === 'maitre_ouvrage' || contextConsulter.entityKey === 'maitre_oeuvre' || contextConsulter.entityKey === 'bet_soustraitants_etudes'">Directeurs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in contextConsulter.data" :key="row[contextConsulter.columnKeys[0]]">
                    <td v-for="colKey in contextConsulter.columnKeys" :key="colKey">{{ row[colKey] ?? '-' }}</td>
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
              <div v-if="!contextConsulter.data.length" class="no-data">
                Aucun élément à afficher.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Structure mode document content in sidebar -->
      <div v-if="showStructureDocContent" class="sidebar-content modal-section">
        <div class="sidebar-header">
          <h3>Ajouter Document</h3>
          <button @click="closeStructureDocContent" class="close-btn">&times;</button>
        </div>
        <div class="sidebar-body">
          <div v-if="loadingDocs" class="loading">Chargement...</div>
          <div v-else>
            <div v-if="docModalError" class="error">{{ docModalError }}</div>
            <div class="section">
              <h4>Documents existants</h4>
              <div class="table-container">
                <table v-if="docList.length" class="sidebar-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Type Document</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                    <tbody>
                    <tr v-for="document in docList" :key="document.idDocument">
                      <td>{{ document.designation || document.nomFichier || '(non renseigné)' }}</td>
                      <td>{{ getDocumentType(document) }}</td>
                      <td>
                        <button @click="viewDocument(document)" class="consulter-view-btn" :disabled="isAnyDocumentLoading">
                          <span v-if="loadingViewDocument[document.idDocument]">Chargement...</span>
                          <span v-else>Consulter</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="no-data">
                  Aucun document trouvé pour l'arborescence sélectionnée.
                </div>
              </div>
            </div>
            
            <!-- Form for Create Mode -->
            <div v-if="isSubDivAllowed" class="section">
              <h4>Créer un nouveau document</h4>
              <div class="step" id="nonFichier">
                <label for="nonFichier">Description</label>
                <input id="nonFichier-input" v-model="nonFichier" type="text" />
              </div>
              <div class="step">
                <label for="file-upload" class="file-upload-label">Fichier (PDF,Image,Video)</label>
                <input id="file-upload" type="file" accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi" @change="onFileChange" />
                <div v-if="uploadedFile" class="file-info">
                  <span class="file-selected-text">Fichier sélectionné: {{ uploadedFile.name }}</span>
                  <button @click="uploadedFile = null" type="button">Retirer</button>
                </div>
              </div>
              
              <!-- <div class="step" v-if="selectedStructureId">
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
              </div> -->
            </div>
        </div>
        <div class="sidebar-footer">
          <button class="validate-btn" @click="submitForm" :class="{ 'disabled': !canAddDocuments }" :disabled="!canAddDocuments">Ajouter Document</button>
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
              <input type="date" id="date_debut_projet" v-model="dateModal.date_debut" required>
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
        <button class="save-btn" @click="submitForm" style="margin-top:1em;" :class="{ 'disabled': !canAddDocuments }" :disabled="!canAddDocuments">Ajouter </button>
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
  <div class="modal">
    <h2>Consulter Document</h2>

    <div class="file-viewer-container">
      <!-- PDF Viewer -->
      <PdfViewer
        v-if="selectedDocument.fichier && getFileType(selectedDocument) === 'pdf'"
        :pdfUrl="selectedDocument.fichier"
        :canDownload="userStore.user.value?.profil === 2 || userStore.user.value?.telechargement || false"
        :canPrint="userStore.user.value?.profil === 2 || userStore.user.value?.impression || false"
      />
      
      <!-- Image Viewer -->
      <div v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'image'" class="image-viewer">
        <img 
          :src="selectedDocument.fichier" 
          alt="Document" 
          class="document-image"
        />
        <div class="image-actions">
          <button 
            @click="downloadFile(selectedDocument)" 
            :class="['btn', { 'btn-disabled': (userStore.user.value?.profil !== 2 && !userStore.user.value?.telechargement) }]" 
            :disabled="(userStore.user.value?.profil !== 2 && !userStore.user.value?.telechargement)"
            title="Télécharger"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </button>
          <button 
            @click="printImage(selectedDocument)" 
            :class="['btn', { 'btn-disabled': (userStore.user.value?.profil !== 2 && !userStore.user.value?.impression) }]" 
            :disabled="(userStore.user.value?.profil !== 2 && !userStore.user.value?.impression)"
            title="Imprimer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Video Viewer -->
      <div v-else-if="selectedDocument.fichier && getFileType(selectedDocument) === 'video'" class="video-viewer">
        <video 
          :src="selectedDocument.fichier" 
          controls 
          class="document-video"
        >
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
        <div class="video-actions">
          <button 
            @click="downloadFile(selectedDocument)" 
            :class="['btn', { 'btn-disabled': (userStore.user.value?.profil !== 2 && !userStore.user.value?.telechargement) }]" 
            :disabled="(userStore.user.value?.profil !== 2 && !userStore.user.value?.telechargement)"
            title="Télécharger"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="modal-actions">
      <button @click="closeDocumentViewer" class="cancel">Fermer</button>
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
        <button class="save-btn" @click="submitImportForm" :disabled="!importFiles.length || !importNomFichier" style="font-size:1em;">Importer Dossier</button>
      </div>
    </div>
  </div>
</div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import "vue-multiselect/dist/vue-multiselect.css";
import axios from '../axios'
import PdfViewer from '../components/PdfViewer.vue'
import { useUserStore } from '../store/userStore'


// const API_BASE = 'http://10.10.150.75:8000/api'

interface Document {
  idDocument: number
  fichier?: string | null
  detectedType?: string
}



// User store for role-based access control
const userStore = useUserStore()
const selectedDocument = ref<Document | null>(null)
const loadingViewDocument = ref<Record<number, boolean>>({})
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
const multipleImages = ref<File[]>([])
const showImageToPdfOption = ref(false)

// Import Dossier Source variables
const showImportModal = ref(false)
const importFiles = ref<File[]>([])
const importNomFichier = ref<string>('')
const fileInput = ref<HTMLInputElement>()


// Initial fetch
onMounted(async () => {
  await userStore.fetchUserProfile()
  try {
    const [typesRes, structuresRes, subDivsRes, subDivs3Res, subDivs4Res] = await Promise.all([
      // axios.get(`${API_BASE}/types/`),
      axios.get(`types/`),
      axios.get(`structures/`),
      axios.get(`subdiv1et2/`),
      axios.get(`subdiv2et3/`),
      axios.get(`subdiv3et4/`)
    ])
    typeProduits.value = typesRes.data
    structures.value = structuresRes.data
    allSubDivs1Et2.value = subDivsRes.data
    allSubDivs2Et3.value = subDivs3Res.data
    allSubDivs3Et4.value = subDivs4Res.data
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
        axios.get(`produits/by-type/${newTypeId}/`),
        axios.get(`sections/by-type/${newTypeId}/`)
      ])
      produits.value = produitsRes.data
      sections.value = sectionsRes.data
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
      const res = await axios.get(`subdivision-nv1/by-structure/${newStructureId}/`)
      divisionsNv1.value = res.data
    } catch (error) {
      console.error('Erreur divisions nv1', error)
    }
  }
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

// const isPiecesGraphiques = computed(() => {
//   if (!selectedDivisionId.value) return false
//   const division = divisionsNv1.value.find(d => d.idSubDivisionNv_1 === selectedDivisionId.value)
//   return division?.nom?.toUpperCase().includes('PIECES GRAPHIQUES') || division?.nom?.toUpperCase().includes('PIECE GRAPHIQUES') || false
// })

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) uploadedFile.value = files[0]
}

function onMultipleImagesChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    multipleImages.value = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    )
    showImageToPdfOption.value = multipleImages.value.length > 0
  }
}

function removeImage(index: number) {
  multipleImages.value.splice(index, 1)
  showImageToPdfOption.value = multipleImages.value.length > 0
}

async function convertImagesToPdf(): Promise<File> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF('p', 'mm', 'a4')
  
  for (let i = 0; i < multipleImages.value.length; i++) {
    const file = multipleImages.value[i]
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    await new Promise((resolve) => {
      img.onload = () => {
        // A4 dimensions in mm: 210 x 297, with margins
        const pageWidth = 210
        const pageHeight = 297
        const margin = 10
        const maxWidth = pageWidth - (margin * 2)
        const maxHeight = pageHeight - (margin * 2)
        
        // Use high resolution canvas
        const scale = 2 // Higher scale for better quality
        let { width, height } = img
        
        // Calculate dimensions to fit page while maintaining aspect ratio
        const widthRatio = maxWidth / width
        const heightRatio = maxHeight / height
        const ratio = Math.min(widthRatio, heightRatio)
        
        const finalWidth = width * ratio
        const finalHeight = height * ratio
        
        // Set canvas size with high resolution
        canvas.width = width * scale
        canvas.height = height * scale
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
        
        // Scale context for high resolution
        ctx.scale(scale, scale)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Draw image at original size on high-res canvas
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to high quality JPEG
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        
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
  return new File([pdfBlob], `${nonFichier.value || 'images'}.pdf`, { type: 'application/pdf' })
}

function getTypeDesignation(id: number | null) {
  return typeProduits.value.find(t => t.idTypeProduit === id)?.designation || ''
}
function getProduitDesignation(id: number | null) {
  return produits.value.find(p => p.idProduit === id)?.designation || ''
}
function getStructureDesignation(id: number | null) {
  return structures.value.find(s => s.idStructure === id)?.designation || ''
}
function getSectionDesignation(id: number | null) {
  return sections.value.find(s => s.idSectionProduit === id)?.designation || ''
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
function getSubDiv3Designation(id: number | null) {
  return filteredSubDiv3List.value.find(i => i.idSubDivisionNv_3.idSubDivisionNv_3 === id)?.idSubDivisionNv_3.nom || ''
}
function getSubDiv4Designation(id: number | null) {
  return filteredSubDiv4List.value.find(i => i.id === id)?.idSubDivisionNv_4?.nom || ''
}

async function submitForm() {
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
      fileToUpload = await convertImagesToPdf();
    }
    
    if (fileToUpload) {
      formData.append('fichier', fileToUpload);
    }

    const response = await axios.post('documents/create-with-file/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    showToast('Document créé avec succès!', 'success');
    console.log(response.data);
    
    // Reset form
    nonFichier.value = '';
    uploadedFile.value = null;
    multipleImages.value = [];
    showImageToPdfOption.value = false;
    
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
  }
}

// DOC TABLE POPUP MODAL
const showDocModal = ref(false);
const docModalMode = ref<'create'|'consult'|'delete'|''>('');
const loadingDocs = ref(false);
const docList = ref<any[]>([]);
const docModalError = ref('');

// Structure mode sidebar content
const showStructureDocContent = ref(false);
const showStructureConsulterContent = ref(false);

// SUCCESS MESSAGE VARIABLE
const showSuccess = ref(false);
const loadingConsulter = ref(false);

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
    columns: ["Code", "Description"],
    columnKeys: ["code", "description"]
  },
  fournisseur: {
    label: "Fournisseur",
    endpoint: ((produitId: number) => `fournisseur/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["ID", "Désignation", "Description", "Téléphone", "Email"],
    columnKeys: ["idFournisseur", "designationFournisseur", "description", "telephone", "email"]
  },
  maitre_oeuvre: {
    label: "Maître d'Œuvre",
    endpoint: ((produitId: number) => `/moe/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["ID", "Désignation", "Description", "Email"],
    columnKeys: ["idMaitreOeuvre", "designationMO", "description", "email"]
  },
  maitre_ouvrage: {
    label: "Maître d'Ouvrage",
    endpoint: ((produitId: number) => `moa/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["ID", "Désignation", "Description", "Email"],
    columnKeys: ["idMaitreOuvrage", "designationMOg", "description", "email"]
  },
  soustraitants_tvx: {
    label: "Soustraitants Travaux",
    endpoint: ((produitId: number) => `soustraitants/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["ID", "Désignation", "Description", "Téléphone", "Email"],
    columnKeys: ["idSoustraitants", "designationStt", "description", "telephone", "email"]
  },
  bet_soustraitants_etudes: {
    label: "BET Soustraitants Études",
    endpoint: ((produitId: number) => `bet/by-produit/${produitId}`) as ProduitEndpoint,
    columns: ["ID", "Nom", "Description", "Téléphone", "Email"],
    columnKeys: ["idBET", "nom", "description", "telephone", "email"]
  },
  direction_projet: {
    label: "Direction du Projet",
    endpoint: ((projetCode: string) => `directeurs-by-projet/${projetCode}`) as ProjetEndpoint,
    columns: ["ID", "Nom", "Fonction", "Téléphone"],
    columnKeys: ["idDirecteur", "nomPrenomDirecteur", "fonction", "telephone"]
  }
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
// Check if the entity is 'direction_projet' and if a project is selected
if (entityKey === 'direction_projet') {
  if (!selectedProjets.value.length) {
    showToast("Veuillez d'abord sélectionner un projet.", 'error');
    return;
  }
  contextConsulter.value.visible = true; // Add this line to make the modal visible
  contextConsulter.value.loading = true;
  contextConsulter.value.error = '';
  contextConsulter.value.entityKey = entityKey;
  contextConsulter.value.entityLabel = config.label;
  contextConsulter.value.columns = config.columns;
  contextConsulter.value.columnKeys = config.columnKeys;
  contextConsulter.value.data = [];

  try {
    const code = selectedProjets.value[0].code;
    const { data } = await axios.get((config.endpoint as ProjetEndpoint)(encodeURIComponent(code)));
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
      const { data } = await axios.get((config.endpoint as ProduitEndpoint)(selectedProduitId.value));
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
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idSoustraitant: item.idSoustraitant }),
  },
  fournisseur: {
    endpoint: '/contexte-fournisseur/',
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idFournisseur: item.idFournisseur }),
  },
  bet_soustraitants_etudes: {
    endpoint: '/contexte-bureau-etude/',
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idBET: item.idBET }),
  },
  direction_projet: {
    endpoint: '/projets-directeurs/',
    getPayload: (item: any) => ({ code: String(selectedProjets.value[0]?.code), idDirecteur: item.idDirecteur }),
  }
};

// Helper: check column key by 'columns' header for confirm table
// Helper: check column key by 'columns' header for confirm table
function getColKeyByHeader(header: string) {
  const idx = contextDelete.value.columns.indexOf(header);
  return idx !== -1 ? contextDelete.value.columnKeys[idx] : header;
}


// Context entities list for UI
const contextEntities = [
  { key: "projet", label: "Projet" },
  { key: "maitre_ouvrage", label: "Maître d'Ouvrage" },
  { key: "maitre_oeuvre", label: "Maître d'Œuvre" },
  { key: "soustraitants_tvx", label: "Soustraitants de Travaux" },
  { key: "fournisseur", label: "Fournisseur" },
  { key: "bet_soustraitants_etudes", label: "BET Soustraitants Études" },
  { key: "direction_projet", label: "Direction du Projet" }
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

    await axios.post('/projets-directeurs/', payload);
    
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
  if (config.listRef.value.length === 0) {
    try {
      const { data } = await axios.get(config.api);
      config.listRef.value = data;
    } catch (e) {
      showToast("Erreur lors du chargement des " + config.label, 'error');
      contextAjouter.value.visible = false;
      return;
    }
  }
  contextAjouter.value.all = config.listRef.value;

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
      const { data } = await axios.get(url);
      selectedList = Array.isArray(data) ? data : [data];
      selectedList = selectedList.filter(x => typeof x === 'object' && x != null);
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

      await axios.post(`/${endpoint}/`, payload);
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

    await axios.delete(`/${endpoint}/`, { data: payload });
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

    await axios.post(`/${endpoint}/`, payload);
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
    await axios.post(`${entityDeleteDef.endpoint}`, entityDeleteDef.getPayload(item));
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



let fetchInProgress = false;

async function fetchDocListForCurrentSelection() {
  if (fetchInProgress) return;
  
  // Only fetch if essential IDs are selected
  if (!selectedTypeId.value || !selectedProduitId.value || !selectedStructureId.value || !selectedSectionId.value || !selectedDivisionId.value) {
    docList.value = [];
    return;
  }
  
  fetchInProgress = true;
  loadingDocs.value = true;
  docModalError.value = '';
  try {
    // Compose filter query params
    const params: Record<string, string | number> = {};
    if (selectedTypeId.value) params.idTypeProduit = selectedTypeId.value;
    if (selectedProduitId.value) params.idProduit = selectedProduitId.value;
    if (selectedStructureId.value) params.idStructure = selectedStructureId.value;
    if (selectedSectionId.value) params.idSection = selectedSectionId.value;
    if (selectedDivisionId.value) params.idSubDivisionNv_1 = selectedDivisionId.value;
    if (requiresSubDiv2.value && selectedSubDiv2Id.value) {
      params.idSubDivisionNv_2 = selectedSubDiv2Id.value;
    }
    if (requiresSubDiv2.value && selectedSubDiv3Id.value) {
      params.idSubDivisionNv_3 = selectedSubDiv3Id.value;
    }
    if (requiresSubDiv2.value && selectedSubDiv4Id.value) {
      params.idSubDivisionNv_4 = selectedSubDiv4Id.value;
    }
    const { data } = await axios.get('documentsFilter/', { params });
    docList.value = Array.isArray(data) ? data : [];
  } catch(e: any) {
    docModalError.value = "Erreur lors du chargement des documents.";
    docList.value = [];
  } finally {
    loadingDocs.value = false;
    fetchInProgress = false;
  }
}

// function openDocModal(mode: 'create'|'consult'|'delete') {
//   docModalMode.value = mode;
//   showDocModal.value = true;
//   fetchDocListForCurrentSelection();
// }

function closeDocModal() {
  showDocModal.value = false;
  docModalError.value = '';
}

// Structure mode sidebar functions
function openStructureDocContent() {
  contextAjouter.value.visible = false; // Close context ajouter modal
  showSuccess.value = false; // Close success message if open
  showConsulterPanel.value = false; // Close NEW consulter if open
  showStructureDocContent.value = true;
  showStructureConsulterContent.value = false; // Close consulter if open
  fetchDocListForCurrentSelection();
}

function closeStructureDocContent() {
  showStructureDocContent.value = false;
  docModalError.value = '';
}

// SUCCESS MESSAGE FUNCTION
async function showSuccessMessage() {
  if (loadingConsulter.value) return; // Prevent multiple clicks
  
  loadingConsulter.value = true;
  showStructureDocContent.value = false; // Close ajouter content
  showSuccess.value = true;
  
  try {
    await fetchDocListForCurrentSelection();
  } finally {
    loadingConsulter.value = false;
  }
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
    await axios.delete(`documents/${document.idDocument}`);
    showToast("Document supprimé !", 'success');
    fetchDocListForCurrentSelection();
  } catch (e) {
    showToast("Erreur lors de la suppression.", 'error');
  }
}

async function viewDocument(document: Document) {
  if (loadingViewDocument.value[document.idDocument]) return
  
  loadingViewDocument.value[document.idDocument] = true
  showToast('Veuillez patienter, le document se charge...', 'success')
  
  try {
    const response = await fetch(`http://10.10.150.75:8000/api/documents/view-file/${document.idDocument}/`)
    const blob = await response.blob()
    const fileUrl = URL.createObjectURL(blob)
    
    // Detect file type from blob content-type
    let detectedType = 'pdf'
    if (blob.type.startsWith('image/')) {
      detectedType = 'image'
    } else if (blob.type.startsWith('video/')) {
      detectedType = 'video'
    }
    
    selectedDocument.value = {
      ...document,
      fichier: fileUrl,
      detectedType: detectedType
    }
  } catch (error) {
    console.error('Error loading document:', error)
    showToast('Erreur lors du chargement du document', 'error')
  } finally {
    loadingViewDocument.value[document.idDocument] = false
  }
}

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
  selectedProjets.value.map(p => p.description)
)

// Computed properties to check if there are more items than displayed
const hasMoreProjets = ref(false)
const hasMoreBET = ref(false)
const hasMoreFournisseurs = ref(false)
const hasMoreMOE = ref(false)
const hasMoreMOA = ref(false)
const hasMoreSoustraitants = ref(false)
const hasMoreDirecteurs = ref(false)



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
        axios.get(`bureaux-etudes/`),
        axios.get(`fournisseurs/`),
        axios.get(`maitres-oeuvre/`),
        axios.get(`maitres-ouvrage/`),
        axios.get(`Soustraitants/`),
        axios.get(`projets/`),
        axios.get(`directions-projets/`)
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




// const pdfUrl = ref<string | null>(null)
// async function generateContextPdfV2() {
//   const html2pdf = (await import('html2pdf.js')).default
//   let html = `
//     <h2 style="color:#16213e;">Résumé du contexte</h2>
//     <ul>
//       <li><b>Bureau(x) d'Études:</b> ${selectedBureauxEtudes.value.map(b => b.nom).join(", ")}</li>
//       <li><b>Fournisseur(s):</b> ${selectedFournisseurs.value.map(f => f.designationFournisseur).join(", ")}</li>
//       <li><b>Maître(s) d'Œuvre:</b> ${selectedMaitresOeuvre.value.map(m => m.designationMO).join(", ")}</li>
//       <li><b>Maître(s) d'Ouvrage:</b> ${selectedMaitresOuvrage.value.map(m => m.designationMOg).join(", ")}</li>
//       <li><b>Soustraitant(s):</b> ${selectedSoustraitants.value.map(s => s.designationStt).join(", ")}</li>
//       <li><b>Projet(s):</b> ${selectedProjets.value.map(p => p.description).join(", ")}</li>
//     </ul>
//     <h3 style="margin-top:1em;">Directeurs par projet</h3>
//   `
//   for (const projet of selectedProjets.value) {
//     const pid = String(projet.idProjet)
//     html += `<div style="margin-top:0.7em;"><b>${projet.description}</b>`
//     const projForm = projectDirectorsForm.value[pid]
//     if (projForm?.selectedDirecteurs?.length) {
//       html += '<ul>'
//       for (const directeur of projForm.selectedDirecteurs) {
//         const did = String(directeur.idDirecteur)
//         const dates = projForm.dates[did]
//         html += `<li>${directeur.nomPrenomDirecteur} du ${dates?.dateDebut || '-'} au ${dates?.dateFin || '-'}</li>`
//       }
//       html += '</ul>'
//     } else {
//       html += '<div style="font-style:italic; color:#aaa;">Aucun directeur sélectionné</div>'
//     }
//     html += '</div>'
//   }
//   const pdfContent = document.createElement('div')
//   pdfContent.style.padding = '2em'
//   pdfContent.style.fontFamily = 'Inter, Arial, sans-serif'
//   pdfContent.innerHTML = html
//   const opt = {
//     margin: 0.5,
//     filename: 'contexte.pdf',
//     image: { type: 'jpeg', quality: 0.98 },
//     html2canvas: { scale: 2 },
//     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
//   }
//   const blob = await html2pdf().from(pdfContent).set(opt).outputPdf('blob')
//   pdfUrl.value = URL.createObjectURL(blob)
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
    const { data } = await axios.get(`${endpoint}${selectedProduitId.value}`);
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
    const { data } = await axios.get(`directeurs-by-projet/${encodeURIComponent(code)}`);
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
    idCol: 'idSoustraitant',
    columns: ['ID', 'Désignation', 'Description', 'Téléphone', 'Email'],
    columnKeys: ['idSoustraitant', 'designationStt', 'description', 'telephone', 'email'],
    listRef: soustraitantsList,
    selectedRef: selectedSoustraitants,
    allowMultiple: true,
  },
  bet_soustraitants_etudes: {
    label: "BET Soustraitants Études",
    api: '/bet-soustraitants-etudes/',
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
    columns: ['ID', 'Nom', 'Fonction', 'Téléphone'],
    columnKeys: ['idDirecteur', 'nomPrenomDirecteur', 'fonction', 'telephone'],
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
    
    const { data } = await axios.post(`/${endpoint}/`, params)
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
    
    const { data } = await axios.post(`/${endpoint}/`, params)
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

function getDocumentType(document: any): string {
  if (!document.nomFichier) return 'Document'
  
  const fileName = document.nomFichier.toLowerCase()
  if (fileName.endsWith('.pdf')) return 'PDF'
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif')) return 'Image'
  if (fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.avi')) return 'Vidéo'
  if (fileName.endsWith('.txt')) return 'Texte'
  if (fileName.endsWith('.zip')) return 'Archive'
  return 'Document'
}



async function downloadFile(doc: any) {
  if (!doc.fichier) return
  
  try {
    const response = await fetch(doc.fichier)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `document-${doc.idDocument}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    showToast('Erreur lors du téléchargement', 'error')
  }
}

function printImage(doc: any) {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>Print Image</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
          <img src="${doc.fichier}" style="max-width:100%;max-height:100%;"/>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
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
  showConsulterPanel.value = false
  showStructureConsulterContent.value = false
  showDocModal.value = false
  showImportModal.value = false
  
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
  multipleImages.value = []
  showImageToPdfOption.value = false
  importFiles.value = []
  importNomFichier.value = ''
  
  // Clear document lists
  docList.value = []
  docModalError.value = ''
  
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

async function submitImportForm() {
  if (!importFiles.value.length || !importNomFichier.value) {
    showToast('Veuillez sélectionner des fichiers et saisir un nom de dossier', 'error')
    return
  }

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
    const zipFile = await createZipFile(importFiles.value, importNomFichier.value)
    formData.append('plan', zipFile)

    const response = await axios.post('http://10.10.150.75:8000/api/documents/', formData, {
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
  }
}

</script>


<!-- Important: Add this style line for vue-multiselect default style. For better integration, you can extend it in your <style scoped> -->
<!-- <style src="vue-multiselect/dist/vue-multiselect.min.css"></style> -->

<style scoped>
.add-doc-root {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(120deg, #16213e 70%, #1a237e 100%);
  color: #e3eafc;
  font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  gap: 1em;
}

.doc-sidebar {
  width: 900px;
  background: rgba(22,33,62,0.98);
  border-left: 2px solid #232f4b;
  padding: 1.5em 2em 1em 2em;
  min-height: 100vh;
  box-shadow: -2px 0 16px 0 #151e3044;
  font-size: 1.2rem;
  order: 2;
  overflow-y: auto;
}

/* Arborescence section */
.arborescence-section {
  margin-bottom: 0.3em;
  padding-bottom: 0.2em;
  border-bottom: 2px solid #232f4b;
}

.arborescence-section h3 {
  color: #43E97B;
  margin-bottom: 0.5em;
  font-size: 1.3rem;
  text-align: left;
  margin-left: 0;
  padding-left: 0;
}

/* Tree structure styles */
.tree-structure {
  margin-bottom: 0.5em;
  padding: 0.2em;
  background: rgba(67, 233, 123, 0.05);
  border-radius: 8px;
  border-left: 3px solid #43E97B;
}

.tree-node {
  display: flex;
  align-items: center;
  margin-bottom: 0.2em;
  font-size: 1rem;
}

.tree-child {
  display: flex;
  align-items: center;
  margin-left: 2em;
  margin-top: 0.5em;
  padding-left: 1em;
  border-left: 2px solid #43E97B;
  position: relative;
}

.tree-child::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 50%;
  width: 1em;
  height: 2px;
  background: #43E97B;
}

.tree-icon {
  margin-right: 0.5em;
  font-size: 1.1em;
}

.tree-label {
  color: #bbdefb;
  font-weight: 600;
}

.selected-produit {
  color: #43E97B !important;
  font-weight: 700;
}

.arb-content {
  padding-left: 0;
  text-align: left;
}

.arb-line {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.4em;
  line-height: 1.3;
}

.arb-label {
  font-weight: 600;
  color: #bbdefb;
  min-width: 130px;
  flex-shrink: 0;
  font-size: 1rem;
}

.arb-value {
  font-weight: 700;
  color: #43E97B;
  flex: 1;
  word-wrap: break-word;
  font-size: 1rem;
}

/* Modal section */
.modal-section {
  margin-top: 0.1em;
}

/* Sidebar content styles */
.sidebar-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.1em;
  padding-bottom: 0.1em;
  border-bottom: 2px solid #232f4b;
}

.sidebar-header h3 {
  color: #43E97B;
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  color: #e3eafc;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.2em;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-body {
  flex: 1;
  overflow: visible;
  max-height: 70vh;
}

.section {
  margin-bottom: 1em;
}

.section h4 {
  color: #bbdefb;
  margin-bottom: 0.6em;
  font-size: 1.2rem;
  font-weight: 600;
}

.table-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #232f4b;
  border-radius: 6px;
  margin-bottom: 1em;
}

/* Limit tables to 5 rows with scrolling */
.table-container.limited {
  max-height: 250px;
  overflow-y: auto;
}

.sidebar-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}

.sidebar-table th,
.sidebar-table td {
  padding: 0.8em 1em;
  text-align: left;
  border-bottom: 1px solid #232f4b;
}

.sidebar-table th {
  background: rgba(33, 150, 243, 0.1);
  color: #bbdefb;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.sidebar-table tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-table tr.selected {
  background: rgba(67, 233, 123, 0.1);
}

.add-btn, .remove-btn, .add-director-btn, .validate-btn {
  padding: 0.5em 1em;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 0.5em;
}

.add-btn {
  background: #43E97B;
  color: #111;
}

.add-btn:hover:not(:disabled) {
  background: #3bc96a;
  transform: translateY(-1px);
}

.add-btn:disabled {
  background: #888;
  cursor: not-allowed;
  opacity: 0.6;
}

.remove-btn {
  background: #E53935;
  color: white;
}

.remove-btn:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

.add-director-btn {
  background: #2196F3;
  color: white;
}

.add-director-btn:hover {
  background: #1976d2;
  transform: translateY(-1px);
}

.validate-btn {
  background: linear-gradient(90deg, #2196F3 0%, #43E97B 100%);
  color: white;
  padding: 1em 2.5em;
  font-size: 1.1rem;
  margin-top: 1.2em;
}

.validate-btn:hover {
  background: linear-gradient(90deg, #43E97B 0%, #2196F3 100%);
  transform: translateY(-1px);
}

.sidebar-footer {
  padding-top: 0.1em;
  border-top: 2px solid #232f4b;
  text-align: center;
}

.no-data {
  text-align: center;
  font-style: italic;
  color: #888;
  padding: 1em;
}

.loading {
  text-align: center;
  color: #43E97B;
  font-weight: 600;
  padding: 2em;
}

.error {
  text-align: center;
  color: #E53935;
  padding: 2em;
}

.more-indicator {
  color: #bbdefb;
  font-weight: 400;
  font-style: italic;
  font-size: 0.85em;
  opacity: 0.8;
}
.add-doc-main {
  flex: 1;
  padding: 0.01em 2em 0.1em 3em;
  max-width: 700px;
  margin: 0;
  display: flex;
  flex-direction: column;
  order: 1;
}
.add-doc-main h1 {
  color: #90caf9;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5em;
  letter-spacing: 1px;
}
.step {
  margin-bottom: 0.5em;
  background: rgba(22,33,62,0.85);
  border-radius: 12px;
  padding: 0.5em 2em 1em 1.5em;
  box-shadow: 0 2px 12px 0 #1a237e22;
  border-left: 4px solid #2196F3;
}

/* Structure mode: side by side layout */
.structure-step-form .step {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2em;
  align-items: start;
  padding: 1.2em 2em;
}

.structure-step-form .step label {
  margin-bottom: 0;
  text-align: left;
  font-weight: 600;
  color: #bbdefb;
  padding-left: 0;
  padding-top: 10px;
}

.structure-step-form .step select,
.structure-step-form .step input {
  margin-bottom: 0;
}

/* Structure fields styling with enhanced background */
.structure-step-form .step {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #2196F3;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 16px 0 rgba(33, 150, 243, 0.1);
  transition: all 0.3s ease;
}

.structure-step-form .step:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(33, 150, 243, 0.15);
}
label {
  font-weight: 600;
  color: #bbdefb;
  margin-bottom: 0.4em;
  display: block;
  letter-spacing: 0.5px;
}
select, input[type="text"], input[type="date"], input[type="email"], input[type="tel"] {
  width: 100%;
  padding: 0.7em 1em;
  border-radius: 6px;
  border: 1.5px solid #232f4b;
  background: #1a237e;
  color: #fff;
  font-size: 1rem;
  margin-bottom: 1em;
  transition: border 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
}

/* Fix select specific styling */
select {
  padding-left: 1em;
  padding-right: 1em;
  text-indent: 0;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23ffffff" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 1em center;
  background-size: 12px;
}

select:focus, input:focus {
  border-color: #43E97B;
  box-shadow: 0 0 0 2px #43e97b44;
}



#nonFichier-input {
  width: 100%;
  padding: 0.7em 0em;
  border-radius: 6px;
  border: 1.5px solid #232f4b;
  background: #1a237e;
  color: #fff;
  font-size: 1rem;
  margin-bottom: 1em;
  transition: border 0.2s, box-shadow 0.2s;
  outline: none;
}

#nonFichier-input:focus {
  border-color: #43E97B;
  box-shadow: 0 0 0 2px #43e97b44;
}





.file-info {
  margin-top: 0.5em;
  display: flex;
  align-items: center;
  gap: 1em;
  color: #43E97B;
}
.file-info button {
  background: none;
  border: none;
  color: #E53935;
  font-weight: 700;
  cursor: pointer;
}

.file-upload-label {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  color: #43E97B !important;
}

.file-selected-text {
  font-size: 1.5rem;
  font-weight: 600;
}
.pdf-btn, .save-btn {
  /* margin-top: 1.2em; */
  background: linear-gradient(90deg, #2196F3 0%, #43E97B 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.8em 1.5em;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.pdf-btn:hover, .save-btn:hover {
  background: linear-gradient(90deg, #43E97B 0%, #2196F3 100%);
}
.save-btn.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}
.pdf-preview {
  margin-top: 2em;
  width: 100%;
  min-height: 400px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 16px 0 #2196f355;
}
.contexte-field {
  margin-bottom: 1.2em;
}
.context-entities {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
  flex-wrap: wrap;
}
.context-entities button {
  border-radius: 5px;
  background: #1a237e;
  color: #fff;
  padding: 0.45em 1.2em;
  font-size: 1rem;
  border: 2px solid #2196f3;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.5em;
  transition: background 0.2s, border 0.2s;
}
.context-entities button.active, .context-entities button:hover {
  background: linear-gradient(90deg, #2196F3 0%, #43E97B 100%);
  color: #fff;
  border: 2px solid #43E97B;
}
ul {
  list-style-type: disc;
  padding-left: 1.8em;
}
@media (max-width: 1200px) {
  .doc-sidebar {
    width: 500px;
  }
  
  .sidebar-table {
    font-size: 0.8rem;
  }
  
  .sidebar-table th,
  .sidebar-table td {
    padding: 0.5em 0.6em;
  }
}

@media (max-width: 900px) {
  .add-doc-root {
    flex-direction: column;
    gap: 0;
  }
  
  .doc-sidebar {
    width: 100vw;
    min-height: 50vh;
    max-height: 70vh;
    border-left: none;
    border-top: 2px solid #232f4b;
    box-shadow: none;
    padding: 1.2em 1em;
    order: 2;
    font-size: 1rem;
  }
  
  .add-doc-main {
    padding: 1.2em 0.5em;
    max-width: 100vw;
    order: 1;
  }
  
  .sidebar-header h3 {
    font-size: 1.2rem;
  }
  
  .section h4 {
    font-size: 1rem;
  }
  
  .table-container {
    max-height: 250px;
  }
  
  .sidebar-table {
    font-size: 0.75rem;
  }
  
  .sidebar-table th,
  .sidebar-table td {
    padding: 0.4em 0.5em;
  }
  
  .add-btn, .remove-btn, .add-director-btn {
    padding: 0.3em 0.6em;
    font-size: 0.75rem;
  }
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
}
.context-stepper select {
  width: 100%;
  padding: 0.1em 1em;
  border-radius: 6px;
  border: 1.5px solid #7ea8e9;
  background: #202a49;
  color: #fff;
  font-size: 1rem;
  margin-bottom: 1em;
  min-height: 90px;
}
.context-stepper label {
  margin-bottom: 0.5em;
  font-weight: 700;
  color: #51ffbf;
}

.context-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.3rem;
}

.back-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8em 1.5em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.back-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.context-header h2 {
  margin: 0;
  color: #43E97B;
}


.substep {
  /* Optionnel : Pour une meilleure visibilité du sous-formulaire */
  background: rgba(80,255,200,0.04);
  border-left: 3px solid #51ffbf;
}





.button-group {
  display: flex;
  gap: 1em; /* Space between buttons */
  justify-content: space-between; /* Align buttons to the left */
  align-items: center; /* Vertically align buttons */
}



.delete-btn {
  background: #f44336; /* Red */
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.8em 1.5em;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  margin-left: 1em;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #e53935;
}





.doc-modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(10,20,50,0.4); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.doc-modal {
  background: #262f4b;
  padding: 2em;
  border-radius: 10px;
  min-width: 1200px;
  max-width: 98vw;
  min-height: 900px;
  max-height: 98vh;
  box-shadow: 0 8px 32px 0 #16213e99;
  color: #e3eafc;
  position: relative;
  overflow-y: auto;
}
.doc-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1em;
}
.close-modal {
  font-size: 2rem;
  background: none;
  color: #e3eafc;
  border: none;
  cursor: pointer;
}
.doc-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}
.doc-table th, .doc-table td {
  border: 2px solid #1662f0;
  padding: 0.5em 0.7em;
  text-align: left;
}
.doc-table tr {
  height: 36px;
}
.view-button, .delete-button , .save-directeur-btn{
  padding: 0.4em 1em;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}
.view-button { background: #29b6f6; color: #fff; border: none; }
.view-button:hover { background: #039be5; }
.view-button { padding: 0.4em 1em; border-radius: 5px; font-weight: 600; cursor: pointer; }
.delete-button { background: #f44336; color: #fff; border: none; }
.delete-button:hover { background: #d32f2f; }
.save-directeur-btn { background: #3aaa49; color: #fff; border: none; }
.save-directeur-btn:hover { background: #3aaa49; }
.modal-loader { color: #51ffbf; font-weight: 700; }



.context-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.1em;
}
.context-card {
  background: #151E21;
  border: 1px solid #43e97b60;
  border-radius: 12px;
  box-shadow: 2px 6px 16px #0003;
  min-width: 360px;
  min-height: 72px;
  flex: 1 0 360px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.2em 1.7em;
}
.context-entity-title {
  font-size: 1.15em;
  font-weight: bold;
  color: #43E97B;
}
.context-actions {
  display: flex;              /* <<< row instead of column */
  flex-direction: row;        /* <<< changed from column */
  gap: 0.7em;                 /* wider gap for clear buttons */
  align-items: center;        /* vertical center */
}
.context-action {
  padding: 0.4em 1em;
  border-radius: 8px;
  border: none;
  background: #353B3F;
  color: #fff;
  cursor: pointer;
  transition: background 0.22s;
  font-size: 0.99em;
}
.context-action.add { background: #43E97B; color: #111; }
.context-action.view { background: #21b8db; }
.context-action.delete { background: #E53935; }
.context-action:hover { filter: brightness(1.17); }
.context-action.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
  filter: none !important;
}

.doc-modal.selected { background-color: #e4f7ed!important; }
.doc-table tr.selected { background: #e8ffe2;}

@media (max-width: 768px) {
  .doc-modal-body {
    flex-direction: column;
  }
}
.selected {
  background-color: #3c4a6b !important; /* or any dark tone that matches your modal */
  color: #e3eafc !important;
}

.doc-table tr:hover {
  background-color: #2f3a56;
}
/* Dropdown styles */
.doc-modal-body {
  max-height: 900px;
  overflow-y: auto; /* Only vertical scrolling for the modal body */
  overflow-x: hidden; /* Prevent horizontal scrolling */
}
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-btn {
  background-color: #2196F3;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 140px;
}

.dropdown-arrow {
  margin-left: 8px;
  font-size: 0.8em;
}

.dropdown-content {
  position: absolute;
  background-color: #1a237e;
  min-width: 250px;
  max-width: 350px;
  max-height: 180px;
  overflow-y: auto;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1000;
  border-radius: 4px;
  right: 0;
  top: 100%;
  margin-top: 2px;
}

.dropdown-item {
  color: #e3eafc;
  padding: 10px 14px;
  text-decoration: none;
  display: block;
  border-bottom: 1px solid #232f4b;
  line-height: 1.4;
}

.dropdown-item:hover {
  background-color: #232f4b;
}

.dropdown-loading, .dropdown-empty {
  color: #e3eafc;
  padding: 8px 12px;
  text-align: center;
  font-style: italic;
}

.dropdown-dates {
  font-size: 0.85em;
  color: #bbdefb;
  margin-top: 2px;
}
.dropdown-container {
  position: relative;
  /* min-height: 30px; */
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 95vw;
  width: 90%;
  max-height: 95vh;
  overflow-y: auto;
}

.pdf-viewer-container {
  width: 100%;
  height: auto;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.cancel {
  margin-left: 10px;
}

.images-preview {
  margin-top: 1em;
  padding: 1em;
  background: rgba(67, 233, 123, 0.1);
  border-radius: 8px;
  border: 1px solid #43E97B;
}

.images-preview h4 {
  color: #43E97B;
  margin-bottom: 0.5em;
  font-size: 1rem;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.image-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em;
  background: rgba(26, 35, 126, 0.5);
  border-radius: 4px;
  color: #e3eafc;
}

.remove-image {
  background: #E53935;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-image:hover {
  background: #d32f2f;
}

.import-btn {
  background: linear-gradient(90deg, #FF9800 0%, #FF5722 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.8em 1.5em;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.import-btn:hover {
  background: linear-gradient(90deg, #FF5722 0%, #FF9800 100%);
}

.import-btn.disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.consulter-btn {
  background: linear-gradient(90deg, #9C27B0 0%, #673AB7 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.8em 1.5em;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.consulter-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #673AB7 0%, #9C27B0 100%);
}

.consulter-btn:disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.7;
}

.files-preview {
  margin-top: 1em;
  padding: 1em;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #FF9800;
}

.files-preview h4 {
  color: #FF9800;
  margin-bottom: 0.5em;
  font-size: 1rem;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em;
  background: rgba(26, 35, 126, 0.5);
  border-radius: 4px;
  color: #e3eafc;
}

.remove-file {
  background: #E53935;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3em 0.8em;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85em;
  transition: background 0.2s;
}

.remove-file:hover {
  background: #d32f2f;
}

.image-viewer, .video-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.document-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  display: block;
  margin: 0 auto 1rem auto;
}

.document-video {
  max-width: 100%;
  max-height: 80vh;
  display: block;
  margin: 0 auto 1rem auto;
}

.image-actions, .video-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

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
  transition: background-color 0.2s;
  min-width: 2.5rem;
  min-height: 2.5rem;
}

.btn:hover:not(.btn-disabled) {
  background-color: #2563eb;
}

.btn-disabled {
  background-color: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

/* NEW CONSULTER PANEL STYLES */
.consulter-panel-wrapper {
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 20px;
  margin: 10px 0;
  border-radius: 8px;
  border: 2px solid #43E97B;
}

.consulter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #43E97B;
}

.consulter-panel-title {
  color: #43E97B;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.consulter-close-btn {
  background: none;
  border: none;
  color: #333;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
}

.consulter-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.consulter-panel-body {
  max-height: 70vh;
  overflow-y: auto;
}

.consulter-loading {
  text-align: center;
  color: #43E97B;
  font-weight: 600;
  padding: 2em;
}

.consulter-error {
  text-align: center;
  color: #E53935;
  padding: 2em;
}

.consulter-section-title {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.1rem;
  font-weight: 600;
}

.consulter-table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.consulter-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.consulter-table th,
.consulter-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.consulter-table th {
  background: #f8f9fa;
  color: #333;
  font-weight: 600;
  position: sticky;
  top: 0;
}

.consulter-table tr:hover {
  background: rgba(67, 233, 123, 0.1);
}

.consulter-view-btn {
  background: #29b6f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}

.consulter-view-btn:hover:not(:disabled) {
  background: #039be5;
}

.consulter-view-btn:disabled {
  background: #888 !important;
  cursor: not-allowed !important;
  opacity: 0.7;
}

.consulter-no-data {
  text-align: center;
  font-style: italic;
  color: #666;
  padding: 2em;
}

/* Success Message Styles */
.success-message-sidebar {
  background: linear-gradient(90deg, #43E97B 0%, #4CAF50 100%);
  color: white;
  padding: 1.5em 2em;
  border-radius: 12px;
  margin-bottom: 1.5em;
  font-weight: 600;
  font-size: 1.2rem;
  text-align: center;
  box-shadow: 0 6px 20px rgba(67, 233, 123, 0.4);
  animation: slideInRight 0.4s ease-out;
  border: 2px solid #4CAF50;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Toast Notification Styles */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  font-size: 14px;
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideInFromRight 0.3s ease-out;
}

.toast:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.toast.success {
  background: linear-gradient(135deg, #4CAF50 0%, #43E97B 100%);
  color: white;
  border-left: 4px solid #2E7D32;
}

.toast.error {
  background: linear-gradient(135deg, #F44336 0%, #E53935 100%);
  color: white;
  border-left: 4px solid #C62828;
}

.toast-icon {
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.toast-message {
  flex: 1;
  line-height: 1.4;
  word-wrap: break-word;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Mobile responsive */
@media (max-width: 480px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
    font-size: 13px;
    padding: 10px 12px;
  }
}

</style>