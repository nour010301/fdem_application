# Documentation Complète - FDEM (Fond Documentaire)

## Vue d'ensemble du Projet

**FDEM** est une application de gestion documentaire développée avec Vue 3, TypeScript et Vite. Elle permet la gestion, la recherche, et la consultation de documents techniques avec un système de permissions basé sur les rôles utilisateurs.

### Technologies Utilisées

- **Frontend**: Vue 3 avec Composition API, TypeScript
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Styling**: CSS personnalisé avec design responsive
- **Authentification**: JWT Token
- **Visualisation**: Chart.js pour les statistiques
- **PDF**: PDF.js pour la visualisation, jsPDF pour la génération
- **Compression**: JSZip pour les archives

## Architecture du Projet

```
src/
├── assets/           # Ressources statiques (images, styles)
├── components/       # Composants réutilisables
├── layouts/          # Layouts de pages
├── router/           # Configuration du routage
├── services/         # Services (auth, logs, etc.)
├── store/            # Gestion d'état (Pinia/Composition API)
├── types/            # Définitions TypeScript
├── utils/            # Utilitaires
├── views/            # Pages/Vues de l'application
├── App.vue           # Composant racine
└── main.ts           # Point d'entrée
```

## Système de Rôles et Permissions

### Rôles Disponibles

#### 1. **Administrateur Fonctionnel** (Profil ID: 1)
- **Accès**: Toutes les fonctionnalités sauf gestion des utilisateurs
- **Permissions**:
  - ✅ Ajout de documents
  - ✅ Suppression de documents
  - ✅ Export CSV
  - ✅ Accès aux actions bibliothèque
  - ❌ Gestion des utilisateurs
  - ❌ Accès aux pages de structure (subdivisions)

#### 2. **Administrateur Informatique** (Profil ID: 2)
- **Accès**: Toutes les fonctionnalités (accès complet)
- **Permissions**:
  - ✅ Gestion des utilisateurs
  - ✅ Ajout/suppression de documents
  - ✅ Export CSV
  - ✅ Accès aux pages de structure
  - ✅ Voir la colonne "Créé par"
  - ✅ Téléchargement/impression automatique
  - ✅ Activation/désactivation des comptes

#### 3. **Consultation** (Profil ID: 3)
- **Accès**: Lecture seule avec restrictions
- **Permissions**:
  - ❌ Ajout de documents
  - ❌ Suppression de documents
  - ❌ Export CSV
  - ❌ Gestion des utilisateurs
  - ✅ Consultation uniquement des documents validés
  - 🔒 Permissions spécifiques requises pour téléchargement/impression

#### 4. **Mise à Jour** (Profil ID: 4)
- **Accès**: Consultation + ajout de documents
- **Permissions**:
  - ✅ Ajout de documents
  - ✅ Consultation de tous les documents
  - ❌ Suppression de documents
  - ❌ Gestion des utilisateurs
  - 🔒 Permissions spécifiques requises pour téléchargement/impression

### Permissions Spécifiques

Chaque utilisateur peut avoir des permissions individuelles :

- **`impression`**: Autorisation d'imprimer les documents
- **`telechargement`**: Autorisation de télécharger les documents
- **`plan`**: Autorisation d'accéder aux plans AutoCAD/ZIP
- **`suppression`**: Autorisation de supprimer les documents
- **`valide`**: Autorisation de valider les documents

## Fonctionnalités Principales

### 1. **Authentification et Sécurité**

#### Connexion
- Authentification par nom d'utilisateur/mot de passe
- Génération et gestion de tokens JWT
- Redirection automatique selon les permissions

#### Gestion de Session
- Stockage sécurisé des tokens
- Déconnexion automatique en cas d'expiration
- Protection des routes par middleware

### 2. **Gestion des Documents**

