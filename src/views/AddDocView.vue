
<template>
  <div class="add-doc-root">
    <!-- SIDEBAR: Structure and Context info -->
    <aside class="doc-sidebar">
      <h3>Arborescence</h3>
      <ul>
        <li v-if="selectedTypeId">
          <span class="arb-label">Type&nbsp;:</span>
          <b>{{ getTypeDesignation(selectedTypeId) }}</b>
        </li>
        <li v-if="selectedProduitId">
          <span class="arb-label">Produit&nbsp;:</span>
          <b>{{ getProduitDesignation(selectedProduitId) }}</b>
        </li>
        <li v-if="designation">
          <span class="arb-label">Désignation&nbsp;:</span>
          <b>{{ designation }}</b>
        </li>
        <li v-if="selectedStructureId">
          <span class="arb-label">Structure&nbsp;:</span>
          <b>{{ getStructureDesignation(selectedStructureId) }}</b>
        </li>
        <li v-if="selectedSectionId">
          <span class="arb-label">Section&nbsp;:</span>
          <b>{{ getSectionDesignation(selectedSectionId) }}</b>
        </li>
        <li v-if="selectedDivisionId">
          <span class="arb-label">Division Niv. 1&nbsp;:</span>
          <b>{{ getDivisionDesignation(selectedDivisionId) }}</b>
        </li>
        <li v-if="requiresSubDiv2 && selectedSubDiv2Id">
          <span class="arb-label">Subdivision Niv. 2&nbsp;:</span>
          <b>{{ getSubDiv2Designation(selectedSubDiv2Id) }}</b>
        </li>
        <li v-if="selectedSubDiv3Id">
          <span class="arb-label">Subdivision Niv. 3&nbsp;:</span>
          <b>{{ getSubDiv3Designation(selectedSubDiv3Id) }}</b>
        </li>
        <li v-if="uploadedFile">
          <span class="arb-label">Fichier&nbsp;:</span>
          <b>{{ uploadedFile?.name }}</b>
        </li>
        <!-- CONTEXT INFO -->
        <template v-if="mode === 'contexte'
          || selectedBureauxEtudes.length > 0
          || selectedFournisseurs.length > 0
          || selectedMaitresOeuvre.length > 0
          || selectedMaitresOuvrage.length > 0
          || selectedSoustraitants.length > 0
          || selectedProjets.length > 0">
          <li style="margin-top:1.5em;">
            <span class="arb-label" style="color:#43E97B">Contexte&nbsp;:</span>
          </li>
          <ul style="margin-bottom:0;">
            <li v-if="selectedBureauEtudeNoms.length">
              <span class="arb-label">Bureaux Études&nbsp;:</span>
              <b>{{ selectedBureauEtudeNoms.join(', ') }}</b>
            </li>
            <li v-if="selectedFournisseurNoms.length">
              <span class="arb-label">Fournisseurs&nbsp;:</span>
              <b>{{ selectedFournisseurNoms.join(', ') }}</b>
            </li>
            <li v-if="selectedMaitreOeuvreNoms.length">
              <span class="arb-label">Maîtres d'Œuvre&nbsp;:</span>
              <b>{{ selectedMaitreOeuvreNoms.join(', ') }}</b>
            </li>
            <li v-if="selectedMaitreOuvrageNoms.length">
              <span class="arb-label">Maîtres d'Ouvrage&nbsp;:</span>
              <b>{{ selectedMaitreOuvrageNoms.join(', ') }}</b>
            </li>
            <li v-if="selectedSoustraitantNoms.length">
              <span class="arb-label">Soustraitants&nbsp;:</span>
              <b>{{ selectedSoustraitantNoms.join(', ') }}</b>
            </li>
            <li v-if="selectedProjetNoms.length">
              <span class="arb-label">Projets&nbsp;:</span>
              <b>{{ selectedProjetNoms.join(', ') }}</b>
            </li>
          </ul>
        </template>
      </ul>
    </aside>
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
        <div class="step" v-if="selectedProduitId">
          <label for="designation">Désignation</label>
          <input id="designation" v-model="designation" type="text" />
        </div>
        <div class="step" v-if="designation">
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
        <div class="step" v-if="isSubDivAllowed">
          <label for="file-upload">Fichier (PDF ou TXT)</label>
          <input id="file-upload" type="file" accept=".pdf,.txt" @change="onFileChange" />
          <div v-if="uploadedFile" class="file-info">
            <span>Fichier sélectionné: {{ uploadedFile.name }}</span>
            <button @click="uploadedFile = null" type="button">Retirer</button>
          </div>
        </div>
        <p v-if="!isSubDivAllowed && selectedDivisionId" style="color: #E53935;">
          Cette subdivision ne permet pas la création de documents.
        </p>
        <div class="step" v-if="isSubDivAllowed">
          <button class="save-btn" type="submit">Créer Document</button>
        </div>
      </form>
      <!-- CONTEXT MODE FORM: Multi-directeurs per project and date -->
      <div v-if="mode === 'contexte'" class="step context-stepper">
        <h2>Sélection du Contexte</h2>
        <form @submit.prevent="submitContextForm">
          <div class="step">
            <label>Bureau(x) d'Études</label>
            <multiselect
              v-model="selectedBureauxEtudes"
              :options="bureauxEtudesList"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              track-by="idBET"
              label="nom"
              placeholder="Sélectionner un ou plusieurs BET"
              :show-labels="false"
            />
          </div>
          <div class="step">
            <label>Fournisseur(s)</label>
            <multiselect
              v-model="selectedFournisseurs"
              :options="fournisseursList"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              track-by="idFournisseur"
              label="designationFournisseur"
              placeholder="Sélectionner un ou plusieurs Fournisseurs"
              :show-labels="false"
            />
          </div>
          <div class="step">
            <label>Maître(s) d'Œuvre</label>
            <multiselect
              v-model="selectedMaitresOeuvre"
              :options="maitresOeuvreList"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              track-by="idMaitreOeuvre"
              label="designationMO"
              placeholder="Sélectionner un ou plusieurs Maîtres d'Oeuvre"
              :show-labels="false"
            />
          </div>
          <div class="step">
            <label>Maître(s) d'Ouvrage</label>
            <multiselect
              v-model="selectedMaitresOuvrage"
              :options="maitresOuvrageList"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              track-by="idMaitreOuvrage"
              label="designationMOg"
              placeholder="Sélectionner un ou plusieurs Maîtres d'Ouvrage"
              :show-labels="false"
            />
          </div>
          <div class="step">
            <label>Soustraitant(s)</label>
            <multiselect
              v-model="selectedSoustraitants"
              :options="soustraitantsList"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              track-by="idSoustraitants"
              label="designationStt"
              placeholder="Sélectionner un ou plusieurs Soustraitants"
              :show-labels="false"
            />
          </div>
          <div class="step">
            <label>Projet(s)</label>
            <multiselect
              v-model="selectedProjets"
              :options="projetsList"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              track-by="idProjet"
              label="description"
              placeholder="Sélectionner un ou plusieurs Projets"
              :show-labels="false"
              @change="handleProjectSelection"
            />
          </div>
          <div v-for="projet in selectedProjets" :key="projet.idProjet" class="step substep">
    <label>Directeur(s) pour "{{ projet.description }}"</label>
    <multiselect
      v-model="projectDirectorsForm[String(projet.idProjet)].selectedDirecteurs"
      :options="directionsProjets[String(projet.idProjet)] || []"
      :multiple="true"
      :close-on-select="false"
      :clear-on-select="false"
      track-by="idDirecteur"
      label="nomPrenomDirecteur"
      placeholder="Sélectionner un ou plusieurs directeurs"
      :show-labels="false"
      @change="() => onDirecteursChanged(projet.idProjet)"
    />
    <!-- <div v-for="directeur in projectDirectorsForm[String(projet.idProjet)].selectedDirecteurs || []"
      :key="directeur.idDirecteur"
      style="margin:0.8em 0 0.8em 2.7em; display: flex; gap:1.25em; align-items: flex-end;">
      <span style="min-width:180px; color:#51ffbf;">
        <b>{{ directeur.nomPrenomDirecteur }}</b> ({{ directeur.fonction }})
      </span>
      <div>
        <label style="color:#bbdefb; font-size:0.96em;">Date début</label>
        <input
          type="date"
          v-model="projectDirectorsForm[String(projet.idProjet)].dates[String(directeur.idDirecteur)].dateDebut"
          style="min-width:135px;"
        />
      </div>
      <div>
        <label style="color:#bbdefb; font-size:0.96em;">Date fin</label>
        <input
          type="date"
          v-model="projectDirectorsForm[String(projet.idProjet)].dates[String(directeur.idDirecteur)].dateFin"
          style="min-width:135px;"
        />
      </div>
    </div> -->
    


    <div v-for="directeur in projectDirectorsForm[String(projet.idProjet)].selectedDirecteurs || []"
  :key="directeur.idDirecteur"
  style="margin:0.8em 0 0.8em 2.7em; display: flex; gap:1.25em; align-items: flex-end;">
  <span style="min-width:180px; color:#51ffbf;">
    <b>{{ directeur.nomPrenomDirecteur }}</b> ({{ directeur.fonction }})
  </span>
  <div>
    <label style="color:#bbdefb; font-size:0.96em;">Date début</label>
    <input
      type="date"
      v-model="projectDirectorsForm[String(projet.idProjet)].dates[String(directeur.idDirecteur)].dateDebut"
      style="min-width:135px;"
    />
  </div>
  <div>
    <label style="color:#bbdefb; font-size:0.96em;">Date fin</label>
    <input
      type="date"
      v-model="projectDirectorsForm[String(projet.idProjet)].dates[String(directeur.idDirecteur)].dateFin"
      style="min-width:135px;"
    />
  </div>
