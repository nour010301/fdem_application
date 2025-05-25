
<template>
  <div class="add-doc-root">
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
   <!-- SIDEBAR: Structure and Context info -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->

    <aside class="doc-sidebar">
  <h3>Arborescence</h3>
  <ul>
    <li v-if="selectedTypeId">
      <span class="arb-label">Type</span>
      <span class="arb-separator">:</span>
      <b>{{ getTypeDesignation(selectedTypeId) }}</b>
    </li>
    <li v-if="selectedProduitId">
      <span class="arb-label">Produit</span>
      <span class="arb-separator">:</span>
      <b>{{ getProduitDesignation(selectedProduitId) }}</b>
    </li>
    <li v-if="selectedStructureId">
      <span class="arb-label">Structure</span>
      <span class="arb-separator">:</span>
      <b>{{ getStructureDesignation(selectedStructureId) }}</b>
    </li>
    <li v-if="selectedSectionId">
      <span class="arb-label">Section</span>
      <span class="arb-separator">:</span>
      <b>{{ getSectionDesignation(selectedSectionId) }}</b>
    </li>
    <li v-if="selectedDivisionId">
      <span class="arb-label">Division Niv. 1</span>
      <span class="arb-separator">:</span>
      <b>{{ getDivisionDesignation(selectedDivisionId) }}</b>
    </li>
    <li v-if="requiresSubDiv2 && selectedSubDiv2Id">
      <span class="arb-label">Subdivision Niv. 2</span>
      <span class="arb-separator">:</span>
      <b>{{ getSubDiv2Designation(selectedSubDiv2Id) }}</b>
    </li>
    <li v-if="selectedSubDiv3Id">
      <span class="arb-label">Subdivision Niv. 3</span>
      <span class="arb-separator">:</span>
      <b>{{ getSubDiv3Designation(selectedSubDiv3Id) }}</b>
    </li>
    <li v-if="nonFichier">
      <span class="arb-label">Nom fichier</span>
      <span class="arb-separator">:</span>
      <b>{{ nonFichier }}</b>
    </li>
    <li v-if="uploadedFile">
      <span class="arb-label">Fichier</span>
      <span class="arb-separator">:</span>
      <b>{{ uploadedFile?.name }}</b>
    </li>

    <!-- CONTEXTE -->
    <template v-if="mode === 'contexte'
      || selectedBureauxEtudes.length > 0
      || selectedFournisseurs.length > 0
      || selectedMaitresOeuvre.length > 0
      || selectedMaitresOuvrage.length > 0
      || selectedSoustraitants.length > 0
      || selectedProjets.length > 0">
      <li style="margin-top:1.5em;">
        <span class="arb-label" style="color:#43E97B">Contexte</span>
        <span class="arb-separator" style="color:#43E97B">:</span>
      </li>
      <ul style="margin-bottom:0;">
        <li v-if="selectedBureauEtudeNoms.length">
          <span class="arb-label">Bureaux Études</span>
          <span class="arb-separator">:</span>
          <b>{{ selectedBureauEtudeNoms.join(', ') }}</b>
        </li>
        <li v-if="selectedFournisseurNoms.length">
          <span class="arb-label">Fournisseurs</span>
          <span class="arb-separator">:</span>
          <b>{{ selectedFournisseurNoms.join(', ') }}</b>
        </li>
        <li v-if="selectedMaitreOeuvreNoms.length">
          <span class="arb-label">Maîtres d'Œuvre</span>
          <span class="arb-separator">:</span>
          <b>{{ selectedMaitreOeuvreNoms.join(', ') }}</b>
        </li>
        <li v-if="selectedMaitreOuvrageNoms.length">
          <span class="arb-label">Maîtres d'Ouvrage</span>
          <span class="arb-separator">:</span>
          <b>{{ selectedMaitreOuvrageNoms.join(', ') }}</b>
        </li>
        <li v-if="selectedSoustraitantNoms.length">
          <span class="arb-label">Soustraitants</span>
          <span class="arb-separator">:</span>
          <b>{{ selectedSoustraitantNoms.join(', ') }}</b>
        </li>
        <li v-if="selectedProjetNoms.length">
          <span class="arb-label">Projets</span>
          <span class="arb-separator">:</span>
          <b>{{ selectedProjetNoms.join(', ') }}</b>
        </li>
      </ul>
    </template>
  </ul>