#### Ajout de Documents
- **Accès**: Administrateurs + Mise à jour
- **Fonctionnalités**:
  - Upload de fichiers multiples (PDF, images, vidéos)
  - Conversion automatique d'images en PDF
  - Classification hiérarchique (Type → Produit → Structure → Section → Subdivisions)
  - Métadonnées automatiques (date, utilisateur)
  - **Mode Structure**: Gestion documentaire classique avec arborescence
  - **Mode Contexte**: Gestion des intervenants et projets
  - **Pièces Graphiques**: Import de fichiers sources (AutoCAD, ZIP)
  - **Compression vidéo**: Optimisation automatique des fichiers volumineux
  - **Fiches techniques**: Upload de documents PDF pour chaque intervenant
  - **Gestion des directeurs**: Attribution de directeurs aux projets avec dates
  - **Interface resizable**: Panneaux ajustables pour optimiser l'espace de travail

#### Recherche et Filtrage
- **Filtres disponibles**:
  - Type de produit
  - Produit
  - Structure
  - Section
  - Subdivisions (4 niveaux)
  - Statut de validation
- **Recherche textuelle** dans tous les champs
- **Tri** par colonnes
- **Pagination** des résultats

#### Consultation de Documents
- **Visualiseurs intégrés**:
  - PDF avec PDF.js
  - Images (JPG, PNG, GIF)
  - Vidéos (MP4, MOV, AVI)
- **Actions disponibles** (selon permissions):
  - Téléchargement
  - Impression
  - Consultation en plein écran

#### Validation de Documents
- **Accès**: Utilisateurs avec permission `valide`
- **Processus**: Validation manuelle avec confirmation
- **Effet**: Les documents validés deviennent visibles pour les utilisateurs "Consultation"

### 3. **Gestion des Utilisateurs**

#### Création de Comptes
- **Accès**: Administrateurs uniquement
- **Processus en étapes**:
  1. Informations utilisateur (nom, prénom, email, profil)
  2. Sélection des types de produits
  3. Sélection des produits spécifiques
  4. Attribution des permissions

#### Gestion des Permissions
- Attribution granulaire des permissions par utilisateur
- Restriction d'accès par types de produits et produits
- Modification des permissions existantes

#### Activation/Désactivation
- **Accès**: Administrateur Informatique uniquement
- Désactivation temporaire sans suppression
- Historique des statuts

### 4. **Bibliothèque et Classification**

#### Arborescence
- **Types de Produit**: Catégories principales
- **Produits**: Sous-catégories par type
- **Sections**: Divisions par produit
- **Structures**: Organisation par section
- **Subdivisions**: 4 niveaux hiérarchiques

#### Contexte
- **Projets**: Gestion des projets
- **Intervenants**:
  - Bureaux d'étude
  - Fournisseurs
  - Directeurs
  - Maîtres d'œuvre
  - Maîtres d'ouvrage
  - Sous-traitants

### 5. **Statistiques et Reporting**

#### Tableau de Bord
- Nombre total de documents
- Documents validés/non validés
- Statistiques par utilisateur (pour admins)
- Graphiques de répartition

#### Logs d'Activité
- Traçabilité des actions utilisateurs
- Types d'actions loggées:
  - `CONSULT_FILE`: Consultation de fichier
  - `DOWNLOAD_FILE`: Téléchargement
  - `PRINT_FILE`: Impression
  - `DELETE`: Suppression

### 6. **Gestion des Profils**

#### Profil Utilisateur
- Consultation des informations personnelles
- Modification du mot de passe
- Affichage des permissions attribuées

#### Paramètres
- Configuration des préférences
- Gestion des notifications
- Personnalisation de l'interface

## Interface Utilisateur

### Navigation Principale

#### Sidebar Adaptative
- **Accueil**: Tableau de bord
- **Fond Documentaire**: Ajout de documents
- **Recherche**: Consultation et filtrage
- **Bibliothèque**: (Selon permissions)
  - Arborescence (Types, Produits, Sections, Structures, Subdivisions)
  - Contexte (Projets, Intervenants)
- **Utilisateurs**: Gestion des comptes (Admins uniquement)
- **Paramètres**: Configuration
- **Profil**: Informations personnelles
- **Déconnexion**

#### Topbar
- Logo et titre de l'application
- Informations utilisateur connecté
- Bouton de basculement sidebar (mobile)

### Composants Réutilisables