</div>


  </div>
          <div style="margin-top:1.5em;">
            <button class="save-btn" type="submit">Valider le Contexte</button>
          </div>
        </form>
        <div v-if="contexteFormSubmitted" style="margin-top:2em;">
          <h3>Résumé de votre Contexte</h3>
          <ul>
            <li><b>Bureaux d'Études:</b> {{ selectedBureauEtudeNoms.join(', ') }}</li>
            <li><b>Fournisseurs:</b> {{ selectedFournisseurNoms.join(', ') }}</li>
            <li><b>Maîtres d'Œuvre:</b> {{ selectedMaitreOeuvreNoms.join(', ') }}</li>
            <li><b>Maîtres d'Ouvrage:</b> {{ selectedMaitreOuvrageNoms.join(', ') }}</li>
            <li><b>Soustraitants:</b> {{ selectedSoustraitantNoms.join(', ') }}</li>
            <li><b>Projets:</b> {{ selectedProjetNoms.join(', ') }}</li>
          </ul>
          <div v-for="projet in selectedProjets" :key="projet.idProjet" style="margin-top:1em;">
            <b>{{ projet.description }}</b>
            <ul v-if="projectDirectorsForm[String(projet.idProjet)]?.selectedDirecteurs && projectDirectorsForm[String(projet.idProjet)].selectedDirecteurs.length">
              <li v-for="directeur in projectDirectorsForm[String(projet.idProjet)].selectedDirecteurs" :key="directeur.idDirecteur">
                {{ directeur.nomPrenomDirecteur }} du {{ projectDirectorsForm[String(projet.idProjet)].dates[String(directeur.idDirecteur)]?.dateDebut || '?' }} au {{ projectDirectorsForm[String(projet.idProjet)].dates[String(directeur.idDirecteur)]?.dateFin || '?' }}
              </li>
            </ul>
            <span v-else style="font-style:italic; color:#aaa;">Aucun directeur sélectionné</span>
          </div>
          <button class="pdf-btn" @click="generateContextPdfV2">Générer PDF de Contexte</button>
        </div>
        <iframe v-if="contexteFormSubmitted && pdfUrl" :src="pdfUrl" class="pdf-preview" frameborder="0"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import Multiselect from 'vue-multiselect'