</aside>
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
   <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
   <!-- Main -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->

    <div class="add-doc-main">
      <h1>Créer un document</h1>
      <!-- MODE Switch -->
      <div v-if="selectedTypeId && selectedProduitId" class="step">
        <label>Mode</label>
        <div class="mode-switch">
          <button :class="{ active: mode === 'structure' }" @click="mode = 'structure'" type="button">Structure</button>
          <button :class="{ active: mode === 'contexte' }" @click="mode = 'contexte'" type="button">Contexte</button>
        </div>
      </div>
      <!-- STRUCTURE MODE FORM -->
      <form v-if="mode === 'structure'" class="structure-step-form" @submit.prevent="submitForm">
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
        <!-- <div class="step" v-if="selectedProduitId" ">
          <label for="designation">Désignation</label>
          <input id="designation" v-model="designation" type="text" />
        </div> -->

        <div class="step" v-if="selectedProduitId">
          <label for="structure">Structure</label>
          <select id="structure" v-model="selectedStructureId">
            <option value="" disabled>Choisir une structure</option>
            <option v-for="structure in structures" :key="structure.idStructure" :value="structure.idStructure">
              {{ structure.designation }}
            </option>
          </select>
        </div>
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
          <label for="division-nv1">Division Niveau 1</label>
          <select id="division-nv1" v-model="selectedDivisionId" :disabled="!divisionsNv1.length">
            <option value="" disabled>Choisir une division</option>
            <option v-for="div in divisionsNv1" :key="div.idSubDivisionNv_1" :value="div.idSubDivisionNv_1">
              {{ div.nom }}
            </option>
          </select>
        </div>
        <div class="step" v-if="selectedDivisionId && requiresSubDiv2">
          <label for="subdivision-nv2">Subdivision Niveau 2</label>
          <select id="subdivision-nv2" v-model="selectedSubDiv2Id">
            <option value="" disabled>Choisir une sous-division</option>
            <option v-for="item in filteredSubDiv2List" :key="item.idSubDivisionNv_2.idSubDivisionNv_2" :value="item.idSubDivisionNv_2.idSubDivisionNv_2">
              {{ item.idSubDivisionNv_2.nom }}
            </option>
          </select>
        </div>
        <div class="step" v-if="requiresSubDiv2 && selectedSubDiv2Id">
          <label for="subdivision-nv3">Subdivision Niveau 3</label>
          <select id="subdivision-nv3" v-model="selectedSubDiv3Id">
            <option value="" disabled>Choisir une sous-division Niv. 3</option>
            <option v-for="item in filteredSubDiv3List" :key="item.idSubDivisionNv_3.idSubDivisionNv_3" :value="item.idSubDivisionNv_3.idSubDivisionNv_3">
              {{ item.idSubDivisionNv_3.nom }}
            </option>
          </select>
        </div>
        <p v-if="!isSubDivAllowed && selectedDivisionId" style="color: #E53935;">
          Cette subdivision ne permet pas la création de documents.
        </p>

        <div
          class="button-group"
          v-if="isSubDivAllowed && (
            (requiresSubDiv2 && selectedSubDiv2Id) ||
            (!requiresSubDiv2 && selectedDivisionId) ||
            (requiresSubDiv2 && selectedSubDiv3Id)
          )"
        >
          <button class="save-btn" type="button" @click="openDocModal('create')">Ajouter Document</button>
          <button class="consult-btn" type="button" @click="openDocModal('consult')">Consulter Document</button>
          <!-- <button class="delete-btn" type="button" @click="openDocModal('delete')">Supprimer Document</button> -->
        </div>
      </form>
      <!-- CONTEXT MODE FORM: Multi-directeurs per project and date -->
      <!-- CONTEXT MODE FORM: Multi-directeurs per project and date -->
<div v-if="mode === 'contexte'" class="step context-stepper">
  <h2>Sélection du Contexte</h2>
  <div class="context-cards">
    <div
      v-for="entity in contextEntities"
      :key="entity.key"
      class="context-card"
    >
      <span class="context-entity-title">{{ entity.label }}</span>
      <div class="context-actions">
        <button @click="onAjouter(entity.key)" class="context-action add">+ Ajouter</button>
        <button @click="onConsulterFunction(entity.key)" class="context-action view">Consulter</button>
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
<!-- ADD: Contexte Ajouter Modal -->
  <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->



<!-- ADD: Contexte Ajouter Modal -->
<div v-if="contextAjouter.visible" class="doc-modal-backdrop">
  <div class="doc-modal" style="width: 90vw; max-height: 90vh; overflow-y: auto; font-size: 1.25rem;">
    <div class="doc-modal-header">
      <h3 style="font-size: 1.6rem;">
        Ajouter {{ contextAjouter.entityLabel }}
      </h3>
      <button @click="closeContextAjouterModal" class="close-modal" style="font-size:1.5em;">&times;</button>
    </div>
    <div class="doc-modal-body" style="display: flex; gap: 1em; flex-wrap: wrap;">
      <!-- LEFT: Selected Table -->
      <div style="flex:1 1 25%;">
        <h4 style="font-size: 1.15em;">Votre sélection</h4>
        <table class="doc-table" style="font-size:1em;">
          <thead>
            <tr>
              <th v-for="header in contextAjouter.columns" :key="header">{{ header }}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in contextAjouter.selected" :key="item[contextAjouter.idCol]">
              <td v-for="col in contextAjouter.columnKeys" :key="col">{{ item[col] }}</td>
              <td>
                <button class="delete-button" @click="removeFromSelected(contextAjouter.entityKey, item)" style="font-size:1em;">Enlever</button>
                <!-- Add button for adding directors in the left table -->
                <button
                  v-if="contextAjouter.entityKey === 'maitre_ouvrage' || contextAjouter.entityKey === 'maitre_oeuvre' || contextAjouter.entityKey === 'bet_soustraitants_etudes'"
                  class="save-btn"
                  @click="openDirecteurModal(item)"
                  style="font-size:1em;"
                >Ajouter Directeur</button>
              </td>
            </tr>
            <tr v-if="!contextAjouter.selected.length">
              <td :colspan="contextAjouter.columns.length + 1" style="text-align:center; font-style:italic;">
                Aucune sélection pour l'instant.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- RIGHT: All Items Table (scrollable 10 rows max)-->
      <div style="flex:1 1 55%;">
        <h4 style="font-size: 1.15em;">{{ contextAjouter.entityLabel }} disponibles</h4>
        <table class="doc-table" style="font-size:1em;">
          <thead>
            <tr>
              <th v-for="header in contextAjouter.columns" :key="header">{{ header }}</th>
              <th></th>
            </tr>
          </thead>
        </table>
        <div style="max-height: 430px; overflow-y: auto;">
          <table class="doc-table" style="margin: 0; font-size:1em;">
            <tbody>
              <tr
                v-for="item in contextAjouter.all"
                :key="item[contextAjouter.idCol]"
                :class="{ selected: isAlreadySelected(contextAjouter.entityKey, item) }"
                style="cursor: pointer;"
              >
                <td v-for="col in contextAjouter.columnKeys" :key="col">{{ item[col] }}</td>
                <td>
                  <button
                    class="save-btn"
                    @click="addToSelected(contextAjouter.entityKey, item)"
                    :disabled="isAlreadySelected(contextAjouter.entityKey, item) || (!getEntityConfig(contextAjouter.entityKey)?.allowMultiple && contextAjouter.selected.length >= 1)"
                    style="font-size:1em;"
                  >Ajouter</button>
                </td>
              </tr>
              <tr v-if="!contextAjouter.all.length">
                <td :colspan="contextAjouter.columns.length + 1" style="text-align:center; font-style:italic;">
                  Aucun élément à afficher.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="doc-modal-footer" style="text-align:right; margin-top:1em;">
      <button class="save-btn" @click="saveSelectedContextEntities" style="font-size:1em;">Valider sélection</button>
    </div>
  </div>