#### Visualiseurs de Fichiers
- **PdfViewer**: Affichage PDF avec contrôles
- **ImageViewer**: Galerie d'images avec zoom
- **VideoViewer**: Lecteur vidéo intégré
- **FileViewer**: Sélecteur automatique selon le type

#### Modales et Formulaires
- **DynamicFormModal**: Formulaires configurables
- Modales de confirmation
- Assistants multi-étapes (création utilisateur)

## Sécurité et Contrôle d'Accès

### Protection des Routes
```typescript
// Middleware de vérification d'authentification
router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public)
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoggedIn = !!localStorage.getItem('access_token')
  
  if (requiresAuth && !isLoggedIn) {
    return next('/login')
  }
  return next()
})
```

### Contrôle d'Accès Basé sur les Rôles (RBAC)
```typescript
// Vérifications de permissions
const canManageUsers = computed(() => isAdminInformatique.value)
const canAddDocuments = computed(() => 
  isAdminFonctionnel.value || isAdminInformatique.value || isMiseAJour.value
)
const canDeleteItems = computed(() => 
  isAdminFonctionnel.value || isAdminInformatique.value
)
```

### Filtrage des Données
- Les utilisateurs "Consultation" ne voient que les documents validés
- Restriction d'accès aux types de produits et produits autorisés
- Masquage conditionnel des colonnes sensibles

## Configuration et Déploiement

### Variables d'Environnement
```env
VITE_API_BASE_URL=http://10.10.150.75:8000/api/
VITE_APP_TITLE=FDEM APP
```

### Scripts de Build
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

### Dépendances Principales
- **Vue 3**: Framework frontend
- **TypeScript**: Typage statique
- **Axios**: Client HTTP
- **Vue Router**: Routage SPA
- **Chart.js**: Graphiques
- **PDF.js**: Visualisation PDF
- **jsPDF**: Génération PDF
- **JSZip**: Compression de fichiers

## Modèles de Données

### Entités Principales

#### Document
| Attribut | Type | Nullable | Description |
|----------|------|----------|-------------|
| idDocument | number | ❌ | Clé primaire |
| designation | string | ✅ | Description du document |
| idTypeProduit | number | ✅ | Référence vers TypeProduit |
| idProduit | number | ✅ | Référence vers Produit |
| idStructure | number | ✅ | Référence vers Structure |
| idSection | number | ✅ | Référence vers Section |
| idSubDivisionNv_1 | number | ✅ | Référence vers SubDivisionNv1 |
| idSubDivisionNv_2 | number | ✅ | Référence vers SubDivisionNv2 |
| idSubDivisionNv_3 | number | ✅ | Référence vers SubDivisionNv3 |
| idSubDivisionNv_4 | number | ✅ | Référence vers SubDivisionNv4 |
| chemin | string | ✅ | Chemin de stockage |
| version | string | ✅ | Version du document |
| dateCreation | datetime | ❌ | Date de création |
| dateModification | datetime | ✅ | Date de dernière modification |
| fichier | string | ✅ | URL du fichier principal |
| nomFichier | string | ✅ | Nom original du fichier |
| video | string | ✅ | URL du fichier vidéo |
| photos | string | ✅ | URL de l'archive photos |
| nomPhotos | string | ✅ | Nom de l'archive photos |
| plan | string | ✅ | URL du plan AutoCAD/ZIP |
| valide | boolean | ❌ | Statut de validation (défaut: false) |
| creerPar | number | ✅ | ID de l'utilisateur créateur |

#### Utilisateur
| Attribut | Type | Nullable | Description |
|----------|------|----------|-------------|
| id | number | ❌ | Clé primaire |
| username | string | ❌ | Nom d'utilisateur unique |
| password | string | ❌ | Mot de passe hashé |
| email | string | ✅ | Adresse email |
| nom | string | ✅ | Nom de famille |
| prenom | string | ✅ | Prénom |
| poste | string | ✅ | Poste occupé |
| telephone | string | ✅ | Numéro de téléphone |
| departement | string | ✅ | Département |
| profil | number | ❌ | Référence vers Profil |
| types_produits | number[] | ✅ | IDs des types autorisés |
| produits | number[] | ✅ | IDs des produits autorisés |
| impression | boolean | ❌ | Permission impression (défaut: false) |
| telechargement | boolean | ❌ | Permission téléchargement (défaut: false) |
| plan | boolean | ❌ | Permission plans (défaut: false) |
| suppression | boolean | ❌ | Permission suppression (défaut: false) |
| valide | boolean | ❌ | Permission validation (défaut: false) |
| is_active | boolean | ❌ | Statut actif (défaut: true) |
| date_joined | datetime | ❌ | Date de création du compte |
| last_login | datetime | ✅ | Dernière connexion |