import "vue-multiselect/dist/vue-multiselect.css";


import axios from 'axios'


const API_BASE = 'http://10.10.150.75:8000/api'

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

const designation = ref<string>('')
const uploadedFile = ref<File | null>(null)

// Initial fetch
onMounted(async () => {
  try {
    const [typesRes, structuresRes, subDivsRes, subDivs3Res] = await Promise.all([
      axios.get(`${API_BASE}/types/`),
      axios.get(`${API_BASE}/structures/`),
      axios.get(`${API_BASE}/subdiv1et2/`),
      axios.get(`${API_BASE}/subdiv2et3/`)
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
        axios.get(`${API_BASE}/produits/by-type/${newTypeId}/`),
        axios.get(`${API_BASE}/sections/by-type/${newTypeId}/`)
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
      const res = await axios.get(`${API_BASE}/subdivision-nv1/by-structure/${newStructureId}/`)
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
  formData.append('designation', designation.value || '');
  formData.append('chemin', ' No chemin'); // You can modify this as needed
  formData.append('version', ''); // You can modify this as needed
  formData.append('dateCreation', ''); // Use an empty string instead of null
  formData.append('dateModification', ''); // Use an empty string instead of null
  if (uploadedFile.value) {
    formData.append('fichier_pdf', uploadedFile.value);
  }

  try {
    const response = await axios.post('http://10.10.150.75:8000/api/documents/', formData, {
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


// ==== Context directors logic: string keys for TS safety ====
const mode = ref<'structure' | 'contexte' | ''>('structure')

const loadingContexteLists = ref(false)
const bureauxEtudesList   = ref<any[]>([])
const fournisseursList    = ref<any[]>([])
const maitresOeuvreList   = ref<any[]>([])
const maitresOuvrageList  = ref<any[]>([])
const soustraitantsList   = ref<any[]>([])
const projetsList         = ref<any[]>([])

const selectedBureauxEtudes   = ref<any[]>([])
const selectedFournisseurs    = ref<any[]>([])
const selectedMaitresOeuvre   = ref<any[]>([])
const selectedMaitresOuvrage  = ref<any[]>([])
const selectedSoustraitants   = ref<any[]>([])
const selectedProjets         = ref<any[]>([])

const contexteFormSubmitted = ref(false)
const directionsProjets = ref<Record<string, any[]>>({})


const projectDirectorsForm = ref<Record<string, {
  selectedDirecteurs: any[],
  dates: Record<string, { dateDebut: string, dateFin: string }>
}>>({});


const fetchDirectionsForProjet = async (idProjet: number) => {
  const pid = String(idProjet)
  try {
    const res = await axios.get(`${API_BASE}/directions-projets/?projet=${idProjet}`)
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
// function onDirecteursChanged(idProjet: number) {
//   const pid = String(idProjet)
//   const current = projectDirectorsForm.value[pid]
//   if (!current) return
//   const dirIds = current.selectedDirecteurs.map(d => String(d.idDirecteur))
//   for (const directeur of current.selectedDirecteurs) {
//     const did = String(directeur.idDirecteur)
//     if (!current.dates[did]) {
//       current.dates[did] = { dateDebut: '', dateFin: '' }
//     }
//   }
//   for (const dId of Object.keys(current.dates)) {
//     if (!dirIds.includes(dId)) {
//       delete current.dates[dId]
//     }
//   }
// }


function onDirecteursChanged(idProjet: number) {
  const pid = String(idProjet);
  const current = projectDirectorsForm.value[pid];
  if (!current) return;

  const dirIds = current.selectedDirecteurs.map(d => String(d.idDirecteur));
  for (const directeur of current.selectedDirecteurs) {
    const did = String(directeur.idDirecteur);
    if (!current.dates[did]) {
      current.dates[did] = { dateDebut: '', dateFin: '' };
    }
  }
  for (const dId of Object.keys(current.dates)) {
    if (!dirIds.includes(dId)) {
      delete current.dates[dId];
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
        axios.get(`${API_BASE}/bureaux-etudes/`),
        axios.get(`${API_BASE}/fournisseurs/`),
        axios.get(`${API_BASE}/maitres-oeuvre/`),
        axios.get(`${API_BASE}/maitres-ouvrage/`),
        axios.get(`${API_BASE}/Soustraitants/`),
        axios.get(`${API_BASE}/projets/`)
      ])
      bureauxEtudesList.value  = betRes.data
      fournisseursList.value   = fourRes.data
      maitresOeuvreList.value  = moeurRes.data
      maitresOuvrageList.value = mouvRes.data
      soustraitantsList.value  = sttRes.data
      projetsList.value        = projetsRes.data
    } catch (e) {
      alert("Erreur de chargement des listes de contexte.")
    } finally {
      loadingContexteLists.value = false
    }
  }
  if (val === 'structure') resetContexteForm()
})

function submitContextForm() {
  for (const key of ['selectedBureauxEtudes', 'selectedFournisseurs', 'selectedMaitresOeuvre', 'selectedMaitresOuvrage', 'selectedSoustraitants', 'selectedProjets']) {
    if ((<any>eval(key)).value.length === 0) {
      alert("Veuillez sélectionner au moins un élément par catégorie du contexte.")
      return
    }
  }
  for (const projet of selectedProjets.value) {
    const pid = String(projet.idProjet)
    const projForm = projectDirectorsForm.value[pid]
    if (!projForm || !projForm.selectedDirecteurs.length) {
      alert('Sélectionnez au moins un directeur pour "' + projet.description + '"')
      return
    }
    for (const directeur of projForm.selectedDirecteurs) {
      const did = String(directeur.idDirecteur)
      const dates = projForm.dates[did]
      if (!dates || !dates.dateDebut || !dates.dateFin) {
        alert(`Veuillez entrer la date début et date fin pour chaque directeur de "${projet.description}"`)
        return
      }
      if (dates.dateFin < dates.dateDebut) {
        alert(`La date fin doit être après la date début pour ${directeur.nomPrenomDirecteur} (${projet.description})`)
        return
      }
    }
  }
  contexteFormSubmitted.value = true
}


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
  width: 420px;
  background: rgba(22,33,62,0.98);
  border-right: 2px solid #232f4b;
  padding: 2em 0.7em 1em 1.2em;
  min-height: 100vh;
  box-shadow: 2px 0 16px 0 #151e3044;
  font-size: 1rem;
}

/* APPLY TO DIRECT CHILDREN ONLY */
.doc-sidebar ul > li {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: 0.8em;
  margin-bottom: 0.6em;
}
.doc-sidebar ul > li > .arb-label {
  font-weight: 600;
  color: #bbdefb;
  letter-spacing: 0.5px;
  white-space: nowrap; /* always on one line for better look */
}
.doc-sidebar ul > li > b {
  margin-left: 0;
  font-weight: 700;
  color: #43E97B;
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
  margin-top: 1.2em;
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


</style>