</div>

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


 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<!-- Consulter context modal  -->
  <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
 <!-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
  <div v-if="contextConsulter.visible" class="doc-modal-backdrop">
  <div class="doc-modal" style="min-width:700px;min-height:350px">
    <div class="doc-modal-header">
      <h3>
        Consulter - {{ contextConsulter.entityLabel }}
      </h3>
      <button @click="closeContextConsulterModal" class="close-modal">&times;</button>
    </div>
    <div class="doc-modal-body" style="max-height:420px; overflow-x:auto;">
      <div v-if="contextConsulter.loading">Chargement...</div>
      <div v-else-if="contextConsulter.error" style="color:red;">{{ contextConsulter.error }}</div>
      <div v-else>
        <table v-if="contextConsulter.data.length" class="doc-table">
          <thead>
            <tr>
              <th v-for="col in contextConsulter.columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in contextConsulter.data" :key="row[contextConsulter.columnKeys[0]]">
              <td v-for="colKey in contextConsulter.columnKeys" :key="colKey">{{ row[colKey] ?? '-' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!contextConsulter.data.length" style="text-align:center; font-style:italic;">
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
        <div style="max-height: 370px; overflow-y: auto; margin-bottom: 0.6em;" v-if="docList.length">
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
          <label for="file-upload">Fichier (PDF ou TXT)</label>
          <input id="file-upload" type="file" accept=".pdf,.txt" @change="onFileChange" />
          <div v-if="uploadedFile" class="file-info">
            <span>Fichier sélectionné: {{ uploadedFile.name }}</span>
            <button @click="uploadedFile = null" type="button">Retirer</button>
          </div>
        </div>
        <button class="save-btn" @click="submitForm" style="margin-top:1em;">Ajouter Document</button>
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

// const API_BASE = 'http://10.10.150.75:8000/api'


// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//  script part for doc structuree
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

const typeProduits = ref<any[]>([])
const produits = ref<any[]>([])
const sections = ref<any[]>([])
const structures = ref<any[]>([])
const divisionsNv1 = ref<any[]>([])
const allSubDivs1Et2 = ref<any[]>([])
const allSubDivs2Et3 = ref<any[]>([])

const selectedTypeId = ref<number | null>(null)
const selectedProduitId = ref<number | null>(null)
const selectedSectionId = ref<number | null>(null)
const selectedStructureId = ref<number | null>(null)
const selectedDivisionId = ref<number | null>(null)
const selectedSubDiv2Id = ref<number | null>(null)
const selectedSubDiv3Id = ref<number | null>(null)

const nonFichier = ref<string>('')
const uploadedFile = ref<File | null>(null)


// Initial fetch
onMounted(async () => {
  try {
    const [typesRes, structuresRes, subDivsRes, subDivs3Res] = await Promise.all([
      // axios.get(`${API_BASE}/types/`),
      axios.get(`types/`),
      axios.get(`structures/`),
      axios.get(`subdiv1et2/`),
      axios.get(`subdiv2et3/`)
    ])
    typeProduits.value = typesRes.data
    structures.value = structuresRes.data
    allSubDivs1Et2.value = subDivsRes.data
    allSubDivs2Et3.value = subDivs3Res.data
  } catch (error) {
    console.error('Erreur lors du chargement initial', error)
  }
})

watch(selectedTypeId, async (newTypeId) => {
  selectedProduitId.value = null
  selectedSectionId.value = null
  produits.value = []
  sections.value = []
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

watch(selectedStructureId, async (newStructureId) => {
  selectedDivisionId.value = null
  divisionsNv1.value = []
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
  return !!selectedSubDiv3Id.value
})

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) uploadedFile.value = files[0]
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
function getSubDiv2Designation(id: number | null) {
  return filteredSubDiv2List.value.find(i => i.idSubDivisionNv_2.idSubDivisionNv_2 === id)?.idSubDivisionNv_2.nom || ''
}
function getSubDiv3Designation(id: number | null) {
  return filteredSubDiv3List.value.find(i => i.idSubDivisionNv_3.idSubDivisionNv_3 === id)?.idSubDivisionNv_3.nom || ''
}

async function submitForm() {
  const formData = new FormData();
  formData.append('idTypeProduit', String(selectedTypeId.value || ''));
  formData.append('idProduit', String(selectedProduitId.value || ''));
  formData.append('idStructure', String(selectedStructureId.value || ''));
  formData.append('idSection', String(selectedSectionId.value || ''));
  formData.append('idSubDivisionNv_1', String(selectedDivisionId.value || ''));
  formData.append('idSubDivisionNv_2', String(selectedSubDiv2Id.value || ''));
  formData.append('idSubDivisionNv_3', String(selectedSubDiv3Id.value || ''));
  formData.append('typeProduitDesignation', getTypeDesignation(selectedTypeId.value) || '');
  formData.append('produitDesignation', getProduitDesignation(selectedProduitId.value) || '');
  formData.append('structureNom', getStructureDesignation(selectedStructureId.value) || '');
  formData.append('sectionNom', getSectionDesignation(selectedSectionId.value) || '');
  formData.append('subDivisionNv1Nom', getDivisionDesignation(selectedDivisionId.value) || '');
  formData.append('subDivisionNv3Nom', getSubDiv3Designation(selectedSubDiv3Id.value) || '');
  formData.append('designation', nonFichier.value || '');
  formData.append('chemin', ' No chemin'); // You can modify this as needed
  formData.append('version', ''); // You can modify this as needed
  formData.append('dateCreation', ''); // Use an empty string instead of null
  formData.append('dateModification', ''); // Use an empty string instead of null
  if (uploadedFile.value) {
    formData.append('fichier_pdf', uploadedFile.value);
  }

  try {
    const response = await axios.post('documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert('Document créé avec succès!');
    console.log(response.data);
  } catch (error) {
    console.error('Erreur lors de la création du document', error);
    alert('Erreur lors de la création du document');
  }
}

// DOC TABLE POPUP MODAL
const showDocModal = ref(false);
const docModalMode = ref<'create'|'consult'|'delete'|''>('');
const loadingDocs = ref(false);
const docList = ref<any[]>([]);
const docModalError = ref('');


interface Document {
  fichier_pdf?: string | null
}


























// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//  script part for Context
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


type ContextEntityKey =
  | 'projet'
  | 'maitre_ouvrage'
  | 'maitre_oeuvre'
  | 'soustraitants_tvx'
  | 'fournisseur'
  | 'bet_soustraitants_etudes'
  | 'direction_projet';

interface ContextEntityConfig {
  label: string;
  api: string;
  idCol: string;
  columns: string[];
  columnKeys: string[];
  listRef: any;
  selectedRef: any;
  allowMultiple: boolean;
}


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
const contextConsulterEntityConfig = {
  projet: {
    label: "Projet",
    endpoint: (produitId: number) => `projets/by-produit/${produitId}`,
    columns: ["ID", "Description", "Adresse", "Wilaya"],
    columnKeys: ["idProjet", "description", "adresse", "wilaya"]
  },
  fournisseur: {
    label: "Fournisseur",
    endpoint: (produitId: number) => `fournisseur/by-produit/${produitId}`,
    columns: ["ID", "Désignation", "Description", "Adresse", "Téléphone", "Email"],
    columnKeys: ["idFournisseur", "designationFournisseur", "description", "adresse", "telephone", "email"]
  },
  maitre_oeuvre: {
    label: "Maître d'Œuvre",
    endpoint: (produitId: number) => `/moe/by-produit/${produitId}`,
    columns: ["ID", "Désignation", "Description", "Adresse", "Email"],
    columnKeys: ["idMaitreOeuvre", "designationMO", "description", "adresse", "email"]
  },
  maitre_ouvrage: {
    label: "Maître d'Ouvrage",
    endpoint: (produitId: number) => `moa/by-produit/${produitId}`,
    columns: ["ID", "Désignation", "Description", "Adresse", "Email"],
    columnKeys: ["idMaitreOuvrage", "designationMOg", "description", "adresse", "email"]
  },
  soustraitants_tvx: {
    label: "Soustraitants Travaux",
    endpoint: (produitId: number) => `soustraitants/by-produit/${produitId}`,
    columns: ["ID", "Désignation", "Description", "Adresse", "Téléphone", "Email"],
    columnKeys: ["idSoustraitants", "designationStt", "description", "adresse", "telephone", "email"]
  },
  bet_soustraitants_etudes: {
    label: "BET Soustraitants Études",
    endpoint: (produitId: number) => `bet/by-produit/${produitId}`,
    columns: ["ID", "Nom", "Description", "Adresse", "Téléphone", "Email"],
    columnKeys: ["idBET", "nom", "description", "adresse", "telephone", "email"]
  },
  direction_projet: {
    label: "Direction du Projet",
    endpoint: (projetId: number) => `directions-projets/by-projet/${projetId}`,
    columns: ["ID", "Nom", "Fonction", "Téléphone"],
    columnKeys: ["idDirecteur", "nomPrenomDirecteur", "fonction", "telephone"]
  }
};


// --- Function to open the consulter popup and fetch data ---
async function onConsulterFunction(entityKey: string) {
  const config = contextConsulterEntityConfig[entityKey as keyof typeof contextConsulterEntityConfig];
  if (!config) {
    alert(`Consulter config manquante pour: ${entityKey}`);
    return;
  }

  // Check if the entity is 'direction_projet' and if a project is selected
  if (entityKey === 'direction_projet') {
    if (!selectedProjets.value.length) {
      alert("Veuillez d'abord sélectionner un projet.");
      return;
    }
    contextConsulter.value.loading = true;
    contextConsulter.value.error = '';
    contextConsulter.value.entityKey = entityKey;
    contextConsulter.value.entityLabel = config.label;
    contextConsulter.value.columns = config.columns;
    contextConsulter.value.columnKeys = config.columnKeys;
    contextConsulter.value.data = [];

    try {
      const { data } = await axios.get(config.endpoint(selectedProjets.value[0].idProjet));
      let rows = Array.isArray(data) ? data : [data];
      contextConsulter.value.data = rows;
    } catch (e) {
      contextConsulter.value.error = "Erreur lors du chargement des données.";
      contextConsulter.value.data = [];
    } finally {
      contextConsulter.value.loading = false;
    }
  } else {
    if (!selectedProduitId.value) {
      alert("Veuillez d'abord sélectionner un produit.");
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
      const { data } = await axios.get(config.endpoint(selectedProduitId.value));
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
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idProjet: item.idProjet }),
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
    endpoint: '/contexte-bet/',
    getPayload: (item: any) => ({ idProduit: selectedProduitId.value, idBet: item.idBET }),
  },
  direction_projet: {
    endpoint: '/projets-directeurs/',
    getPayload: (item: any) => ({ idProjet: selectedProjets.value[0]?.idProjet, idDirecteur: item.idDirecteur }),
  }
};

// Helper: check column key by 'columns' header for confirm table
// Helper: check column key by 'columns' header for confirm table
function getColKeyByHeader(header: string) {
  const idx = contextDelete.value.columns.indexOf(header);
  return idx !== -1 ? contextDelete.value.columnKeys[idx] : header;
}


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

const contextSelectedEntitiesApi = {
  projet: (produitId: number) => `projets/by-produit/${produitId}`,
  maitre_ouvrage: (produitId: number) => `moa/by-produit/${produitId}`,
  maitre_oeuvre: (produitId: number) => `moe/by-produit/${produitId}`,
  fournisseur: (produitId: number) => `fournisseur/by-produit/${produitId}`,
  soustraitants_tvx: (produitId: number) => `soustraitants/by-produit/${produitId}`,
  bet_soustraitants_etudes: (produitId: number) => `bet/by-produit/${produitId}`,
  direction_projet: (projetId: number) => `directeurs-by-projet/${projetId}`,
};

// Helper: returns which param is needed per entity
function getSelectedApiParam(entityKey: string): { produit?: number; projet?: number } {
  if (entityKey === 'direction_projet') {
    const idProjet = selectedProjets.value[0]?.idProjet;
    return { projet: typeof idProjet === 'number' ? idProjet : undefined };
  }
  return { produit: typeof selectedProduitId.value === 'number' ? selectedProduitId.value : undefined };
}

// Modify the onAjouter function
async function onAjouter(entityKey: string) {
  const config = contextEntitiesConfig[entityKey as keyof typeof contextEntitiesConfig];
  if (!config) {
    alert(`Config manquante pour: ${entityKey}`);
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
      alert("Erreur lors du chargement des " + config.label);
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
      const url = produit !== undefined ? selectedApi(produit) : selectedApi(projet!);
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
          payload = { idProduit: selectedProduitId.value, idSoustraitant: item.idSoustraitant };
          break;
        case 'fournisseur':
          endpoint = 'contexte-fournisseur';
          payload = { idProduit: selectedProduitId.value, idFournisseur: item.idFournisseur };
          break;
        case 'bet_soustraitants_etudes':
          endpoint = 'contexte-bet';
          payload = { idProduit: selectedProduitId.value, idBet: item.idBet };
          break;
        case 'direction_projet':
          endpoint = 'projets-directeurs';
          payload = {
            idProjet: selectedProjets.value[0]?.idProjet,
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
      alert("Erreur lors de l'ajout de l'entité.");
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
        payload = { idProduit: selectedProduitId.value, idSoustraitant: item.idSoustraitant };
        break;
      case 'fournisseur':
        endpoint = 'contexte-fournisseur';
        payload = { idProduit: selectedProduitId.value, idFournisseur: item.idFournisseur };
        break;
      case 'bet_soustraitants_etudes':
        endpoint = 'contexte-bet';
        payload = { idProduit: selectedProduitId.value, idBet: item.idBet };
        break;
      case 'direction_projet':
        endpoint = 'projets-directeurs';
        payload = {
          idProjet: selectedProjets.value[0]?.idProjet,
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
    alert("Erreur lors de la suppression de l'entité.");
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
});

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
      case 'direction_projet':
        payload = {
          idProjet: selectedProjets.value[0]?.idProjet,
          idDirecteurs: directeurModal.value.idEntity,
          date_debut: directeurModal.value.date_debut,
          date_fin: directeurModal.value.date_fin,
        };
        endpoint = 'projets-directeurs';
        break;
      default:
        alert("Type d'entité non pris en charge pour l'ajout d'un directeur.");
        return;
    }

    await axios.post(`/${endpoint}/`, payload);
    alert("Directeur ajouté avec succès !");
    closeDirecteurModal();
  } catch (e) {
    alert("Erreur lors de l'ajout du directeur.");
  }
}




















const contextBulkCreateConfig = {
  fournisseur: {
    url: `contexte-fournisseur/bulk-create/`,
    listKey: "idFournisseurs",
    extractIds: (selected: any[]) => selected.map(x => x.idFournisseur),
  },
  projet: {
    url: `contexte-projet/bulk-create/`,
    listKey: "idProjets",
    extractIds: (selected: any[]) => selected.map(x => x.idProjet),
  },
  soustraitants_tvx: {
    url: `contexte-soustraitant/bulk-create/`,
    listKey: "idSoustraitants",
    extractIds: (selected: any[]) => selected.map(x => x.idSoustraitant),
  },
  maitre_ouvrage: {
    url: `contexte-moa/bulk-create/`,
    listKey: "idMaitresOuvrage",
    extractIds: (selected: any[]) => selected.map(x => x.idMaitreOuvrage),
  },
  maitre_oeuvre: {
    url: `contexte-moe/bulk-create/`,
    listKey: "idMaitresOeuvre",
    extractIds: (selected: any[]) => selected.map(x => x.idMaitreOeuvre),
  },
  bet_soustraitants_etudes: {
    url: `contexte-bureau-etude/bulk-create/`,
    listKey: "idBETs",
    extractIds: (selected: any[]) => selected.map(x => x.idBetSoustraitant ?? x.idBET ?? x.idBureauEtude), // cover all possible
  },
};

// Utility to bulk-create context links for entity
async function saveEntityBulkContext(entityKey: string) {
  const cfg = contextBulkCreateConfig[entityKey as keyof typeof contextBulkCreateConfig];
  if (!cfg) {
    alert("Aucune configuration de bulk-create pour cette entité.");
    return;
  }
  // Defensive: always grab entities from the modal (user may not have closed yet)
  const selected = [...contextAjouter.value.selected];
  // Defensive: only ids, skip null/undefined
  const ids = cfg.extractIds(selected).filter(id => id != null);

  if (!selectedProduitId.value || ids.length === 0) {
    alert("Merci de sélectionner un produit et au moins un élément.");
    return;
  }
  // Compose payload
  const payload: Record<string, any> = {
    idProduit: selectedProduitId.value,
    [cfg.listKey]: ids,
  };
  try {
    await axios.post(cfg.url, payload);
    alert("Contexte enregistré avec succès !");
    closeContextAjouterModal();
  } catch (err) {
    alert("Erreur lors de l'enregistrement du contexte.");
    // You can log/log-to-console
  }
}

// Update your saveSelectedContextEntities to call the above function
function closeContextAjouterModal() {
  contextAjouter.value.visible = false
}



// Prevent double-adding
function isAlreadySelected(entityKey: string, item: any) {
  const config = contextEntitiesConfig[entityKey as keyof typeof contextEntitiesConfig];
  if (!config) return false;
  return config.selectedRef.value.some((i: any) => i[config.idCol] === item[config.idCol]);
}

// Save user's selection (and close modal)
// Simplify the saveSelectedContextEntities function
function saveSelectedContextEntities() {
  alert("Les entités sont enregistrées automatiquement.");
  closeContextAjouterModal();
}

async function onSupprimer(entityKey: string) {
  const entityDef = contextConsulterEntityConfig[entityKey as keyof typeof contextConsulterEntityConfig];
  const entityDeleteDef = contextEntityDeleteConfig[entityKey as keyof typeof contextEntityDeleteConfig];

  // Basic validation: entity configuration must exist
  if (!entityDef || !entityDeleteDef) {
    alert('Suppression non supportée pour cette entité: ' + entityKey);
    return;
  }

  // Special case: All entities (except 'direction_projet') require a selected produit
  if (entityKey !== 'direction_projet' && (selectedProduitId.value === null || selectedProduitId.value === undefined)) {
    alert("Veuillez d'abord sélectionner un produit.");
    return;
  }

  // Prepare modal state
  contextDelete.value.entityKey = entityKey;
  contextDelete.value.entityLabel = entityDef.label;
  contextDelete.value.columns = entityDef.columns;
  contextDelete.value.columnKeys = entityDef.columnKeys;
  contextDelete.value.idCol = entityDef.columnKeys[0];
  contextDelete.value.data = [];
  contextDelete.value.error = '';
  contextDelete.value.loading = true;
  contextDelete.value.visible = true;
  contextDelete.value.confirmItem = null;

  try {
    let rows: any[] = [];

    // Special handling for 'direction_projet'
    if (entityKey === 'direction_projet') {
      if (!selectedProjets.value.length) {
        throw new Error('Sélectionnez un projet avant');
      }

      const idProjet = selectedProjets.value[0].idProjet;
      const res = await axios.get(`directeurs-by-projet/${idProjet}`);
      rows = Array.isArray(res.data) ? res.data : [res.data];

    } else {
      // Safe assertion here because we validated selectedProduitId is not null
      const produitId = selectedProduitId.value!;
      const res = await axios.get(entityDef.endpoint(produitId));
      rows = Array.isArray(res.data) ? res.data : [res.data];
    }

    contextDelete.value.data = rows;

  } catch (e: any) {
    contextDelete.value.error = 'Erreur lors du chargement des données : ' + (e?.message || '');
    contextDelete.value.data = [];
  } finally {
    contextDelete.value.loading = false;
  }
}


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
    alert('Elément supprimé avec succès');
  } catch(e:any) {
    alert('Erreur lors de la suppression: ' + (e?.message || ''));
  } finally {
    contextDelete.value.loading = false;
  }
}