#### TypeProduit
| Attribut | Type | Nullable | Description |
|----------|------|----------|-------------|
| idTypeProduit | number | ❌ | Clé primaire |
| designation | string | ❌ | Nom du type de produit |

#### Produit
| Attribut | Type | Nullable | Description |
|----------|------|----------|-------------|
| idProduit | number | ❌ | Clé primaire |
| designation | string | ❌ | Nom du produit |
| idTypeProduit | number | ❌ | Référence vers TypeProduit |

#### Structure
| Attribut | Type | Nullable | Description |
|----------|------|----------|-------------|
| idStructure | number | ❌ | Clé primaire |
| designation | string | ✅ | Nom de la structure |
| nom | string | ✅ | Nom alternatif |
| idProduit | number | ✅ | Référence vers Produit |

## API Détaillée

### Base URL
```
http://10.10.150.75:8000/api/
```

### Authentification

#### POST /api/login/
**Description**: Authentification utilisateur

| Paramètre | Type | Requis | Description |
|-----------|------|--------|--------------|
| username | string | ✅ | Nom d'utilisateur |
| password | string | ✅ | Mot de passe |

**Réponse**:
| Champ | Type | Description |
|-------|------|--------------|
| token | string | JWT token d'authentification |
| user | object | Informations utilisateur |

#### GET /profile/
**Description**: Récupération du profil utilisateur connecté

**Réponse**:
| Champ | Type | Description |
|-------|------|--------------|
| idUser | number | Identifiant unique |
| username | string | Nom d'utilisateur |
| email | string | Adresse email |
| nom | string | Nom de famille |
| prenom | string | Prénom |
| telephone | string | Numéro de téléphone |
| departement | string | Département |
| profil | number | ID du profil (1-4) |
| types_produits | number[] | IDs des types de produits autorisés |
| produits | number[] | IDs des produits autorisés |
| impression | boolean | Permission d'impression |
| telechargement | boolean | Permission de téléchargement |
| plan | boolean | Permission d'accès aux plans |
| suppression | boolean | Permission de suppression |
| valide | boolean | Permission de validation |

### Gestion des Documents

#### GET /documents/
**Description**: Liste complète des documents

**Réponse**: Array d'objets Document
| Champ | Type | Description |
|-------|------|--------------|
| idDocument | number | Identifiant unique |
| designation | string | Description du document |
| idTypeProduit | number | ID du type de produit |
| idProduit | number | ID du produit |
| fichier | string | URL du fichier principal |
| video | string | URL de la vidéo |
| photos | string | URL des photos |
| plan | string | URL du plan AutoCAD/ZIP |
| valide | boolean | Statut de validation |
| dateCreation | string | Date de création (ISO) |
| creerParUsername | string | Nom d'utilisateur créateur |

#### GET /documentsFilter/
**Description**: Documents filtrés selon critères

**Paramètres de requête**:
| Paramètre | Type | Requis | Description |
|-----------|------|--------|--------------|
| idTypeProduit | number | ❌ | Filtre par type de produit |
| idProduit | number | ❌ | Filtre par produit |
| idStructure | number | ❌ | Filtre par structure |
| idSection | number | ❌ | Filtre par section |
| valide | boolean | ❌ | Filtre par statut de validation |

#### POST /documents/
**Description**: Création d'un nouveau document

| Paramètre | Type | Requis | Description |
|-----------|------|--------|--------------|
| designation | string | ✅ | Description du document |
| idTypeProduit | number | ✅ | ID du type de produit |
| idProduit | number | ✅ | ID du produit |
| fichier | file | ❌ | Fichier principal |
| video | file | ❌ | Fichier vidéo |
| photos | file | ❌ | Archive photos |
| plan | file | ❌ | Plan AutoCAD/ZIP |

