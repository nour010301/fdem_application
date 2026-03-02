# Spécification Technique - Fonds Documentaire pour les Études et Méthodes (FDEM)

## Table des Matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
   - [Description générale](#description-générale)
   - [Technologies utilisées](#technologies-utilisées)

2. [Architecture technique](#architecture-technique)
   - [Structure des composants](#structure-des-composants)

3. [Règles de gestion](#règles-de-gestion)
   - [RG001 - Sélection hiérarchique obligatoire](#rg001---sélection-hiérarchique-obligatoire)
   - [RG002 - Gestion des subdivisions conditionnelles](#rg002---gestion-des-subdivisions-conditionnelles)
   - [RG003 - Upload de fichiers selon le type de document](#rg003---upload-de-fichiers-selon-le-type-de-document)
   - [RG009 - Prérequis fichiers source (Mode Structure)](#rg009---prérequis-fichiers-source-mode-structure)
   - [RG010 - Condition d'affichage du bouton "Importer Fichiers Source"](#rg010---condition-daffichage-du-bouton-importer-fichiers-source)
   - [RG004 - Mode Contexte vs Mode Structure](#rg004---mode-contexte-vs-mode-structure)
   - [RG005 - Permissions utilisateur](#rg005---permissions-utilisateur)
   - [RG006 - Validation des documents](#rg006---validation-des-documents)
   - [RG007 - Gestion des fichiers ZIP automatique](#rg007---gestion-des-fichiers-zip-automatique)
   - [RG008 - Dépendances hiérarchiques dans la bibliothèque](#rg008---dépendances-hiérarchiques-dans-la-bibliothèque)

4. [Description des écrans](#description-des-écrans)
   - [1. Écran de connexion (LoginView)](#1-écran-de-connexion-loginview)
   - [2. Tableau de bord (DashboardView)](#2-tableau-de-bord-dashboardview)
   - [3. Ajout de documents (AddDocView)](#3-ajout-de-documents-adddocview)
   - [4. Liste des documents (Documents)](#4-liste-des-documents-documents)
   - [5. Gestion des référentiels (Bibliothèque)](#5-gestion-des-référentiels-bibliothèque)
     - [Fonctionnalités communes](#fonctionnalités-communes)
     - [Règles spécifiques par écran](#règles-spécifiques-par-écran)
       - [TypeProduitView](#typeproduitview)
       - [ProduitView](#produitview)
       - [SectionView](#sectionview)
       - [StructuresView](#structuresview)
       - [SubDivisionNv_1View](#subdivisionnv_1view)
       - [SubDivisionNv_2View](#subdivisionnv_2view)
       - [SubDivisionNv_3View](#subdivisionnv_3view)
       - [SubDivisionNv_4View](#subdivisionnv_4view)

5. [Gestion des utilisateurs et permissions](#gestion-des-utilisateurs-et-permissions)
   - [Profils utilisateur](#profils-utilisateur)
     - [ADMIN_INFORMATIQUE (ID: 2)](#admin_informatique-id-2)
     - [ADMIN_FONCTIONNEL (ID: 1)](#admin_fonctionnel-id-1)
     - [MISE_A_JOUR (ID: 4)](#mise_a_jour-id-4)
     - [CONSULTATION (ID: 3)](#consultation-id-3)
   - [Permissions spéciales](#permissions-spéciales)

6. [Fonctionnalités par écran](#fonctionnalités-par-écran)
   - [AddDocView - Écran d'ajout de documents](#adddocview---écran-dajout-de-documents)
     - [Mode Structure](#mode-structure)
     - [Mode Contexte (Structure ID = 5)](#mode-contexte-structure-id--5)
   - [Documents - Écran de consultation](#documents---écran-de-consultation)
     - [Section Filtres](#section-filtres)
     - [Section Statistiques](#section-statistiques)
     - [Tableau des résultats](#tableau-des-résultats)
   - [Écrans de gestion de la bibliothèque](#écrans-de-gestion-de-la-bibliothèque)
     - [TypeProduitView - Gestion des types de produits](#typeproduitview---gestion-des-types-de-produits)
     - [ProduitView - Gestion des produits](#produitview---gestion-des-produits)
     - [SubDivisionNv_2View - Types de documents](#subdivisionnv_2view---types-de-documents)
     - [SubDivisionNv_3View - Documents cibles](#subdivisionnv_3view---documents-cibles)
     - [SubDivisionNv_4View - Niveau le plus détaillé](#subdivisionnv_4view---niveau-le-plus-détaillé)

7. [Modales et interactions](#modales-et-interactions)
   - [Modal d'ajout de document (Mode Structure)](#modal-dajout-de-document-mode-structure)
   - [Modal d'ajout dans la bibliothèque](#modal-dajout-dans-la-bibliothèque)
     - [Modal Type Produit](#modal-type-produit)
     - [Modal Produit](#modal-produit)
     - [Modal Subdivision Niveau 2](#modal-subdivision-niveau-2)
   - [Modal de suppression de document](#modal-de-suppression-de-document)
   - [Modal d'ajout d'entité (Mode Contexte)](#modal-dajout-dentité-mode-contexte)
   - [Modal de validation de document](#modal-de-validation-de-document)
   - [Modal de visualisation de fichiers](#modal-de-visualisation-de-fichiers)
   - [Validation des dépendances hiérarchiques](#validation-des-dépendances-hiérarchiques)

8. [Gestion des fichiers](#gestion-des-fichiers)
   - [Types de fichiers supportés](#types-de-fichiers-supportés)
     - [Documents PDF](#documents-pdf)
     - [Fichiers source (Pièces Graphiques)](#fichiers-source-pièces-graphiques)
     - [Vidéos](#vidéos)
     - [Photos](#photos)
   - [Règles de traitement](#règles-de-traitement)
     - [Compression ZIP automatique](#compression-zip-automatique)
     - [Conversion photos en PDF](#conversion-photos-en-pdf)
   - [Gestion des erreurs fichiers](#gestion-des-erreurs-fichiers)
     - [Erreurs courantes](#erreurs-courantes)
     - [Messages utilisateur](#messages-utilisateur)

9. [Logs et traçabilité](#logs-et-traçabilité)
   - [Actions loggées](#actions-loggées)
   - [Informations tracées](#informations-tracées)

10. [Responsive Design](#responsive-design)
    - [Points de rupture](#points-de-rupture)
    - [Adaptations mobiles](#adaptations-mobiles)

11. [Exemples de flux utilisateur](#exemples-de-flux-utilisateur)
    - [Ajout de document avec fichiers source (Mode Structure)](#ajout-de-document-avec-fichiers-source-mode-structure)
    - [Création d'un nouveau produit](#création-dun-nouveau-produit)
    - [Création d'une subdivision niveau 3](#création-dune-subdivision-niveau-3)
    - [Tentative de suppression avec dépendances](#tentative-de-suppression-avec-dépendances)

---

## Vue d'ensemble du projet

### Description générale
L'application FDEM (Fonds Documentaire pour les Études et Méthodes) est une plateforme de gestion documentaire développée avec Vue 3 + TypeScript + Vite. Elle permet la gestion hiérarchique de documents techniques selon une structure arborescente complexe.

### Technologies utilisées
- **Frontend** : Vue 3 avec Composition API, TypeScript, Vite
- **Styling** : CSS personnalisé avec design responsive
- **Gestion d'état** : Pinia (userStore)
- **Routage** : Vue Router
- **HTTP Client** : Axios
- **Génération PDF** : jsPDF
- **Compression fichiers** : JSZip

---

## Architecture technique

### Structure des composants
```
src/
├── components/          # Composants réutilisables
│   ├── PdfViewer.vue   # Visualisation PDF
│   ├── ImageViewer.vue # Visualisation images
│   ├── VideoViewer.vue # Visualisation vidéos
│   └── FileViewer.vue  # Visualisation générique
├── views/              # Pages principales
│   ├── AddDocView.vue  # Ajout de documents
│   ├── Documents.vue   # Liste des documents
│   ├── TypeProduitView.vue
│   ├── ProduitView.vue
│   └── [autres vues...]
├── store/              # Gestion d'état
│   └── userStore.ts    # Store utilisateur
└── services/           # Services métier
    ├── authService.ts
    └── logService.ts
```

---

## Règles de gestion

### RG001 - Sélection hiérarchique obligatoire
**Description** : Pour ajouter un document, l'utilisateur doit suivre une sélection hiérarchique obligatoire.
**Règle** : Type Produit → Produit → Structure → Section → Subdivision Niv.1 → [Subdivision Niv.2] → [Subdivision Niv.3]
**Exemple** : 
- Sélectionner "Bâtiment" (Type Produit)
- Puis "Logements collectifs" (Produit)
- Puis "Structure fond documentaire" (Structure)

### RG002 - Gestion des subdivisions conditionnelles
**Description** : Certaines subdivisions nécessitent des sous-niveaux selon leur configuration.
**Règle** : Si `subDiv = true` dans la subdivision, alors les niveaux inférieurs sont obligatoires.
**Exemple** : Si "Pièces Graphiques" nécessite une subdivision niveau 2, l'utilisateur doit obligatoirement sélectionner un type de document.

### RG003 - Upload de fichiers selon le type de document
**Description** : Les types de fichiers autorisés dépendent du contexte sélectionné.
**Règles** :
- **Fichier PDF** : Toujours autorisé (.pdf)
- **Fichiers source** : Uniquement pour "Pièces Graphiques" (.dwg, .dxf, .zip)
- **Vidéos** : Formats supportés (.mp4, .mov, .avi, .mkv, .webm)
- **Photos** : Conversion automatique en PDF (.jpg, .jpeg, .png, .gif)

### RG010 - Condition d'affichage du bouton "Importer Fichiers Source"
**Description** : Le bouton "Importer Fichiers Source" n'apparaît que sous certaines conditions spécifiques.
**Règle** : Le bouton est visible uniquement si :
1. **Subdivision Niveau 1** = "PIECES GRAPHIQUES" (exactement)
2. **ET** l'utilisateur a les permissions d'ajout de documents
3. **ET** la sélection hiérarchique est complète jusqu'au niveau requis

**Exemple de chemin valide** :
- Type Produit : "STATIONS METRO EN SOUTERRAIN"
- Produit : "SDM Med BOUDHIAF"
- Structure : "DOCUMENTS de DEFINITION & de REALISATION"
- Section : "Assainis. / Drainage"
- **Subdivision Niv.1** : "PIECES GRAPHIQUES" ← **Condition obligatoire**
- Subdivision Niv.2 : "PLANS D'EXECUTION"
- Subdivision Niv.3 : "PLANS DE FERRAILLAGE"

**Comportement** :
- ✅ Si Subdivision Niv.1 = "PIECES GRAPHIQUES" → Bouton visible
- ❌ Si Subdivision Niv.1 ≠ "PIECES GRAPHIQUES" → Bouton masqué
- ❌ Si utilisateur en mode CONSULTATION → Bouton masqué

### RG009 - Prérequis fichiers source (Mode Structure)
**Description** : L'upload de fichiers source nécessite un fichier PDF préalable.
**Règle** : Dans le modal d'ajout de document (mode structure), la section "Fichiers source" n'apparaît que si un fichier PDF a été sélectionné.
**Comportement** :
- Étape 1 : Utilisateur sélectionne un fichier PDF
- Étape 2 : La section "Fichiers source" devient visible (pour Pièces Graphiques uniquement)
- Étape 3 : Utilisateur peut alors ajouter des fichiers source (.dwg, .dxf, .zip)
**Exemple** : Pour ajouter des plans AutoCAD, l'utilisateur doit d'abord uploader le PDF du plan, puis ajouter les fichiers .dwg en complément.

### RG004 - Mode Contexte vs Mode Structure
**Description** : Deux modes de fonctionnement selon la structure sélectionnée.
**Règles** :
- **Mode Structure** : Structure ID ≠ 5, gestion classique des documents
- **Mode Contexte** : Structure ID = 5, gestion des entités projet (Maîtres d'ouvrage, Maîtres d'œuvre, etc.)

### RG005 - Permissions utilisateur
**Description** : Les actions disponibles dépendent du profil utilisateur.
**Règles** :
- **CONSULTATION (ID: 3)** : Lecture seule, pas d'ajout/modification
- **MISE_A_JOUR (ID: 4)** : Lecture + modification
- **ADMIN_INFORMATIQUE (ID: 2)** : Tous droits + gestion utilisateurs
- **ADMIN_FONCTIONNEL (ID: 1)** : Tous droits fonctionnels

### RG006 - Validation des documents
**Description** : Système de validation à deux niveaux.
**Règles** :
- Documents créés avec `valide = false` par défaut
- Seuls les utilisateurs avec permission `valide = true` peuvent valider
- Les utilisateurs CONSULTATION ne voient que les documents validés (sauf s'ils ont la permission valide)

### RG007 - Gestion des fichiers ZIP automatique
**Description** : Compression automatique des fichiers multiples.
**Règles** :
- Sélection de plusieurs fichiers → ZIP automatique
- Sélection d'un dossier → ZIP du dossier complet
- Fichier ZIP unique → Envoi direct

### RG008 - Dépendances hiérarchiques dans la bibliothèque
**Description** : Toutes les entités de la bibliothèque suivent des dépendances hiérarchiques strictes.
**Règles** :
- **Produit** : Doit sélectionner un Type Produit existant avant création
- **Section** : Doit être associée à un Type Produit lors de la création
- **Subdivision Niveau 2** : Doit sélectionner une Subdivision Niveau 1 parente
- **Subdivision Niveau 3** : Doit sélectionner une Subdivision Niveau 2 parente
- **Subdivision Niveau 4** : Doit sélectionner une Subdivision Niveau 3 parente
- **Structure** : Peut être associée à des sections spécifiques

**Exemples** :
- Créer un produit "Villa individuelle" → Sélectionner d'abord "Bâtiment" (Type Produit)
- Créer subdivision "Plans d'exécution" → Sélectionner d'abord "Pièces Graphiques" (Subdiv Niv.1)
- Créer subdivision "Plans béton armé" → Sélectionner d'abord "Plans d'exécution" (Subdiv Niv.2)

---

## Description des écrans

### 1. Écran de connexion (LoginView)
**Objectif** : Authentification des utilisateurs
**Éléments** :
- Champs : Username, Password
- Bouton "Se connecter"
- Gestion des erreurs d'authentification

### 2. Tableau de bord (DashboardView)
**Objectif** : Vue d'ensemble et navigation principale
**Éléments** :
- Statistiques générales
- Accès rapide aux fonctionnalités
- Informations utilisateur

### 3. Ajout de documents (AddDocView)
**Objectif** : Création et gestion de nouveaux documents
**Sections** :
- **Formulaire de sélection hiérarchique** (gauche)
- **Panneau de gestion** (droite, conditionnel)
- **Arborescence contextuelle** (mode contexte)

### 4. Liste des documents (Documents)
**Objectif** : Consultation et recherche de documents
**Sections** :
- **Filtres avancés** (gauche)
- **Statistiques** (droite)
- **Tableau des résultats** (centre)
- **Pagination**

### 5. Gestion des référentiels (Bibliothèque)
**Écrans** : TypeProduitView, ProduitView, SectionView, StructuresView, SubDivisionNv_1View, etc.
**Objectif** : Administration des données de référence avec respect des hiérarchies

#### Fonctionnalités communes :
- Liste avec recherche et tri
- Ajout/Modification/Suppression
- Export CSV
- Pagination
- **Validation des dépendances hiérarchiques**

#### Règles spécifiques par écran :

**TypeProduitView** :
- Écran racine, pas de dépendance
- Sélection obligatoire des sections lors de la création
- Un type produit peut avoir plusieurs sections

**ProduitView** :
- **Dépendance** : Sélection obligatoire d'un Type Produit
- Liste filtrée par type produit sélectionné
- Validation : Un produit ne peut exister sans type produit

**SectionView** :
- Gestion des sections de produits
- Association avec les types de produits
- Une section peut être liée à plusieurs types

**StructuresView** :
- Gestion des structures fond documentaire
- Peut être associée à des sections spécifiques
- Structure ID = 5 active le mode contexte

**SubDivisionNv_1View** :
- **Dépendance** : Association avec une structure
- Paramètre `subDiv` détermine si des sous-niveaux sont requis
- Exemples : "Pièces Graphiques", "Documents administratifs"

**SubDivisionNv_2View** :
- **Dépendance** : Sélection obligatoire d'une Subdivision Niveau 1
- Liste filtrée par subdivision niveau 1 sélectionnée
- Paramètre `subDiv` pour activer le niveau 3
- Exemples : "Plans d'exécution", "Plans de principe"

**SubDivisionNv_3View** :
- **Dépendance** : Sélection obligatoire d'une Subdivision Niveau 2
- Liste filtrée par subdivision niveau 2 sélectionnée
- Paramètre `subDiv` pour activer le niveau 4
- Exemples : "Plans béton armé", "Plans charpente métallique"

**SubDivisionNv_4View** :
- **Dépendance** : Sélection obligatoire d'une Subdivision Niveau 3
- Niveau le plus profond de la hiérarchie
- Exemples : "Plans de ferraillage", "Plans de coffrage"

---

## Gestion des utilisateurs et permissions

### Profils utilisateur

#### ADMIN_INFORMATIQUE (ID: 2)
- **Permissions** : Accès total système
- **Fonctionnalités** :
  - Gestion des utilisateurs
  - Voir colonne "Créé par"
  - Accès aux plans techniques
  - Export CSV illimité

#### ADMIN_FONCTIONNEL (ID: 1)
- **Permissions** : Gestion fonctionnelle complète
- **Fonctionnalités** :
  - Toutes les opérations métier
  - Validation des documents
  - Gestion des référentiels

#### MISE_A_JOUR (ID: 4)
- **Permissions** : Lecture + écriture
- **Fonctionnalités** :
  - Ajout/modification de documents
  - Voir tous les documents (validés et non validés)
  - Accès aux fonctions de mise à jour

#### CONSULTATION (ID: 3)
- **Permissions** : Lecture seule
- **Restrictions** :
  - Pas d'ajout/modification
  - Voir uniquement les documents validés (sauf permission spéciale)
  - Boutons d'action désactivés

### Permissions spéciales
- **`valide`** : Peut valider les documents
- **`suppression`** : Peut supprimer les documents
- **`plan`** : Accès aux fichiers techniques (plans)
- **`canExportCSV`** : Peut exporter en CSV
- **`canDownloadDocuments`** : Peut télécharger
- **`canPrintDocuments`** : Peut imprimer

---

## Fonctionnalités par écran

### AddDocView - Écran d'ajout de documents

#### Mode Structure
**Étapes obligatoires** :
1. Sélection Type Produit
2. Sélection Produit  
3. Sélection Structure
4. Sélection Section
5. Sélection Subdivision Niveau 1
6. [Conditionnelle] Subdivision Niveau 2
7. [Conditionnelle] Subdivision Niveau 3

**Actions disponibles** :
- **Ajouter** : Ouvre le panneau de création de document
- **Consulter** : Affiche les documents existants
- **Modifier** : Mode modification des documents
- **Supprimer** : Gestion de la suppression
- **Valider Document** : Pour les utilisateurs autorisés
- **Importer Fichiers Source** : Visible uniquement si Subdivision Niv.1 = "PIECES GRAPHIQUES"

**Panneau d'ajout de document (Mode Structure)** :
1. **Description** : Champ texte obligatoire
2. **Fichier PDF** : Sélection fichier .pdf
3. **Fichiers source** : (Visible uniquement si PDF sélectionné ET contexte "Pièces Graphiques")
   - Sélection fichiers/dossier (.dwg, .dxf, .zip)
   - Compression ZIP automatique si multiple
4. **Vidéo** : Sélection fichier vidéo (optionnel)
5. **Photos** : Sélection images (conversion PDF automatique)

#### Mode Contexte (Structure ID = 5)
**Entités gérées** :
- Projets
- Maîtres d'Ouvrage
- Maîtres d'Œuvre
- Sous-traitants Travaux
- Fournisseurs
- BET Sous-traitants
- Direction du Projet

**Actions par entité** :
- **Ajouter/Maj** : Associer l'entité au produit
- **Consulter** : Voir les entités associées
- **Gestion des directeurs** : Pour MOA, MOE, BET
- **Fiches techniques** : Upload de documents PDF

### Documents - Écran de consultation

#### Section Filtres
**Filtres en cascade** :
- Types Produits → Produits
- Structures → Sections
- Subdivisions (3 niveaux)
- Validation (Oui/Non)

**Boutons d'action** :
- **Filtrer** : Applique les critères
- **Annuler le filtre** : Remet à zéro

### Écrans de gestion de la bibliothèque

#### TypeProduitView - Gestion des types de produits
**Fonctionnalités** :
- **Ajout** : Modal avec sélection obligatoire des sections
- **Modification** : Édition de la désignation et description
- **Suppression** : Vérification des dépendances (produits liés)
- **Export CSV** : Liste complète des types

**Modal d'ajout** :
- Champ "Désignation" (obligatoire)
- Champ "Description" (optionnel)
- **Liste des sections** (sélection multiple obligatoire)
- Validation : Au moins une section doit être sélectionnée

#### ProduitView - Gestion des produits
**Règle de gestion** : Sélection obligatoire du type produit
**Fonctionnalités** :
- **Ajout** : 
  - Sélection obligatoire "Type de Produit" (liste déroulante)
  - Champ "Désignation" (obligatoire)
  - Champ "Description" (optionnel)
- **Filtrage** : Par type de produit dans le tableau
- **Validation** : Impossible de créer un produit sans type

#### SubDivisionNv_2View - Types de documents
**Règle de gestion** : Sélection obligatoire de la subdivision niveau 1
**Fonctionnalités** :
- **Ajout** :
  - Sélection obligatoire "Subdivision Niveau 1" (liste déroulante)
  - Champ "Nom" (obligatoire)
  - Champ "Description" (optionnel)
  - Case à cocher "Nécessite subdivision niveau 3"
- **Filtrage** : Par subdivision niveau 1 sélectionnée
- **Validation** : Impossible de créer sans subdivision parente

#### SubDivisionNv_3View - Documents cibles
**Règle de gestion** : Sélection obligatoire de la subdivision niveau 2
**Fonctionnalités** :
- **Ajout** :
  - Sélection obligatoire "Subdivision Niveau 2" (liste déroulante)
  - Champ "Nom" (obligatoire)
  - Champ "Description" (optionnel)
  - Case à cocher "Nécessite subdivision niveau 4"
- **Cascade** : Liste filtrée selon la subdivision niveau 2
- **Validation** : Vérification de l'existence de la subdivision parente

#### SubDivisionNv_4View - Niveau le plus détaillé
**Règle de gestion** : Sélection obligatoire de la subdivision niveau 3
**Fonctionnalités** :
- **Ajout** :
  - Sélection obligatoire "Subdivision Niveau 3" (liste déroulante)
  - Champ "Nom" (obligatoire)
  - Champ "Description" (optionnel)
- **Niveau terminal** : Pas de sous-niveaux
- **Usage** : Définit les documents les plus spécifiques

#### Section Statistiques
**Métriques affichées** :
- Total Documents
- Documents Valides (si autorisé)
- Documents Non Valides (si autorisé)

#### Tableau des résultats
**Colonnes** :
- ID, Description, Type Produit, Produit
- Structure, Section, Classes, Types, Documents cibles
- Créé par (si admin), Fichier, Plan, Vidéo, Photos
- Validation (si autorisé)

**Actions par ligne** :
- **Consulter** : Ouvre le visualiseur
- **Télécharger** : Pour les plans
- **Voir vidéo/photos** : Visualisation multimédia
- **Valider** : Pour les documents non validés

---

## Modales et interactions

### Modal d'ajout dans la bibliothèque
**Déclenchement** : Clic sur bouton "+ Ajouter" dans les écrans de référentiel
**Comportement selon l'écran** :

#### Modal Type Produit
```
┌─────────────────────────────────────┐
│ Ajouter un Type de Produit          │
├─────────────────────────────────────┤
│ Sections * (sélection multiple)     │
│ ☐ Terrassement                      │
│ ☐ Gros œuvre                        │
│ ☐ Second œuvre                      │
│ ☐ Équipements techniques            │
│                                     │
│ Désignation *                       │
│ [_________________________]        │
│                                     │
│ Description                         │
│ [_________________________]        │
├─────────────────────────────────────┤
│              [Ajouter] [Fermer]     │
└─────────────────────────────────────┘
```

#### Modal Produit
```
┌─────────────────────────────────────┐
│ Ajouter un Produit                  │
├─────────────────────────────────────┤
│ Type de Produit *                   │
│ [Sélectionner un type ▼]            │
│                                     │
│ Désignation *                       │
│ [_________________________]        │
│                                     │
│ Description                         │
│ [_________________________]        │
├─────────────────────────────────────┤
│              [Ajouter] [Fermer]     │
└─────────────────────────────────────┘
```

#### Modal Subdivision Niveau 2
```
┌─────────────────────────────────────┐
│ Ajouter Type de Document            │
├─────────────────────────────────────┤
│ Classe de Document (Niv.1) *        │
│ [Sélectionner une classe ▼]         │
│                                     │
│ Nom *                               │
│ [_________________________]        │
│                                     │
│ Description                         │
│ [_________________________]        │
│                                     │
│ ☐ Nécessite subdivision niveau 3    │
├─────────────────────────────────────┤
│              [Ajouter] [Fermer]     │
└─────────────────────────────────────┘
```

### Modal de suppression de document
**Déclenchement** : Clic sur bouton "Supprimer" dans l'écran AddDoc
**Options proposées** :

1. **Supprimer complètement**
   - Supprime le document et tous ses fichiers
   - Action irréversible
   - Confirmation requise

2. **Retirer des éléments du document**
   - Sélection granulaire des éléments à supprimer :
     - ☐ Fichier PDF
     - ☐ Fichiers source
     - ☐ Vidéo  
     - ☐ Photos
   - Permet de garder le document avec certains fichierss ses fichiers
   - Action irréversible
   - Confirmation requise

2. **Retirer des éléments du document**
   - Sélection granulaire des éléments à supprimer :
     - ☐ Fichier PDF
     - ☐ Fichiers source
     - ☐ Vidéo  
     - ☐ Photos
   - Permet de garder le document avec certains fichiers

**Interface suppression document** :
```
┌─────────────────────────────────────┐
│ 🗑️ Supprimer le document            │
├─────────────────────────────────────┤
│ Vous êtes sur le point de supprimer :│
│ [Nom du document]                   │
│                                     │
│ [🗑️ Supprimer complètement]         │
│                ou                   │
│ [📝 Retirer des éléments]           │
│                                     │
│ ⚠️ Cette action est irréversible     │
├─────────────────────────────────────┤
│              [Annuler] [Confirmer]  │
└─────────────────────────────────────┘
```

### Validation des dépendances hiérarchiques
**Messages d'erreur** :
- **Produit sans type** : "Veuillez sélectionner un type de produit avant de créer le produit"
- **Subdivision sans parent** : "Veuillez sélectionner la subdivision de niveau supérieur"
- **Suppression avec dépendances** : "Impossible de supprimer : des éléments dépendent de cette entité"

**Comportements** :
- **Listes déroulantes** : Chargement dynamique selon la sélection parente
- **Boutons désactivés** : Tant que la dépendance n'est pas satisfaite
- **Filtrage automatique** : Affichage uniquement des éléments compatibles

### Modal d'ajout d'entité (Mode Contexte)
**Déclenchement** : Clic "Ajouter" sur une entité en mode contexte
**Fonctionnalités** :
- **Tableau de sélection** : Liste toutes les entités disponibles
- **Recherche** : Filtre en temps réel
- **Actions** :
  - "Ajouter" : Associe l'entité au produit
  - "Enlever" : Dissocie l'entité (si déjà sélectionnée)
  - "Ajouter Directeur" : Pour MOA/MOE/BET
  - "Ajouter Fiche Technique" : Upload PDF

### Modal de validation de document
**Déclenchement** : Clic "Valider" sur un document non validé
**Contenu** :
- Informations du document (ID, Description, Type, Produit, Structure)
- Message de confirmation
- Boutons "Annuler" / "Valider"

### Modal de visualisation de fichiers
**Types supportés** :
- **PDF** : Visualiseur intégré avec zoom, navigation
- **Images** : Affichage optimisé avec actions
- **Vidéos** : Lecteur HTML5 avec contrôles

**Actions disponibles** :
- Télécharger (si autorisé)
- Imprimer (si autorisé)
- Fermer

---

## Gestion des fichiers

### Types de fichiers supportés

#### Documents PDF
- **Extensions** : .pdf
- **Usage** : Document principal
- **Traitement** : Visualisation directe
- **Taille max** : Selon configuration serveur

#### Fichiers source (Pièces Graphiques)
- **Extensions** : .dwg, .dxf, .pdf, .txt, .jpg, .jpeg, .png, .gif
- **Usage** : Plans techniques, dessins
- **Traitement** : Compression ZIP automatique si multiple
- **Accès** : Selon permission `plan`

#### Vidéos
- **Extensions** : .mp4, .mov, .avi, .mkv, .webm
- **Usage** : Contenu multimédia
- **Traitement** : Compression automatique si > seuil
- **Visualisation** : Lecteur HTML5

#### Photos
- **Extensions** : .jpg, .jpeg, .png, .gif
- **Usage** : Images documentaires
- **Traitement** : Conversion automatique en PDF
- **Organisation** : Une photo par page PDF

### Règles de traitement

#### Compression ZIP automatique
```javascript
// Cas 1: Fichier ZIP unique → Envoi direct
if (files.length === 1 && files[0].name.endsWith('.zip')) {
    // Envoi direct du ZIP
}

// Cas 2: Fichiers multiples → Création ZIP
if (files.length > 1) {
    const zip = new JSZip();
    files.forEach(file => zip.file(file.name, file));
    const zipBlob = await zip.generateAsync({type: 'blob'});
}

// Cas 3: Dossier → ZIP du dossier
if (isFolder) {
    // Maintien de la structure de dossiers
    files.forEach(file => {
        const relativePath = file.webkitRelativePath;
        zip.file(relativePath, file);
    });
}
```

#### Conversion photos en PDF
```javascript
// Configuration A4 optimisée
const pageWidth = 210; // mm
const pageHeight = 297; // mm
const margin = 5; // mm

// Une photo par page, centrée, proportions respectées
photos.forEach((photo, index) => {
    if (index > 0) pdf.addPage();
    // Calcul des dimensions optimales
    // Ajout de l'image centrée
});
```

### Gestion des erreurs fichiers

#### Erreurs courantes
- **Fichier trop volumineux** : Message d'erreur avec taille max
- **Format non supporté** : Liste des formats acceptés
- **Échec de compression** : Retry automatique ou message d'erreur
- **Échec d'upload** : Gestion de la reprise d'upload

#### Messages utilisateur
- **Succès** : "Document créé avec succès!"
- **Compression** : "Création du fichier ZIP..."
- **Conversion** : "Conversion des photos en PDF..."
- **Upload** : "Envoi du document au serveur..."

---

## Logs et traçabilité

### Actions loggées
- **CONSULT_FILE** : Consultation d'un document
- **DOWNLOAD_FILE** : Téléchargement d'un fichier
- **PRINT_FILE** : Impression d'un document
- **DELETE** : Suppression d'un document

### Informations tracées
- ID utilisateur
- ID document
- Type d'action
- Timestamp
- Adresse IP (côté serveur)

---

## Responsive Design

### Points de rupture
- **Desktop** : > 1200px - Interface complète
- **Tablet** : 768px - 1200px - Adaptation des colonnes
- **Mobile** : < 768px - Interface simplifiée

### Adaptations mobiles
- **Filtres** : Passage en colonne unique
- **Tableaux** : Scroll horizontal
- **Modales** : Pleine largeur (95vw)
- **Boutons** : Taille tactile optimisée

## Exemples de flux utilisateur

### Création d'un nouveau produit
1. **Accès** : Menu Bibliothèque → Produits
2. **Action** : Clic "+ Ajouter"
3. **Étape 1** : Sélection obligatoire du Type Produit dans la liste déroulante
4. **Étape 2** : Saisie de la désignation (obligatoire)
5. **Étape 3** : Saisie de la description (optionnelle)
6. **Validation** : Clic "Ajouter" → Vérification des champs obligatoires
7. **Résultat** : Produit créé et affiché dans la liste

### Création d'une subdivision niveau 3
1. **Accès** : Menu Bibliothèque → Documents cibles (Subdiv Niv.3)
2. **Action** : Clic "+ Ajouter"
3. **Étape 1** : Sélection obligatoire de la Subdivision Niveau 2
4. **Étape 2** : Saisie du nom (obligatoire)
5. **Étape 3** : Saisie de la description (optionnelle)
6. **Étape 4** : Choix "Nécessite subdivision niveau 4" (optionnel)
7. **Validation** : Vérification de l'existence de la subdivision parente
8. **Résultat** : Subdivision créée dans la hiérarchie

### Tentative de suppression avec dépendances
1. **Action** : Clic "Supprimer" sur un Type Produit ayant des produits
2. **Vérification** : Le système détecte les produits liés
3. **Message** : "Impossible de supprimer : 5 produits dépendent de ce type"
4. **Options** :
   - Supprimer d'abord les produits dépendants
   - Ou réassigner les produits à un autre type
   - Annuler la suppression

---

*Document généré le : $(date)*
*Version : 1.1*
*Projet : FDEM - Fonds Documentaire pour les Études et Méthodes*
*Mise à jour : Ajout des règles de gestion bibliothèque*