async function fetchDocListForCurrentSelection() {
  // Only fetch if essential IDs are selected
  if (!selectedTypeId.value || !selectedProduitId.value || !selectedStructureId.value || !selectedSectionId.value || !selectedDivisionId.value) {
    docList.value = [];
    return;
  }
  loadingDocs.value = true;
  docModalError.value = '';
  try {
    // Compose filter query params
    let payload:any = {
      idTypeProduit: selectedTypeId.value,
      idProduit: selectedProduitId.value,
      idStructure: selectedStructureId.value,
      idSection: selectedSectionId.value,
      idSubDivisionNv_1: selectedDivisionId.value,
    };
    if (requiresSubDiv2.value && selectedSubDiv2Id.value) {
      payload.idSubDivisionNv_2 = selectedSubDiv2Id.value;
    }
    if (requiresSubDiv2.value && selectedSubDiv3Id.value) {
      payload.idSubDivisionNv_3 = selectedSubDiv3Id.value;
    }
    // POST is safer for body, but use GET if API only supports GET with params
    const { data } = await axios.get(`documentsFilter/`, payload);
    docList.value = data;
  } catch(e) {
    docModalError.value = "Erreur lors du chargement des documents.";
    docList.value = [];
  } finally {
    loadingDocs.value = false;
  }
}

