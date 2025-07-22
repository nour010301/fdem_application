# Documentation Complète - Application FDEM v2

## Table des Matières

1. [Vue d'ensemble du Projet](#vue-densemble-du-projet)
2. [Architecture Technique](#architecture-technique)
3. [Fonctionnalités Principales](#fonctionnalités-principales)
4. [Gestion des Utilisateurs et Rôles](#gestion-des-utilisateurs-et-rôles)
5. [Modules de l'Application](#modules-de-lapplication)
6. [Système de Documents](#système-de-documents)
7. [Bibliothèque et Arborescence](#bibliothèque-et-arborescence)
8. [Contexte et Relations](#contexte-et-relations)
9. [Interface Utilisateur](#interface-utilisateur)
10. [Sécurité et Authentification](#sécurité-et-authentification)
11. [Installation et Configuration](#installation-et-configuration)

---

## Vue d'ensemble du Projet

### Description
L'application FDEM v2 est un système de gestion documentaire avancé développé avec Vue.js 3 et TypeScript. Elle permet la gestion structurée de documents techniques avec un système d'arborescence hiérarchique et de contexte relationnel.

### Objectifs Principaux
- **Gestion documentaire structurée** : Organisation hiérarchique des documents
- **Contrôle d'accès granulaire** : Système de rôles et permissions
- **Interface moderne et responsive** : Design adaptatif pour tous les appareils
- **Visualisation de documents** : Support PDF, images, vidéos
- **Tableaux de bord analytiques** : Statistiques et graphiques en temps réel

---

## Architecture Technique

### Stack Technologique
- **Frontend** : Vue.js 3 avec Composition API
- **Langage** : TypeScript
- **Build Tool** : Vite
- **Styling** : CSS personnalisé avec design moderne
- **Routing** : Vue Router 4
- **HTTP Client** : Axios avec intercepteurs
- **Charts** : Chart.js
- **PDF Generation** : jsPDF, html2pdf.js
- **PDF Viewing** : PDF.js

### Structure du Projet
```
app_fdem_v2/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── DynamicFormModal.vue
│   │   ├── PdfViewer.vue
│   │   ├── Sidebar.vue
│   │   └── Topbar.vue
│   ├── layouts/            # Layouts de pages
│   │   └── PagesLayout.vue
│   ├── router/             # Configuration du routage
│   │   └── index.ts
│   ├── services/           # Services métier
│   │   ├── authService.ts
│   │   └── logout.ts
│   ├── store/              # Gestion d'état
│   │   └── userStore.ts
│   ├── types/              # Définitions TypeScript
│   ├── views/              # Pages de l'application
│   │   ├── DashboardView.vue
│   │   ├── Documents.vue
│   │   ├── AddDocView.vue
│   │   ├── LoginView.vue
│   │   └── [autres vues...]
│   ├── axios.ts            # Configuration HTTP
│   ├── App.vue             # Composant racine
│   └── main.ts             # Point d'entrée
├── public/                 # Assets statiques
├── package.json            # Dépendances
└── vite.config.ts         # Configuration Vite
```

---

## Fonctionnalités Principales

### 1. Tableau de Bord (Dashboard)
**Localisation** : `/Accueil`

#### Statistiques en Temps Réel
- **Cartes de statistiques modernes** : Affichage des métriques clés
  - Nombre de types de produits
  - Nombre de produits
  - Nombre de structures
  - Nombre de bureaux d'études
  - Nombre de projets
  - Nombre de documents
  - Et autres entités

#### Graphiques Interactifs
- **Graphique de répartition par type de produit** : Visualisation en barres
- **Graphiques temporels des documents** :
  - Par année
  - Par mois
  - Par trimestre
- **Boutons de basculement** pour changer la vue temporelle

#### Documents Récents
- **Liste des 4 derniers documents ajoutés**
- **Informations affichées** :
  - Type de fichier (PDF, Autre)
  - Désignation du document
  - Date de création

### 2. Gestion des Documents
**Localisation** : `/documents`

#### Fonctionnalités de Base
- **Affichage tabulaire** avec pagination
- **Recherche en temps réel** dans tous les champs
- **Tri par colonnes** (ascendant/descendant)
- **Filtrage avancé** par critères multiples

#### Filtres Disponibles
- Type de produit
- Produit
- Section
- Structure
- Subdivisions (4 niveaux)

#### Actions sur Documents
- **Consultation** : Visualisation dans un viewer intégré
- **Téléchargement** (selon permissions)
- **Impression** (selon permissions)
- **Suppression** (selon rôle)
- **Modification** des métadonnées

### 3. Ajout de Documents
**Localisation** : `/add-document`

#### Deux Modes de Création

##### Mode Structure
- **Sélection hiérarchique** :
  1. Type de produit
  2. Produit
  3. Structure
  4. Section
  5. Division Niveau 1
  6. Subdivision Niveau 2 (si applicable)
  7. Subdivision Niveau 3 (si applicable)
  8. Subdivision Niveau 4 (si applicable)

##### Mode Contexte
- **Sélection d'entités contextuelles** :
  - Projets
  - Maîtres d'ouvrage
  - Maîtres d'œuvre
  - Soustraitants de travaux
  - Fournisseurs
  - BET Soustraitants études
  - Direction du projet

#### Types de Fichiers Supportés
- **Documents** : PDF, TXT
- **Images** : JPG, JPEG, PNG, GIF
- **Vidéos** : MP4, MOV, AVI

#### Fonctionnalités Avancées
- **Conversion d'images en PDF** : Sélection multiple d'images
- **Aperçu en temps réel** de l'arborescence sélectionnée
- **Validation des permissions** avant ajout

---

## Gestion des Utilisateurs et Rôles

### Système de Rôles
L'application implémente 4 niveaux de rôles avec des permissions spécifiques :

#### 1. Administrateur Fonctionnel (Profil 1)
**Rôle** : Gestionnaire métier avec tous les droits

##### Accès aux Pages :
- ✅ **Accueil** (`/Accueil`) : Tableau de bord complet
- ✅ **Documents** (`/documents`) : Consultation, filtrage, recherche
- ✅ **Ajouter Document** (`/add-document`) : Création de documents
- ✅ **Utilisateurs** (`/users`) : Gestion complète des utilisateurs
- ✅ **Paramètres** (`/parametre`) : Configuration système
- ✅ **Profil** (`/profile`) : Gestion du profil personnel
- ❌ **Pages Bibliothèque** : Accès restreint (Arborescence)

##### Permissions Spécifiques :
- ✅ **Créer des documents** : Mode Structure et Contexte
- ✅ **Modifier des documents** : Métadonnées et fichiers
- ✅ **Supprimer des documents** : Suppression définitive
- ✅ **Télécharger tous fichiers** : Sans restriction
- ✅ **Imprimer tous documents** : Sans restriction
- ✅ **Gérer les utilisateurs** : Création, modification, suppression
- ✅ **Exporter des données** : CSV, rapports
- ✅ **Accès contexte complet** : Toutes les entités contextuelles
- ✅ **Gestion des directeurs** : Ajout/modification dans contexte

##### Actions dans l'Interface :
- **Boutons "Ajouter"** : Visibles et actifs partout
- **Boutons "Supprimer"** : Visibles et actifs
- **Menu Utilisateurs** : Visible dans la sidebar
- **Export CSV** : Disponible dans les listes
- **Toutes les modales** : Accès complet aux fonctionnalités

---

#### 2. Administrateur Informatique (Profil 2)
**Rôle** : Administrateur technique avec accès système complet

##### Accès aux Pages :
- ✅ **Accueil** (`/Accueil`) : Tableau de bord complet
- ✅ **Documents** (`/documents`) : Consultation, filtrage, recherche
- ✅ **Ajouter Document** (`/add-document`) : Création de documents
- ✅ **Utilisateurs** (`/users`) : Gestion complète des utilisateurs
- ✅ **Paramètres** (`/parametre`) : Configuration système
- ✅ **Profil** (`/profile`) : Gestion du profil personnel
- ✅ **Pages Bibliothèque** : **ACCÈS EXCLUSIF** aux pages d'arborescence
  - ✅ **Produits** (`/produit`)
  - ✅ **Types de Produits** (`/type_produit`)
  - ✅ **Sections** (`/sections`)
  - ✅ **Structures** (`/structures`)
  - ✅ **Subdivisions Niv. 1-4** (`/subdivisions_niv1-4`)
- ✅ **Pages Contexte** : Toutes les pages contextuelles
  - ✅ **Bureau d'Études** (`/bur-etude-list`)
  - ✅ **Fournisseurs** (`/list-fournisseur`)
  - ✅ **Directeurs** (`/list-directeur`)
  - ✅ **Projets Produits** (`/list-projet-produit`)
  - ✅ **Maîtres d'Œuvre** (`/maitre-oeuvre-list`)
  - ✅ **Maîtres d'Ouvrage** (`/maitre-ouvrage-list`)
  - ✅ **Soustraitants** (`/soustraitants`)

##### Permissions Spécifiques :
- ✅ **Toutes les permissions du Profil 1** PLUS :
- ✅ **Gestion de l'arborescence** : CRUD complet sur la structure
- ✅ **Configuration système** : Paramètres avancés
- ✅ **Maintenance des données** : Nettoyage, optimisation
- ✅ **Accès base de données** : Via interface d'administration
- ✅ **Téléchargement illimité** : Tous formats, toutes tailles
- ✅ **Impression illimitée** : Sans restrictions

##### Actions dans l'Interface :
- **Menu Bibliothèque** : Complètement visible avec sous-menus
- **Pages d'arborescence** : Seul profil avec accès
- **Boutons CRUD** : Visibles sur toutes les pages de structure
- **Configuration avancée** : Paramètres système

---

#### 3. Consultation (Profil 3)
**Rôle** : Utilisateur en lecture seule

##### Accès aux Pages :
- ✅ **Accueil** (`/Accueil`) : Tableau de bord (lecture seule)
- ✅ **Documents** (`/documents`) : Consultation et recherche uniquement
- ❌ **Ajouter Document** (`/add-document`) : **ACCÈS INTERDIT**
- ❌ **Utilisateurs** (`/users`) : **ACCÈS INTERDIT**
- ✅ **Paramètres** (`/parametre`) : Consultation uniquement
- ✅ **Profil** (`/profile`) : Consultation du profil personnel
- ❌ **Pages Bibliothèque** : **ACCÈS INTERDIT**
- ❌ **Pages Contexte** : **ACCÈS INTERDIT**

##### Permissions Spécifiques :
- ✅ **Consulter les documents** : Visualisation dans le viewer
- ✅ **Rechercher et filtrer** : Toutes les fonctions de recherche
- ✅ **Voir les statistiques** : Tableaux de bord et graphiques
- ❌ **Créer des documents** : **INTERDIT**
- ❌ **Modifier des documents** : **INTERDIT**
- ❌ **Supprimer des documents** : **INTERDIT**
- ⚠️ **Télécharger** : Selon permission individuelle `telechargement`
- ⚠️ **Imprimer** : Selon permission individuelle `impression`
- ❌ **Gérer les utilisateurs** : **INTERDIT**
- ❌ **Exporter des données** : **INTERDIT**

##### Actions dans l'Interface :
- **Boutons "Ajouter"** : **MASQUÉS** ou **DÉSACTIVÉS**
- **Boutons "Supprimer"** : **MASQUÉS**
- **Boutons "Modifier"** : **MASQUÉS**
- **Menu Utilisateurs** : **MASQUÉ** dans la sidebar
- **Menu Bibliothèque** : **MASQUÉ** dans la sidebar
- **Viewer de documents** : Contrôles de téléchargement/impression conditionnels
- **Tableaux** : Mode consultation uniquement

##### Permissions Individuelles :
- **`telechargement: true`** : Peut télécharger les documents
- **`telechargement: false`** : Pas de téléchargement
- **`impression: true`** : Peut imprimer les documents
- **`impression: false`** : Pas d'impression

---

#### 4. Mise à Jour (Profil 4)
**Rôle** : Utilisateur avec droits de modification

##### Accès aux Pages :
- ✅ **Accueil** (`/Accueil`) : Tableau de bord complet
- ✅ **Documents** (`/documents`) : Consultation, filtrage, recherche
- ✅ **Ajouter Document** (`/add-document`) : Création de documents
- ❌ **Utilisateurs** (`/users`) : **ACCÈS INTERDIT**
- ✅ **Paramètres** (`/parametre`) : Configuration personnelle
- ✅ **Profil** (`/profile`) : Gestion du profil personnel
- ❌ **Pages Bibliothèque** : **ACCÈS INTERDIT** (Arborescence)
- ✅ **Pages Contexte** : Consultation des pages contextuelles

##### Permissions Spécifiques :
- ✅ **Créer des documents** : Mode Structure et Contexte
- ✅ **Modifier des documents** : Métadonnées et fichiers
- ❌ **Supprimer des documents** : **INTERDIT**
- ✅ **Télécharger des fichiers** : Selon permissions individuelles
- ✅ **Imprimer des documents** : Selon permissions individuelles
- ❌ **Gérer les utilisateurs** : **INTERDIT**
- ❌ **Exporter des données** : **INTERDIT**
- ✅ **Accès contexte** : Consultation et sélection pour documents
- ✅ **Gestion des directeurs** : Ajout dans le contexte

##### Actions dans l'Interface :
- **Boutons "Ajouter"** : Visibles et actifs pour les documents
- **Boutons "Supprimer"** : **MASQUÉS** pour les documents
- **Boutons "Modifier"** : Visibles pour les documents
- **Menu Utilisateurs** : **MASQUÉ** dans la sidebar
- **Menu Bibliothèque** : Partiellement visible (contexte uniquement)
- **Modales de création** : Accès complet
- **Export CSV** : **MASQUÉ**

---

### Matrice des Permissions

| Fonctionnalité | Admin Fonc. (1) | Admin IT (2) | Consultation (3) | Mise à Jour (4) |
|----------------|-----------------|--------------|------------------|------------------|
| **Tableau de bord** | ✅ Complet | ✅ Complet | ✅ Lecture seule | ✅ Complet |
| **Consulter documents** | ✅ | ✅ | ✅ | ✅ |
| **Créer documents** | ✅ | ✅ | ❌ | ✅ |
| **Modifier documents** | ✅ | ✅ | ❌ | ✅ |
| **Supprimer documents** | ✅ | ✅ | ❌ | ❌ |
| **Télécharger** | ✅ | ✅ | ⚠️ Conditionnel | ⚠️ Conditionnel |
| **Imprimer** | ✅ | ✅ | ⚠️ Conditionnel | ⚠️ Conditionnel |
| **Gérer utilisateurs** | ✅ | ✅ | ❌ | ❌ |
| **Pages arborescence** | ❌ | ✅ **EXCLUSIF** | ❌ | ❌ |
| **Pages contexte** | ✅ | ✅ | ❌ | ✅ Consultation |
| **Export données** | ✅ | ✅ | ❌ | ❌ |
| **Gestion directeurs** | ✅ | ✅ | ❌ | ✅ |

### Contrôle d'Accès dans le Code

#### Vérifications Automatiques :
```typescript
// Dans userStore.ts
const canAddDocuments = computed(() => 
  userRole.value !== ROLES.CONSULTATION
)

const canManageUsers = computed(() => 
  isAdminFonctionnel.value || isAdminInformatique.value
)

const canViewStructurePages = computed(() => 
  isAdminInformatique.value
)
```

#### Interface Adaptative :
- **Boutons conditionnels** : Affichage selon les permissions
- **Menus dynamiques** : Sidebar adaptée au rôle
- **Redirections automatiques** : Vers pages autorisées
- **Messages d'erreur** : En cas d'accès non autorisé

### Gestion des Permissions
- **Contrôle granulaire** par fonctionnalité
- **Vérification côté client et serveur**
- **Interface adaptative** selon les droits
- **Audit des actions** : Traçabilité par utilisateur

---

## Modules de l'Application

### 1. Authentification
**Fichiers** : `LoginView.vue`, `authService.ts`

#### Fonctionnalités
- **Connexion sécurisée** avec JWT
- **Refresh automatique** des tokens
- **Déconnexion propre**
- **Redirection automatique** selon l'état d'authentification

### 2. Profil Utilisateur
**Localisation** : `/profile`

#### Informations Affichées
- Nom et prénom
- Email
- Poste et département
- Téléphone
- Profil/rôle
- Permissions spécifiques

### 3. Gestion des Utilisateurs
**Localisation** : `/users`
**Accès** : Administrateurs uniquement

#### Fonctionnalités
- **Liste des utilisateurs** avec filtrage
- **Création de nouveaux comptes**
- **Modification des profils**
- **Gestion des permissions**
- **Activation/désactivation** des comptes

---

## Système de Documents

### Structure Hiérarchique
L'application organise les documents selon une arborescence à 8 niveaux :

1. **Type de Produit** : Catégorie principale
2. **Produit** : Sous-catégorie du type
3. **Structure** : Organisation structurelle
4. **Section** : Division de la structure
5. **Subdivision Niveau 1** : Premier niveau de subdivision
6. **Subdivision Niveau 2** : Deuxième niveau (optionnel)
7. **Subdivision Niveau 3** : Troisième niveau (optionnel)
8. **Subdivision Niveau 4** : Quatrième niveau (optionnel)

### Métadonnées des Documents
Chaque document contient :
- **Identifiant unique**
- **Désignation**
- **Chemin du fichier**
- **Version**
- **Date de création**
- **Date de modification**
- **Références hiérarchiques** complètes

### Visualiseur Intégré
**Composant** : `PdfViewer.vue`

#### Fonctionnalités
- **Visualisation PDF** native
- **Support des images** (JPG, PNG, GIF)
- **Lecture vidéo** (MP4, MOV, AVI)
- **Contrôles de téléchargement/impression** selon permissions
- **Interface responsive**

---

## Bibliothèque et Arborescence

### Pages de Structure
**Accès** : Administrateur Informatique uniquement

#### Arborescence
- **Produits** (`/produit`) : Gestion des produits
- **Types de Produits** (`/type_produit`) : Gestion des types
- **Sections** (`/sections`) : Gestion des sections
- **Structures** (`/structures`) : Gestion des structures
- **Subdivisions Niveau 1-4** : Gestion des subdivisions

#### Fonctionnalités par Page
- **CRUD complet** (Create, Read, Update, Delete)
- **Validation des données**
- **Relations hiérarchiques**
- **Interface de gestion intuitive**

### Navigation Hiérarchique
**Composant** : `Sidebar.vue`

#### Structure du Menu
- **Accueil** : Tableau de bord
- **Documents** : Gestion documentaire
- **Ajouter Document** : Création de documents
- **Bibliothèque** (menu déroulant) :
  - **Arborescence** : Pages de structure
  - **Contexte** : Pages contextuelles
- **Utilisateurs** : Gestion des comptes
- **Paramètres** : Configuration
- **Déconnexion**

---

## Contexte et Relations

### Entités Contextuelles
L'application gère les relations entre documents et entités métier :

#### 1. Projets
- **Code unique**
- **Description**
- **Adresse et wilaya**
- **Relations avec directeurs**

#### 2. Maîtres d'Ouvrage/d'Œuvre
- **Désignation**
- **Description**
- **Coordonnées complètes**
- **Directeurs associés** avec dates

#### 3. Fournisseurs
- **Désignation**
- **Description**
- **Adresse et contacts**
- **Relations produits**

#### 4. Soustraitants
- **Travaux** et **Études** (BET)
- **Informations complètes**
- **Directeurs et dates**

#### 5. Direction de Projet
- **Directeurs par projet**
- **Périodes d'affectation**
- **Fonctions et contacts**

### Gestion des Relations
- **Associations multiples** possibles
- **Dates de début/fin** pour les affectations
- **Interface de sélection** intuitive
- **Validation des contraintes** métier

---

## Interface Utilisateur

### Design System
- **Palette de couleurs** : Bleu/vert avec dégradés
- **Typographie** : Inter, Segoe UI, Roboto
- **Composants** : Design moderne et cohérent
- **Animations** : Transitions fluides

### Responsive Design
- **Mobile First** : Adaptation automatique
- **Breakpoints** : 600px, 900px, 1200px
- **Navigation adaptative** : Menu burger sur mobile
- **Tableaux responsifs** : Scroll horizontal si nécessaire

### Accessibilité
- **Contraste élevé** : Respect des standards WCAG
- **Navigation clavier** : Support complet
- **Labels sémantiques** : Aria-labels appropriés
- **Focus visible** : Indicateurs clairs

### Composants Réutilisables

#### 1. Modales Dynamiques
**Composant** : `DynamicFormModal.vue`
- **Configuration flexible**
- **Validation intégrée**
- **Actions personnalisables**

#### 2. Tableaux de Données
- **Tri et filtrage**
- **Pagination**
- **Actions en ligne**
- **Export de données**

#### 3. Formulaires
- **Validation en temps réel**
- **Messages d'erreur contextuels**
- **Champs conditionnels**

---

## Sécurité et Authentification

### Authentification JWT
**Fichier** : `axios.ts`

#### Fonctionnalités
- **Tokens d'accès** : Durée limitée
- **Refresh tokens** : Renouvellement automatique
- **Intercepteurs HTTP** : Gestion transparente
- **Déconnexion automatique** : En cas d'expiration

### Protection des Routes
**Fichier** : `router/index.ts`

#### Mécanismes
- **Guards de navigation** : Vérification avant accès
- **Redirection automatique** : Vers login si non authentifié
- **Contrôle des permissions** : Par rôle utilisateur

### Sécurité des Données
- **Validation côté client** : Première ligne de défense
- **Sanitisation** : Nettoyage des entrées utilisateur
- **Contrôle d'accès** : Vérification des permissions
- **Audit trail** : Traçabilité des actions

---

## Installation et Configuration

### Prérequis
- **Node.js** : Version 16 ou supérieure
- **npm** ou **yarn** : Gestionnaire de paquets
- **Navigateur moderne** : Support ES6+

### Installation
```bash
# Cloner le projet
git clone [repository-url]
cd app_fdem_v2

# Installer les dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Lancement en développement
npm run dev

# Build pour production
npm run build
```

### Variables d'Environnement
```env
VITE_API_URL=http://your-api-url/api/
```

### Dépendances Principales
```json
{
  "vue": "^3.5.13",
  "vue-router": "^4.5.0",
  "axios": "^1.8.4",
  "typescript": "~5.7.2",
  "chart.js": "^4.4.9",
  "jspdf": "^2.5.1",
  "html2pdf.js": "^0.10.3",
  "pdfjs-dist": "^5.2.133"
}
```

### Scripts Disponibles
- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run preview` : Aperçu du build

---

## Fonctionnalités Avancées

### 1. Filtrage Intelligent
- **Filtres en cascade** : Mise à jour automatique des options
- **Recherche textuelle** : Dans tous les champs simultanément
- **Sauvegarde des filtres** : Persistance de session

### 2. Export de Données
- **Format CSV** : Pour analyse externe
- **Sélection personnalisée** : Colonnes à exporter
- **Filtres appliqués** : Export des données filtrées

### 3. Gestion des Fichiers
- **Upload multiple** : Sélection de plusieurs fichiers
- **Conversion automatique** : Images vers PDF
- **Validation des types** : Contrôle des formats
- **Optimisation** : Compression et redimensionnement

### 4. Notifications
- **Messages de succès/erreur** : Feedback utilisateur
- **Confirmations** : Pour actions critiques
- **Indicateurs de chargement** : États d'attente

---

## Maintenance et Évolution

### Structure Modulaire
- **Composants découplés** : Facilite la maintenance
- **Services séparés** : Logique métier isolée
- **Types TypeScript** : Documentation du code

### Bonnes Pratiques
- **Code review** : Validation par les pairs
- **Tests unitaires** : Couverture des fonctionnalités critiques
- **Documentation** : Commentaires et README
- **Versioning** : Git avec branches de fonctionnalités

### Évolutions Futures
- **API REST** : Extension des endpoints
- **Notifications push** : Alertes en temps réel
- **Workflow** : Processus d'approbation
- **Intégrations** : Systèmes externes

---

## Support et Contact

### Documentation Technique
- **Code source** : Commentaires détaillés
- **Architecture** : Diagrammes et schémas
- **API** : Documentation des endpoints

### Formation Utilisateurs
- **Guides d'utilisation** : Par rôle utilisateur
- **Vidéos tutorielles** : Fonctionnalités principales
- **FAQ** : Questions fréquentes

---

*Cette documentation couvre l'ensemble des fonctionnalités de l'application FDEM v2. Pour des questions spécifiques ou des demandes d'évolution, veuillez contacter l'équipe de développement.*

---

## Détails Techniques Approfondis

### Architecture des Composants

#### 1. Structure des Fichiers Vue
**Pattern utilisé** : Composition API avec `<script setup lang="ts">`

**Exemple type** :
```typescript
// Imports
import { ref, computed, onMounted } from 'vue'
import axiosInstance from '../axios'
import { useUserStore } from '../store/userStore'

// Interfaces TypeScript
interface Document {
  idDocument: number
  designation: string
  // ...
}

// État réactif
const documents = ref<Document[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const filteredDocuments = computed(() => {
  // Logique de filtrage
})

// Méthodes
async function fetchDocuments() {
  // Logique de récupération
}

// Lifecycle
onMounted(() => {
  fetchDocuments()
})
```

#### 2. Gestion d'État avec Pinia
**Store utilisateur** (`userStore.ts`) :
- **État centralisé** : Profil utilisateur, permissions
- **Computed properties** : Vérifications de rôles
- **Actions** : Récupération du profil, mise à jour
- **Réactivité** : Mise à jour automatique de l'interface

#### 3. Système de Routage
**Configuration** (`router/index.ts`) :
- **Guards de navigation** : Vérification d'authentification
- **Méta-données** : Titres de pages, permissions requises
- **Redirections** : Gestion des accès non autorisés
- **Lazy loading** : Chargement différé des composants

### API et Communication

#### 1. Configuration Axios
**Intercepteurs** :
- **Request** : Ajout automatique du token Bearer
- **Response** : Gestion du refresh token automatique
- **Erreurs** : Redirection vers login si 401
- **Retry** : Nouvelle tentative après refresh

#### 2. Endpoints Principaux
**Documents** :
- `GET /documents/` : Liste paginée
- `POST /documents/` : Création avec upload
- `PUT /documents/{id}/` : Modification
- `DELETE /documents/{id}/` : Suppression
- `GET /documentsFilter/` : Filtrage avancé

**Utilisateurs** :
- `GET /utilisateurs/` : Liste des utilisateurs
- `POST /api/register/` : Création de compte
- `POST /utilisateurs/update-produits-types/` : Mise à jour permissions
- `DELETE /utilisateurs/` : Suppression

**Arborescence** :
- `GET /types/` : Types de produits
- `GET /produits/by-type/{id}/` : Produits par type
- `GET /structures/` : Structures
- `GET /subdivision-nv{1-4}/` : Subdivisions par niveau

#### 3. Gestion des Erreurs
**Stratégies** :
- **Retry automatique** : 3 tentatives avec backoff
- **Fallback** : Données en cache si disponibles
- **Messages utilisateur** : Erreurs traduites en français
- **Logging** : Envoi des erreurs au serveur (futur)

### Sécurité Implémentée

#### 1. Authentification JWT
**Tokens** :
- **Access Token** : Durée courte (15-30 min)
- **Refresh Token** : Durée longue (7-30 jours)
- **Stockage** : localStorage (à migrer vers httpOnly cookies)
- **Rotation** : Nouveau refresh à chaque utilisation

#### 2. Contrôle d'Accès
**Niveaux** :
- **Route level** : Guards de navigation
- **Component level** : Affichage conditionnel
- **API level** : Vérification côté serveur
- **UI level** : Boutons désactivés selon permissions

#### 3. Validation des Données
**Côté Client** :
- **TypeScript** : Typage strict des données
- **Validation de formulaires** : Règles métier
- **Sanitisation** : Nettoyage des entrées utilisateur

**Côté Serveur** :
- **Validation des schémas** : Vérification des structures
- **Contrôle des permissions** : Vérification des droits
- **Audit trail** : Traçabilité des actions

### Performance et Optimisation

#### 1. Optimisations Frontend
**Bundle** :
- **Tree shaking** : Élimination du code mort
- **Code splitting** : Chargement par route
- **Compression** : Gzip/Brotli
- **Minification** : Réduction de la taille

**Runtime** :
- **Virtual DOM** : Optimisations Vue.js
- **Computed caching** : Cache des calculs
- **Event debouncing** : Limitation des appels
- **Image lazy loading** : Chargement différé

#### 2. Optimisations Réseau
**Requêtes** :
- **Pagination** : Chargement par pages
- **Filtrage côté serveur** : Réduction des données
- **Compression** : Réduction de la bande passante
- **Cache HTTP** : Headers de cache appropriés

#### 3. Optimisations Base de Données
**Requêtes** :
- **Index** : Sur les colonnes de recherche/tri
- **Jointures optimisées** : Réduction des N+1
- **Pagination** : LIMIT/OFFSET efficaces
- **Cache de requêtes** : Redis/Memcached

### Monitoring et Debugging

#### 1. Outils de Développement
**Vue DevTools** :
- **Inspection des composants** : État et props
- **Timeline** : Événements et mutations
- **Performance** : Profiling des composants
- **Routing** : Navigation et guards

#### 2. Logging
**Niveaux** :
- **Error** : Erreurs critiques
- **Warn** : Avertissements
- **Info** : Informations générales
- **Debug** : Détails de développement

**Destinations** :
- **Console** : Développement local
- **Serveur** : Logs centralisés (futur)
- **Fichiers** : Stockage local (futur)

### Tests et Qualité

#### 1. Tests Unitaires (À implémenter)
**Framework** : Vitest + Vue Test Utils
**Couverture** :
- **Composants** : Rendu et interactions
- **Store** : Actions et mutations
- **Utils** : Fonctions utilitaires
- **API** : Mocks des appels

#### 2. Tests d'Intégration (À implémenter)
**Framework** : Cypress/Playwright
**Scénarios** :
- **Authentification** : Login/logout
- **CRUD** : Création/modification/suppression
- **Navigation** : Parcours utilisateur
- **Permissions** : Contrôles d'accès

#### 3. Qualité du Code
**Outils** :
- **ESLint** : Règles de codage
- **Prettier** : Formatage automatique
- **TypeScript** : Vérification de types
- **Husky** : Hooks Git (futur)

### Déploiement et DevOps

#### 1. Build et Packaging
**Vite** :
- **Hot Module Replacement** : Développement rapide
- **Optimisations** : Tree shaking, minification
- **Assets** : Gestion des ressources statiques
- **Environnements** : Variables par environnement

#### 2. Déploiement
**Stratégies** :
- **Static hosting** : Netlify, Vercel
- **CDN** : Distribution globale
- **Docker** : Containerisation (futur)
- **CI/CD** : Déploiement automatique (futur)

### Maintenance et Évolution

#### 1. Versioning
**Semantic Versioning** :
- **Major** : Changements incompatibles
- **Minor** : Nouvelles fonctionnalités
- **Patch** : Corrections de bugs

#### 2. Migration et Mise à Jour
**Stratégies** :
- **Backward compatibility** : Compatibilité ascendante
- **Feature flags** : Activation progressive
- **Database migrations** : Scripts de migration
- **Rollback** : Procédures de retour arrière

---

## Évolutions Futures

### Phase 2 (Court terme)
- **Notifications push** : Alertes temps réel
- **Workflow d'approbation** : Processus de validation
- **Audit trail complet** : Traçabilité détaillée
- **Export Excel** : Format natif Microsoft

### Phase 3 (Moyen terme)
- **API REST complète** : Documentation OpenAPI
- **Mobile app** : Application native
- **Intégrations** : Systèmes externes
- **Analytics** : Tableaux de bord avancés

### Phase 4 (Long terme)
- **Intelligence artificielle** : Classification automatique
- **OCR** : Extraction de texte des images
- **Recherche sémantique** : Recherche par contenu
- **Collaboration** : Édition collaborative

---

*Cette documentation technique complète couvre tous les aspects de l'application FDEM v2, de l'interface utilisateur aux détails d'implémentation. Elle est conçue pour servir de référence aux développeurs, administrateurs et utilisateurs finaux.*

**Version du document** : 2.0  
**Dernière mise à jour** : Décembre 2024  
**Auteur** : Équipe de développement FDEM  
**Contact** : support@fdem.dz