### Gestion des Utilisateurs

#### GET /utilisateurs/
**Description**: Liste de tous les utilisateurs

**Réponse**: Array d'objets Utilisateur
| Champ | Type | Description |
|-------|------|--------------|
| id | number | Identifiant unique |
| username | string | Nom d'utilisateur |
| email | string | Adresse email |
| nom | string | Nom de famille |
| prenom | string | Prénom |
| profil | object | Objet profil avec id et nom |
| types_produits | number[] | IDs des types de produits autorisés |
| produits | number[] | IDs des produits autorisés |
| impression | boolean | Permission d'impression |
| telechargement | boolean | Permission de téléchargement |
| plan | boolean | Permission d'accès aux plans |
| suppression | boolean | Permission de suppression |
| valide | boolean | Permission de validation |
| is_active | boolean | Statut actif/inactif |

#### POST /api/register/
**Description**: Création d'un nouveau compte utilisateur

| Paramètre | Type | Requis | Description |
|-----------|------|--------|--------------|
| username | string | ✅ | Nom d'utilisateur unique |
| password | string | ✅ | Mot de passe |
| email | string | ✅ | Adresse email |
| nom | string | ✅ | Nom de famille |
| prenom | string | ✅ | Prénom |
| profil | number | ✅ | ID du profil (1-4) |

### Bibliothèque

#### GET /types/
**Description**: Liste de tous les types de produit

**Réponse**: Array d'objets TypeProduit
| Champ | Type | Description |
|-------|------|--------------|
| idTypeProduit | number | Identifiant unique |
| designation | string | Nom du type de produit |

#### GET /produits/by-type/{id}/
**Description**: Produits filtrés par type

**Réponse**: Array d'objets Produit
| Champ | Type | Description |
|-------|------|--------------|
| idProduit | number | Identifiant unique |
| designation | string | Nom du produit |
| idTypeProduit | number | ID du type parent |

### Statistiques

#### GET /statistics/
**Description**: Statistiques globales du système

**Réponse**: Objet Statistiques
| Champ | Type | Description |
|-------|------|--------------|
| statistics | object | Objet contenant les statistiques |
| statistics.documents | number | Nombre total de documents |
| statistics["Documents valides"] | number | Nombre de documents validés |
| statistics["Documents non valides"] | number | Nombre de documents non validés |

## Bonnes Pratiques et Conventions

### Structure du Code
- **Composition API**: Utilisation systématique
- **TypeScript**: Typage strict des interfaces
- **Composants SFC**: Single File Components
- **Réactivité**: Refs et computed properties

### Gestion d'État
```typescript
// Store utilisateur avec Composition API
export const useUserStore = () => {
  const currentUser = ref<UserProfile | null>(null)
  
  const fetchUserProfile = async () => {
    // Logique de récupération
  }
  
  return {
    user: computed(() => currentUser.value),
    fetchUserProfile,
    // Permissions calculées
    canManageUsers,
    canAddDocuments
  }
}
```

### Gestion des Erreurs
- Try-catch systématique pour les appels API
- Messages d'erreur utilisateur-friendly
- Logging des erreurs pour le debugging

### Performance
- Lazy loading des composants
- Pagination des listes longues
- Mise en cache des données fréquemment utilisées
- Optimisation des images et assets

## Maintenance et Évolution

### Tests
- Tests unitaires recommandés pour les composants critiques
- Tests d'intégration pour les workflows complets
- Tests E2E pour les parcours utilisateur

### Monitoring
- Logs d'activité utilisateur
- Métriques de performance
- Surveillance des erreurs

### Évolutions Futures
- Notifications en temps réel
- Workflow d'approbation avancé
- Intégration avec systèmes externes
- API mobile
- Recherche full-text avancée

## Support et Documentation

### Ressources
- **Vue 3 Documentation**: https://vuejs.org/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Guide**: https://vitejs.dev/guide/

### Contact
Pour toute question technique ou fonctionnelle, contacter l'équipe de développement.

---

*Documentation générée le $(date) - Version 2.0*