function openDocModal(mode: 'create'|'consult'|'delete') {
  docModalMode.value = mode;
  showDocModal.value = true;
  fetchDocListForCurrentSelection();
}

function closeDocModal() {
  showDocModal.value = false;
  docModalError.value = '';
}
async function handleDeleteDocument(document: any) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
  try {
    await axios.delete(`documents/${document.idDocument}`);
    alert("Document supprimé !");
    fetchDocListForCurrentSelection();
  } catch (e) {
    alert("Erreur lors de la suppression.");
  }
}

function viewDocument(document: Document) {
  if (document.fichier_pdf) {
    window.open(`${document.fichier_pdf}`, '_blank')
  }
}

// ==== Context directors logic: string keys for TS safety ====
const mode = ref<'structure' | 'contexte' | ''>('structure')

const loadingContexteLists = ref(false)
const bureauxEtudesList   = ref<any[]>([])
const fournisseursList    = ref<any[]>([])
const maitresOeuvreList   = ref<any[]>([])
const maitresOuvrageList  = ref<any[]>([])
const soustraitantsList   = ref<any[]>([])
const projetsList         = ref<any[]>([])
const directionsProjetsList = ref<any[]>([])
const selectedBureauxEtudes   = ref<any[]>([])
const selectedFournisseurs    = ref<any[]>([])
const selectedMaitresOeuvre   = ref<any[]>([])
const selectedMaitresOuvrage  = ref<any[]>([])
const selectedSoustraitants   = ref<any[]>([])
const selectedProjets         = ref<any[]>([])
const selectedDirectionsProjets = ref<any[]>([])
const contexteFormSubmitted = ref(false)
const directionsProjets = ref<Record<string, any[]>>({})


const projectDirectorsForm = ref<Record<string, {
  selectedDirecteurs: any[],
  dates: Record<string, { dateDebut: string, dateFin: string }>
}>>({});


const fetchDirectionsForProjet = async (idProjet: number) => {
  const pid = String(idProjet)
  try {
    const res = await axios.get(`directions-projets/?projet=${idProjet}`)
    directionsProjets.value[pid] = res.data
  } catch {
    directionsProjets.value[pid] = []
  }
}

const handleProjectSelection = async () => {
  for (const projet of selectedProjets.value) {
    const pid = String(projet.idProjet)
    if (!directionsProjets.value[pid]) {
      await fetchDirectionsForProjet(projet.idProjet)
    }
    if (!projectDirectorsForm.value[pid]) {
      projectDirectorsForm.value[pid] = {
        selectedDirecteurs: [],
        dates: {}
      }
    }
  }
  const selectedIds = selectedProjets.value.map((p: any) => String(p.idProjet))
  for (const pid of Object.keys(projectDirectorsForm.value)) {
    if (!selectedIds.includes(pid)) {
      delete projectDirectorsForm.value[pid]
    }
  }
  for (const pid of Object.keys(directionsProjets.value)) {
    if (!selectedIds.includes(pid)) {
      delete directionsProjets.value[pid]
    }
  }
}



watch(selectedProjets, handleProjectSelection, { immediate: false })

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

function resetContexteForm() {
  selectedBureauxEtudes.value = []
  selectedFournisseurs.value = []
  selectedMaitresOeuvre.value = []
  selectedMaitresOuvrage.value = []
  selectedSoustraitants.value = []
  selectedProjets.value = []
  contexteFormSubmitted.value = false
  pdfUrl.value = null
  directionsProjets.value = {}
  projectDirectorsForm.value = {}
}

watch(mode, async (val) => {
  if (val === 'contexte') {
    loadingContexteLists.value = true
    resetContexteForm()
    try {
      const [
        betRes,
        fourRes,
        moeurRes,
        mouvRes,
        sttRes,
        projetsRes
      ] = await Promise.all([
        axios.get(`bureaux-etudes/`),
        axios.get(`fournisseurs/`),
        axios.get(`maitres-oeuvre/`),
        axios.get(`maitres-ouvrage/`),
        axios.get(`Soustraitants/`),
        axios.get(`projets/`),
         axios.get(`directions-projets/`)
      ])
      bureauxEtudesList.value  = betRes.data
      fournisseursList.value   = fourRes.data
      maitresOeuvreList.value  = moeurRes.data
      maitresOuvrageList.value = mouvRes.data
      soustraitantsList.value  = sttRes.data
      projetsList.value        = projetsRes.data
      directionsProjetsList.value = projetsRes.data // Assuming same endpoint for directions
    } catch (e) {
      alert("Erreur de chargement des listes de contexte.")
    } finally {
      loadingContexteLists.value = false
    }
  }
  if (val === 'structure') resetContexteForm()
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




const pdfUrl = ref<string | null>(null)
async function generateContextPdfV2() {
  const html2pdf = (await import('html2pdf.js')).default
  let html = `
    <h2 style="color:#16213e;">Résumé du contexte</h2>
    <ul>
      <li><b>Bureau(x) d'Études:</b> ${selectedBureauxEtudes.value.map(b => b.nom).join(", ")}</li>
      <li><b>Fournisseur(s):</b> ${selectedFournisseurs.value.map(f => f.designationFournisseur).join(", ")}</li>
      <li><b>Maître(s) d'Œuvre:</b> ${selectedMaitresOeuvre.value.map(m => m.designationMO).join(", ")}</li>
      <li><b>Maître(s) d'Ouvrage:</b> ${selectedMaitresOuvrage.value.map(m => m.designationMOg).join(", ")}</li>
      <li><b>Soustraitant(s):</b> ${selectedSoustraitants.value.map(s => s.designationStt).join(", ")}</li>
      <li><b>Projet(s):</b> ${selectedProjets.value.map(p => p.description).join(", ")}</li>
    </ul>
    <h3 style="margin-top:1em;">Directeurs par projet</h3>
  `
  for (const projet of selectedProjets.value) {
    const pid = String(projet.idProjet)
    html += `<div style="margin-top:0.7em;"><b>${projet.description}</b>`
    const projForm = projectDirectorsForm.value[pid]
    if (projForm?.selectedDirecteurs?.length) {
      html += '<ul>'
      for (const directeur of projForm.selectedDirecteurs) {
        const did = String(directeur.idDirecteur)
        const dates = projForm.dates[did]
        html += `<li>${directeur.nomPrenomDirecteur} du ${dates?.dateDebut || '-'} au ${dates?.dateFin || '-'}</li>`
      }
      html += '</ul>'
    } else {
      html += '<div style="font-style:italic; color:#aaa;">Aucun directeur sélectionné</div>'
    }
    html += '</div>'
  }
  const pdfContent = document.createElement('div')
  pdfContent.style.padding = '2em'
  pdfContent.style.fontFamily = 'Inter, Arial, sans-serif'
  pdfContent.innerHTML = html
  const opt = {
    margin: 0.5,
    filename: 'contexte.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }
  const blob = await html2pdf().from(pdfContent).set(opt).outputPdf('blob')
  pdfUrl.value = URL.createObjectURL(blob)
}
const contextEntitiesConfig: Record<ContextEntityKey, ContextEntityConfig> = {
  projet: {
    label: 'Projet',
    api: '/projets/',
    idCol: 'idProjet',
    columns: ['ID', 'Code', 'Description', 'Adresse', 'Wilaya'],
    columnKeys: ['idProjet', 'code', 'description', 'adresse', 'wilaya'],
    listRef: projetsList,
    selectedRef: selectedProjets,
    allowMultiple: false,
  },
  fournisseur: {
    label: 'Fournisseur',
    api: '/fournisseurs/',
    idCol: 'idFournisseur',
    columns: ['ID', 'Désignation', 'Description', 'Adresse', 'Téléphone', 'Email'],
    columnKeys: ['idFournisseur', 'designationFournisseur', 'description', 'adresse', 'telephone', 'email'],
    listRef: fournisseursList,
    selectedRef: selectedFournisseurs,
    allowMultiple: true,
  },
  maitre_ouvrage: {
    label: "Maître d'Ouvrage",
    api: '/maitres-ouvrage/',
    idCol: 'idMaitreOuvrage',
    columns: ['ID', 'Désignation', 'Description', 'Adresse', 'Email'],
    columnKeys: ['idMaitreOuvrage', 'designationMOg', 'description', 'adresse', 'email'],
    listRef: maitresOuvrageList,
    selectedRef: selectedMaitresOuvrage,
    allowMultiple: false,
  },
  maitre_oeuvre: {
    label: "Maître d'Œuvre",
    api: '/maitres-oeuvre/',
    idCol: 'idMaitreOeuvre',
    columns: ['ID', 'Désignation', 'Description', 'Adresse', 'Email'],
    columnKeys: ['idMaitreOeuvre', 'designationMO', 'description', 'adresse', 'email'],
    listRef: maitresOeuvreList,
    selectedRef: selectedMaitresOeuvre,
    allowMultiple: false,
  },
  soustraitants_tvx: {
    label: "Soustraitants de Travaux",
    api: '/soustraitants/',
    idCol: 'idSoustraitant',
    columns: ['ID', 'Désignation', 'Description', 'Adresse', 'Téléphone', 'Email'],
    columnKeys: ['idSoustraitant', 'designationStt', 'description', 'adresse', 'telephone', 'email'],
    listRef: soustraitantsList,
    selectedRef: selectedSoustraitants,
    allowMultiple: true,
  },
  bet_soustraitants_etudes: {
    label: "BET Soustraitants Études",
    api: '/bet-soustraitants-etudes/',
    idCol: 'idBetSoustraitant',
    columns: ['ID', 'Nom', 'Description', 'Adresse', 'Téléphone', 'Email'],
    columnKeys: ['idBetSoustraitant', 'nom', 'description', 'adresse', 'telephone', 'email'],
    listRef: bureauxEtudesList,
    selectedRef: selectedBureauxEtudes,
    allowMultiple: true,
  },
  direction_projet: {
    label: "Direction du Projet",
    api: '/directions-projets/',
    idCol: 'idDirectionProjet',
    columns: ['ID', 'Nom', 'Adresse'],
    columnKeys: ['idDirectionProjet', 'nom', 'adresse'],
    listRef: directionsProjetsList,
    selectedRef: selectedDirectionsProjets,
    allowMultiple: true,
  }
};





function getEntityConfig(key: string): ContextEntityConfig | undefined {
  return contextEntitiesConfig[key as ContextEntityKey];
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
  width: 450px;
  background: rgba(22,33,62,0.98);
  border-right: 2px solid #232f4b;
  padding: 2em 0.7em 1em 1.2em;
  min-height: 100vh;
  box-shadow: 2px 0 16px 0 #151e3044;
  font-size: 1.3rem;
}

/* APPLY TO DIRECT CHILDREN ONLY */
.doc-sidebar ul > li {
  display: grid;
  grid-template-columns: 135px 60px 1fr;
  align-items: start;
  margin-bottom: 0.5em;
}

.doc-sidebar .arb-label {
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  color: #bbdefb;
}

.doc-sidebar .arb-separator {
  text-align: center;
  color: #bbdefb;
}

.doc-sidebar li > b {
  font-weight: 700;
  color: #43E97B;
  text-align: left;
  display: block; /* important for forcing alignment */
  width: 100%;     /* fills the grid cell */
}









/* Nested for context */
.doc-sidebar ul ul > li {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.4em;
  padding-left: 0.5em;
}
.doc-sidebar ul ul > li > .arb-label {
  color: #bbdefb;
  font-weight: 500;
}
.add-doc-main {
  flex: 1;
  padding: 2.5em 1.2em 2.5em 1.2em;
  max-width: 700px;
  margin: 0  0 0 15em;
  display: flex;
  flex-direction: column;
}
.add-doc-main h1 {
  color: #90caf9;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1.5em;
  letter-spacing: 1px;
}
.step {
  margin-bottom: 0.5em;
  background: rgba(22,33,62,0.85);
  border-radius: 12px;
  padding: 1em 2em 1em 1.5em;
  box-shadow: 0 2px 12px 0 #1a237e22;
  border-left: 4px solid #2196F3;
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




.mode-switch {
  display: flex;
  gap: 1em;
  margin-top: 0.7em;
}
.mode-switch button {
  flex: 1;
  padding: 0.7em 0;
  border: none;
  border-radius: 6px;
  background: #232f4b;
  color: #bbdefb;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.mode-switch button.active, .mode-switch button:hover {
  background: linear-gradient(90deg, #2196F3 0%, #43E97B 100%);
  color: #fff;
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
@media (max-width: 900px) {
  .add-doc-root {
    flex-direction: column;
  }
  .doc-sidebar {
    width: 100vw;
    min-height: unset;
    border-right: none;
    border-bottom: 2px solid #232f4b;
    box-shadow: none;
    padding: 1.2em 1em;
  }
  .add-doc-main {
    padding: 1.2em 0.5em;
    max-width: 100vw;
  }
}
.context-stepper select {
  width: 100%;
  padding: 0.7em 1em;
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

.consult-btn {
  background: #4caf50; /* Green */
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

.consult-btn:hover {
  background: #45a049;
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
  min-width: 540px;
  max-width: 90vw;
  box-shadow: 0 8px 32px 0 #16213e99;
  color: #e3eafc;
  position: relative;
  max-height: 90vh;
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
  border: 1px solid #1a237e;
  padding: 0.5em 0.7em;
  text-align: left;
}
.doc-table tr {
  height: 36px;
}
.view-button, .delete-button {
  padding: 0.4em 1em;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}
.view-button { background: #29b6f6; color: #fff; border: none; }
.view-button:hover { background: #039be5; }
.delete-button { background: #f44336; color: #fff; border: none; }
.delete-button:hover { background: #d32f2f; }
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
  padding: 1.1em 1.7em;
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

</style>