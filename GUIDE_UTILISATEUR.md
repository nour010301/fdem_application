# Guide d'Utilisation - Application de Gestion Documentaire FDEM

## Table des Matières

1. [Introduction](#introduction)
2. [Connexion à l'Application](#connexion)
3. [Interface Principale](#interface-principale)
4. [Modals et Fenêtres de Dialogue](#modals)
5. [Gestion des Documents](#gestion-des-documents)
6. [Gestion des Entités](#gestion-des-entités)
7. [Gestion des Projets et Produits](#gestion-des-projets-et-produits)
8. [Configuration et Paramètres](#configuration-et-paramètres)
9. [Statistiques et Rapports](#statistiques-et-rapports)
10. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
11. [Profil Utilisateur](#profil-utilisateur)
12. [Types de Suppression et Leurs Conséquences](#types-suppression)
13. [Gestion des PAQs](#paqs)
14. [Dépannage](#dépannage)

---

## 1. Introduction {#introduction}

Cette application de gestion documentaire FDEM (Fond Documentaire d'Entreprise Moderne) est une solution complète pour organiser, gérer et consulter tous vos documents d'entreprise. Elle permet de gérer les projets, produits, intervenants et leur documentation associée.

### Fonctionnalités Principales
- Gestion centralisée des documents
- Organisation hiérarchique des projets et produits
- Gestion des intervenants (maîtres d'œuvre, maîtres d'ouvrage, fournisseurs, etc.)
- Système de permissions et d'authentification
- Statistiques et rapports détaillés
- Interface intuitive et responsive

---

## 2. Connexion à l'Application {#connexion}

### 2.1 Page de Connexion

Pour accéder à l'application, vous devez vous connecter avec vos identifiants.

**[INSÉRER CAPTURE D'ÉCRAN : Page de connexion avec champs email/mot de passe]**

#### Étapes de connexion :
1. Ouvrez votre navigateur web
2. Accédez à l'URL de l'application
3. Saisissez votre **adresse email** dans le premier champ
4. Saisissez votre **mot de passe** dans le second champ
5. Cliquez sur le bouton **"Se connecter"**

### 2.2 Gestion des Erreurs de Connexion

En cas d'erreur de connexion :
- Vérifiez vos identifiants
- Assurez-vous que votre compte est actif
- Contactez l'administrateur si le problème persiste

**[INSÉRER CAPTURE D'ÉCRAN : Message d'erreur de connexion]**

---

## 3. Interface Principale {#interface-principale}

### 3.1 Vue d'Ensemble du Tableau de Bord

Après connexion, vous arrivez sur le tableau de bord principal qui présente une vue d'ensemble de l'application.

**[INSÉRER CAPTURE D'ÉCRAN : Tableau de bord principal avec menu de navigation]**

### 3.2 Menu de Navigation

Le menu de navigation situé à gauche contient les sections principales :

#### Gestion Documentaire
- **Accueil** : Tableau de bord principal
- **Documents** : Consultation des documents
- **Ajouter Document** : Ajout de nouveaux documents

#### Gestion des Entités
- **Bureau d'Étude** : Gestion des BET
- **Fournisseurs** : Gestion des fournisseurs
- **Directeurs** : Gestion des directeurs de projet
- **Maîtres d'Œuvre (BCS)** : Gestion des maîtres d'œuvre
- **Maîtres d'Ouvrage** : Gestion des maîtres d'ouvrage
- **Sous-traitants** : Gestion des sous-traitants

#### Configuration
- **Projets/Produits** : Gestion des projets et produits
- **Produits** : Catalogue des produits
- **Types de Produits** : Classification des produits
- **Sections** : Organisation par sections
- **Structures** : Structure du fond documentaire
- **Classes de Documents** : Classification niveau 1
- **Types de Documents** : Classification niveau 2
- **Documents Cibles** : Classification niveau 3

#### Administration
- **Utilisateurs** : Gestion des comptes utilisateurs
- **Paramètres** : Configuration générale
- **Statistiques** : Rapports et analyses
- **PAQs** : Plans d'Assurance Qualité

**[INSÉRER CAPTURE D'ÉCRAN : Menu de navigation détaillé]**

### 3.3 Barre Supérieure

La barre supérieure contient :
- Logo de l'application
- Nom de l'utilisateur connecté
- Menu de profil
- Bouton de déconnexion

**[INSÉRER CAPTURE D'ÉCRAN : Barre supérieure avec menu utilisateur]**

---

## 4. Modals et Fenêtres de Dialogue {#modals}

L'application utilise de nombreux modals (fenêtres de dialogue) pour différentes actions. Voici le détail de chaque modal :

### 4.1 Modal de Suppression de Document

**[INSÉRER CAPTURE D'ÉCRAN : Modal de confirmation de suppression de document]**

Ce modal apparaît lorsque vous cliquez sur le bouton de suppression d'un document :
- **Titre** : "Supprimer"
- **Message** : "Confirmez-vous la suppression du document ID [numéro] ?"
- **Actions disponibles** :
  - **"Oui, supprimer"** : Supprime définitivement le document du système
  - **"Annuler"** : Ferme le modal sans supprimer

⚠️ **Important** : Cette action supprime complètement le document, pas seulement le fichier.

### 4.2 Modal de Modification de Document

**[INSÉRER CAPTURE D'ÉCRAN : Modal de modification de document avec tous les champs]**

Ce modal permet de modifier un document existant :

#### Sections du modal :
1. **Fichier actuel** : Affiche le nom du fichier existant
2. **Désignation** : Champ pour modifier la description du document
3. **Remplacer par un fichier unique** : 
   - Upload d'un nouveau fichier
   - Bouton "Retirer" pour annuler la sélection
4. **Sélectionner plusieurs images** : 
   - Pour créer un PDF à partir d'images
   - Prévisualisation des images sélectionnées
   - Bouton "×" pour retirer chaque image

#### Actions disponibles :
- **"Annuler"** : Ferme sans sauvegarder
- **"Modifier"** : Applique les modifications

### 4.3 Modal de Validation de Document

**[INSÉRER CAPTURE D'ÉCRAN : Modal de validation avec informations du document]**

Ce modal apparaît pour valider un document :

#### Informations affichées :
- ID du document
- Description
- Type de produit
- Produit
- Structure

#### Actions :
- **"Annuler"** : Ferme sans valider
- **"Valider"** : Valide définitivement le document

### 4.4 Modal de Déplacement de Document

**[INSÉRER CAPTURE D'ÉCRAN : Modal de déplacement avec sélecteurs en cascade]**

Ce modal permet de déplacer un document vers une nouvelle classification :

#### Champs de sélection (en cascade) :
1. **Type Produit**
2. **Produit** 
3. **Structure**
4. **Section**
5. **Subdivision Niveau 1**
6. **Subdivision Niveau 2**
7. **Subdivision Niveau 3**
8. **Subdivision Niveau 4**

#### Actions :
- **"Annuler"** : Ferme sans déplacer
- **"Déplacer"** : Applique le déplacement

### 4.5 Modal de Suppression d'Utilisateur

**[INSÉRER CAPTURE D'ÉCRAN : Modal de confirmation de suppression d'utilisateur]**

Ce modal confirme la suppression d'un compte utilisateur :
- **Message** : "Êtes-vous sûr de vouloir supprimer l'utilisateur [nom] ?"
- **Actions** :
  - **"Confirmer"** : Supprime définitivement le compte
  - **"Annuler"** : Annule la suppression

⚠️ **Important** : Cette action supprime complètement le compte utilisateur.

### 4.6 Modal d'Activation/Désactivation d'Utilisateur

**[INSÉRER CAPTURE D'ÉCRAN : Modal d'activation/désactivation avec informations utilisateur]**

Ce modal permet d'activer ou désactiver un compte utilisateur :

#### Informations affichées :
- Nom d'utilisateur
- Nom et prénom
- Email
- Profil
- Statut actuel (Actif/Inactif)

#### Actions :
- **"Activer"** : Active le compte (bouton bleu)
- **"Désactiver"** : Désactive le compte (bouton rouge)
- **"Annuler"** : Ferme sans modifier

### 4.7 Modal de Création/Modification de Compte Utilisateur

**[INSÉRER CAPTURE D'ÉCRAN : Modal de création de compte avec stepper]**

Ce modal complexe utilise un système d'étapes (stepper) :

#### Étapes pour les administrateurs :
1. **Informations utilisateur**
2. **Types de produit** 
3. **Produits**
4. **Permissions**

#### Étapes pour les utilisateurs restreints (en modification) :
1. **Types de produit**
2. **Produits** 
3. **Permissions**

**[INSÉRER CAPTURE D'ÉCRAN : Étape 1 - Informations utilisateur]**

##### Étape 1 : Informations utilisateur
- Nom et prénom (requis)
- Nom d'utilisateur (généré automatiquement)
- Mot de passe (requis)
- Profil (requis)
- Email (généré automatiquement avec @cosidertp.dz)
- Téléphone
- Département

**[INSÉRER CAPTURE D'ÉCRAN : Étape 2 - Sélection des types de produit avec boutons "Cocher tout"]**

##### Étape 2 : Types de produit
- Liste de cases à cocher pour tous les types
- Boutons "Cocher tout" / "Décocher tout"
- Affichage en grille

**[INSÉRER CAPTURE D'ÉCRAN : Étape 3 - Sélection des produits par type]**

##### Étape 3 : Produits
- Organisés par type de produit sélectionné
- Boutons "Cocher tout" / "Décocher tout" par type
- Affichage hiérarchique

**[INSÉRER CAPTURE D'ÉCRAN : Étape 4 - Permissions avec cases à cocher]**

##### Étape 4 : Permissions
- Impression des documents
- Téléchargement des documents
- Téléchargement des plans (AutoCAD, ZIP)
- Suppression des documents
- Validation des documents

#### Navigation :
- **"Précédent"** : Retour à l'étape précédente
- **"Suivant"** : Étape suivante
- **"Créer le compte"** : Finalise la création (étape 1)
- **"Confirmer"** : Finalise la modification (dernière étape)
- **"Annuler"** : Ferme sans sauvegarder

### 4.8 Modal de Suppression de Profil

**[INSÉRER CAPTURE D'ÉCRAN : Modal de suppression de profil avec sélecteur]**

Ce modal permet de supprimer un profil utilisateur :
- **Sélecteur** : Liste déroulante des profils disponibles
- **Actions** :
  - **"Confirmer"** : Supprime le profil sélectionné
  - **"Annuler"** : Ferme sans supprimer

### 4.9 Modal de Suppression d'Entité du Contexte

**[INSÉRER CAPTURE D'ÉCRAN : Modal de suppression d'entité avec tableau de confirmation]**

Ce modal apparaît lors de la suppression d'entités du contexte d'un projet :
- **Tableau** : Affiche les détails de l'entité à supprimer
- **Message** : Confirmation de suppression
- **Actions** :
  - **"Oui, supprimer"** : Retire l'entité du contexte
  - **"Annuler"** : Annule la suppression

⚠️ **Important** : Cette action retire l'entité du contexte du projet, mais ne supprime pas l'entité elle-même.

### 4.10 Modal d'Ajout de Directeur de Projet avec Dates

**[INSÉRER CAPTURE D'ÉCRAN : Modal d'ajout de directeur avec champs de dates]**

Ce modal spécifique permet d'ajouter un directeur de projet avec des dates :
- **Directeur** : Sélectionné au préalable
- **Date de début** : Champ date
- **Date de fin** : Champ date
- **Actions** :
  - **"Ajouter"** : Ajoute le directeur avec les dates
  - **"Annuler"** : Ferme sans ajouter

### 4.11 Modal de Visualisation de Documents

**[INSÉRER CAPTURE D'ÉCRAN : Modal de visualisation avec document PDF]**

Ce modal affiche les documents dans un visualiseur intégré :

#### Types de visualiseurs :
1. **PDF** : Avec contrôles de navigation, zoom, rotation
2. **Images** : Avec zoom, rotation, mode plein écran
3. **Vidéos** : Avec lecteur vidéo intégré

#### Actions communes :
- **"Fermer"** : Ferme le visualiseur
- Boutons de téléchargement et impression (selon permissions)

## 5. Gestion des Documents {#gestion-des-documents}

### 5.1 Consultation des Documents

La page "Documents" permet de consulter tous les documents du système.

**[INSÉRER CAPTURE D'ÉCRAN : Page de consultation des documents avec liste et filtres]**

#### Fonctionnalités disponibles :
- **Recherche** : Barre de recherche pour trouver des documents
- **Filtres** : Filtrage par type, date, projet, etc.
- **Tri** : Tri par nom, date, taille, etc.
- **Pagination** : Navigation entre les pages de résultats
- **Prévisualisation** : Aperçu rapide des documents

#### Actions sur les documents :
- **Visualiser** : Ouvrir le document dans le visualiseur intégré
- **Télécharger** : Télécharger le document sur votre ordinateur
- **Modifier** : Éditer les métadonnées du document
- **Supprimer** : Supprimer le document (selon permissions)

### 4.2 Ajout de Documents

Pour ajouter un nouveau document, accédez à la page "Ajouter Document".

**[INSÉRER CAPTURE D'ÉCRAN : Page d'ajout de document avec formulaire]**

#### Étapes d'ajout :

1. **Sélection du Produit**
   - Choisissez le produit associé au document
   **[INSÉRER CAPTURE D'ÉCRAN : Sélection du produit]**

2. **Sélection du Projet**
   - Sélectionnez le projet concerné
   **[INSÉRER CAPTURE D'ÉCRAN : Sélection du projet]**

3. **Définition du Contexte**
   - Ajoutez les entités liées au document :
     - Maîtres d'ouvrage
     - Maîtres d'œuvre
     - Fournisseurs
     - Sous-traitants
     - Bureaux d'études
     - Directeurs de projet
   **[INSÉRER CAPTURE D'ÉCRAN : Interface de sélection du contexte]**

4. **Classification du Document**
   - Structure : Sélectionnez la structure documentaire
   - Classe : Choisissez la classe de document
   - Type : Définissez le type de document
   - Document cible : Précisez le document cible
   **[INSÉRER CAPTURE D'ÉCRAN : Interface de classification]**

5. **Upload du Fichier**
   - Glissez-déposez votre fichier ou cliquez pour le sélectionner
   - Formats supportés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, images, etc.
   **[INSÉRER CAPTURE D'ÉCRAN : Zone d'upload de fichier]**

6. **Métadonnées**
   - Titre du document
   - Description
   - Mots-clés
   - Date de création
   - Version
   **[INSÉRER CAPTURE D'ÉCRAN : Formulaire de métadonnées]**

7. **Validation**
   - Vérifiez toutes les informations
   - Cliquez sur "Enregistrer" pour finaliser l'ajout
   **[INSÉRER CAPTURE D'ÉCRAN : Bouton de validation]**

### 4.3 Visualisation des Documents

L'application dispose d'un visualiseur intégré pour différents types de fichiers.

#### Visualiseur PDF
**[INSÉRER CAPTURE D'ÉCRAN : Visualiseur PDF avec contrôles de navigation]**

Fonctionnalités :
- Navigation entre les pages
- Zoom avant/arrière
- Rotation des pages
- Mode plein écran
- Téléchargement

#### Visualiseur d'Images
**[INSÉRER CAPTURE D'ÉCRAN : Visualiseur d'images avec outils]**

Fonctionnalités :
- Zoom et panoramique
- Rotation
- Mode plein écran
- Navigation entre images multiples

#### Visualiseur Vidéo
**[INSÉRER CAPTURE D'ÉCRAN : Lecteur vidéo intégré]**

Fonctionnalités :
- Lecture/pause
- Contrôle du volume
- Barre de progression
- Mode plein écran

---

## 5. Gestion des Entités {#gestion-des-entités}

### 5.1 Gestion des Maîtres d'Ouvrage

La page "Maîtres d'Ouvrage" permet de gérer tous les maîtres d'ouvrage.

**[INSÉRER CAPTURE D'ÉCRAN : Liste des maîtres d'ouvrage]**

#### Actions disponibles :
- **Ajouter** : Créer un nouveau maître d'ouvrage
- **Modifier** : Éditer les informations existantes
- **Supprimer** : Supprimer un maître d'ouvrage
- **Consulter** : Voir les détails et documents associés

#### Formulaire d'ajout/modification :
**[INSÉRER CAPTURE D'ÉCRAN : Formulaire maître d'ouvrage]**

Champs requis :
- Nom de l'entreprise
- Adresse
- Téléphone
- Email
- Contact principal
- Secteur d'activité

### 5.2 Gestion des Maîtres d'Œuvre (BCS)

**[INSÉRER CAPTURE D'ÉCRAN : Liste des maîtres d'œuvre]**

Fonctionnalités similaires aux maîtres d'ouvrage avec des champs spécifiques :
- Numéro d'agrément
- Spécialités techniques
- Certifications
- Zone d'intervention

### 5.3 Gestion des Fournisseurs

**[INSÉRER CAPTURE D'ÉCRAN : Interface de gestion des fournisseurs]**

Informations spécifiques aux fournisseurs :
- Catalogue de produits/services
- Conditions commerciales
- Délais de livraison
- Certifications qualité

### 5.4 Gestion des Sous-traitants

**[INSÉRER CAPTURE D'ÉCRAN : Liste des sous-traitants]**

Données particulières :
- Corps de métier
- Qualifications
- Assurances
- Références projets

### 5.5 Gestion des Bureaux d'Études

**[INSÉRER CAPTURE D'ÉCRAN : Interface BET]**

Informations techniques :
- Domaines d'expertise
- Logiciels utilisés
- Équipe technique
- Projets de référence

### 5.6 Gestion des Directeurs de Projet

**[INSÉRER CAPTURE D'ÉCRAN : Liste des directeurs]**

Données de gestion :
- Expérience
- Projets en cours
- Disponibilité
- Compétences managériales

---

## 6. Gestion des Projets et Produits {#gestion-des-projets-et-produits}

### 6.1 Vue Projets/Produits

Cette section centrale permet de gérer la relation entre projets et produits.

**[INSÉRER CAPTURE D'ÉCRAN : Interface projets/produits avec arborescence]**

#### Structure hiérarchique :
1. **Produit** (niveau supérieur)
2. **Projet** (associé à un produit)
3. **Documents** (liés au projet)

### 6.2 Création d'un Nouveau Produit

**[INSÉRER CAPTURE D'ÉCRAN : Formulaire de création de produit]**

Étapes de création :
1. Cliquez sur "Nouveau Produit"
2. Remplissez les informations :
   - Nom du produit
   - Description
   - Type de produit
   - Section
   - Responsable
   - Budget prévisionnel
   - Dates de début/fin
3. Validez la création

### 6.3 Création d'un Nouveau Projet

**[INSÉRER CAPTURE D'ÉCRAN : Formulaire de création de projet]**

Informations requises :
- Code projet (unique)
- Nom du projet
- Produit parent
- Description détaillée
- Objectifs
- Contraintes
- Planning prévisionnel

### 6.4 Association Projet-Entités

Pour chaque projet, vous pouvez associer différentes entités :

**[INSÉRER CAPTURE D'ÉCRAN : Interface d'association des entités au projet]**

#### Processus d'association :
1. Sélectionnez le projet
2. Cliquez sur "Gérer le contexte"
3. Ajoutez les entités concernées :
   - Maître d'ouvrage
   - Maître d'œuvre
   - Fournisseurs
   - Sous-traitants
   - Bureau d'études
   - Directeur de projet
4. Définissez les rôles et responsabilités
5. Validez les associations

---

## 7. Configuration et Paramètres {#configuration-et-paramètres}

### 7.1 Types de Produits

Définissez les différentes catégories de produits de votre organisation.

**[INSÉRER CAPTURE D'ÉCRAN : Gestion des types de produits]**

Actions disponibles :
- Créer un nouveau type
- Modifier un type existant
- Définir des sous-catégories
- Associer des modèles de documents

### 7.2 Sections de Produits

Organisez vos produits par sections métier.

**[INSÉRER CAPTURE D'ÉCRAN : Interface des sections]**

### 7.3 Structure du Fond Documentaire

Configurez l'organisation hiérarchique de vos documents.

**[INSÉRER CAPTURE D'ÉCRAN : Arborescence de la structure documentaire]**

#### Niveaux de classification :

1. **Structures** : Grandes familles documentaires
   **[INSÉRER CAPTURE D'ÉCRAN : Gestion des structures]**

2. **Classes de Documents (Niveau 1)** : Catégories principales
   **[INSÉRER CAPTURE D'ÉCRAN : Classes de documents]**

3. **Types de Documents (Niveau 2)** : Sous-catégories
   **[INSÉRER CAPTURE D'ÉCRAN : Types de documents]**

4. **Documents Cibles (Niveau 3)** : Documents spécifiques
   **[INSÉRER CAPTURE D'ÉCRAN : Documents cibles]**

### 7.4 Paramètres Généraux

Accédez aux paramètres globaux de l'application.

**[INSÉRER CAPTURE D'ÉCRAN : Page des paramètres généraux]**

Configuration disponible :
- Paramètres de sécurité
- Formats de fichiers autorisés
- Taille maximale des uploads
- Paramètres de notification
- Configuration des sauvegardes
- Paramètres d'affichage

---

## 8. Statistiques et Rapports {#statistiques-et-rapports}

### 8.1 Statistiques Hiérarchiques

Consultez les statistiques détaillées de votre fond documentaire.

**[INSÉRER CAPTURE D'ÉCRAN : Dashboard des statistiques avec graphiques]**

#### Types de statistiques :
- Nombre de documents par projet
- Répartition par type de document
- Évolution temporelle des ajouts
- Statistiques par entité
- Taux d'utilisation des documents

### 8.2 Rapports Personnalisés

Générez des rapports sur mesure selon vos besoins.

**[INSÉRER CAPTURE D'ÉCRAN : Interface de génération de rapports]**

#### Options de rapport :
- Période d'analyse
- Critères de filtrage
- Format d'export (PDF, Excel, CSV)
- Graphiques et tableaux
- Envoi automatique par email

### 8.3 Tableaux de Bord

Créez des tableaux de bord personnalisés pour un suivi en temps réel.

**[INSÉRER CAPTURE D'ÉCRAN : Tableau de bord personnalisé avec widgets]**

---

## 9. Gestion des Utilisateurs {#gestion-des-utilisateurs}

### 9.1 Liste des Utilisateurs

Gérez tous les comptes utilisateurs de l'application.

**[INSÉRER CAPTURE D'ÉCRAN : Liste des utilisateurs avec statuts]**

#### Informations affichées :
- Nom et prénom
- Email
- Rôle/Profil
- Statut (actif/inactif)
- Dernière connexion
- Actions disponibles

### 9.2 Création d'un Nouvel Utilisateur

**[INSÉRER CAPTURE D'ÉCRAN : Formulaire de création d'utilisateur]**

#### Étapes de création :
1. Cliquez sur "Nouvel Utilisateur"
2. Remplissez les informations personnelles :
   - Nom et prénom
   - Email (identifiant de connexion)
   - Téléphone
   - Fonction
3. Définissez les paramètres de compte :
   - Mot de passe temporaire
   - Profil/Rôle
   - Permissions spécifiques
   - Date d'expiration (optionnel)
4. Validez la création

### 9.3 Gestion des Rôles et Permissions

**[INSÉRER CAPTURE D'ÉCRAN : Interface de gestion des rôles]**

#### Rôles prédéfinis :
- **Administrateur** : Accès complet à toutes les fonctionnalités
- **Gestionnaire** : Gestion des documents et entités
- **Contributeur** : Ajout et modification de documents
- **Lecteur** : Consultation uniquement

#### Permissions détaillées :
- Lecture des documents
- Ajout de documents
- Modification des métadonnées
- Suppression de documents
- Gestion des entités
- Administration des utilisateurs
- Accès aux statistiques
- Configuration du système

### 9.4 Modification d'un Utilisateur

**[INSÉRER CAPTURE D'ÉCRAN : Formulaire de modification d'utilisateur]**

Actions possibles :
- Modifier les informations personnelles
- Changer le mot de passe
- Modifier les permissions
- Activer/désactiver le compte
- Réinitialiser l'authentification

---

## 10. Profil Utilisateur {#profil-utilisateur}

### 10.1 Consultation du Profil

Accédez à votre profil personnel via le menu utilisateur.

**[INSÉRER CAPTURE D'ÉCRAN : Page de profil utilisateur]**

#### Informations affichées :
- Photo de profil
- Informations personnelles
- Rôle et permissions
- Statistiques d'utilisation
- Historique des connexions

### 10.2 Modification du Profil

**[INSÉRER CAPTURE D'ÉCRAN : Formulaire de modification du profil]**

#### Modifications possibles :
- Photo de profil
- Informations de contact
- Préférences d'affichage
- Paramètres de notification
- Changement de mot de passe

### 10.3 Changement de Mot de Passe

**[INSÉRER CAPTURE D'ÉCRAN : Formulaire de changement de mot de passe]**

#### Procédure sécurisée :
1. Saisissez votre mot de passe actuel
2. Entrez le nouveau mot de passe
3. Confirmez le nouveau mot de passe
4. Validez le changement

#### Critères de sécurité :
- Minimum 8 caractères
- Combinaison de lettres, chiffres et symboles
- Différent des 3 derniers mots de passe

---

## 11. Types de Suppression et Leurs Conséquences {#types-suppression}

L'application propose différents types de suppression selon le contexte. Il est important de comprendre les différences :

### 11.1 Suppression Complète de Document

**[INSÉRER CAPTURE D'ÉCRAN : Bouton de suppression de document dans la liste]**

#### Accès :
- Via le bouton 🗑️ dans la colonne "Actions" de la liste des documents
- Disponible uniquement pour les utilisateurs avec permission "Suppression"

#### Conséquences :
- ❗ **Suppression définitive** du document de la base de données
- ❗ **Suppression de tous les fichiers** associés (PDF, images, vidéos, plans)
- ❗ **Perte de toutes les métadonnées** (description, classification, etc.)
- ❗ **Action irréversible**

#### Processus :
1. Clic sur le bouton de suppression
2. Modal de confirmation avec ID du document
3. Confirmation par "Oui, supprimer"
4. Suppression immédiate et définitive

### 11.2 Retrait d'Entité du Contexte

**[INSÉRER CAPTURE D'ÉCRAN : Bouton de suppression dans le contexte d'un projet]**

#### Accès :
- Via les boutons de suppression dans les sections de contexte
- Lors de l'ajout de documents (gestion du contexte)

#### Conséquences :
- ✅ **Retire l'entité** du contexte du projet/produit
- ✅ **Conserve l'entité** dans la base de données
- ✅ **Conserve tous les documents** de l'entité
- ✅ **Action réversible** (peut être rajoutée)

#### Processus :
1. Clic sur "Supprimer" dans la section contexte
2. Modal avec tableau des détails de l'entité
3. Confirmation par "Oui, supprimer"
4. Retrait du contexte uniquement

### 11.3 Remplacement de Fichier

**[INSÉRER CAPTURE D'ÉCRAN : Modal de modification avec option de remplacement de fichier]**

#### Accès :
- Via le bouton "Modifier" d'un document
- Section "Remplacer par un fichier unique"

#### Conséquences :
- ✅ **Conserve le document** et ses métadonnées
- ❗ **Remplace l'ancien fichier** par le nouveau
- ✅ **Conserve l'historique** du document
- ✅ **Action traçable** dans les logs

#### Options disponibles :
1. **Fichier unique** : Remplace par un seul fichier
2. **Multiples images** : Crée un PDF à partir d'images
3. **Bouton "Retirer"** : Annule la sélection de fichier

### 11.4 Suppression d'Utilisateur

**[INSÉRER CAPTURE D'ÉCRAN : Bouton de suppression d'utilisateur]**

#### Accès :
- Via le bouton 🗑️ dans la gestion des utilisateurs
- Réservé aux administrateurs

#### Conséquences :
- ❗ **Suppression définitive** du compte utilisateur
- ❗ **Perte de l'accès** à l'application
- ✅ **Conserve les documents** créés par l'utilisateur
- ❗ **Action irréversible**

#### Alternative recommandée :
- **Désactivation** plutôt que suppression
- Permet de réactiver le compte plus tard
- Conserve l'historique complet

### 11.5 Désactivation d'Utilisateur (Recommandée)

**[INSÉRER CAPTURE D'ÉCRAN : Boutons d'activation/désactivation]**

#### Accès :
- Bouton 👥⚠️ (désactiver) ou 👥✓ (activer)
- Disponible pour les administrateurs informatiques

#### Conséquences :
- ✅ **Bloque l'accès** temporairement
- ✅ **Conserve toutes les données** utilisateur
- ✅ **Action réversible** facilement
- ✅ **Traçabilité complète**

### 11.6 Suppression de Profil

**[INSÉRER CAPTURE D'ÉCRAN : Modal de suppression de profil]**

#### Accès :
- Bouton "Supprimer un profil" dans la gestion des utilisateurs
- Réservé aux super-administrateurs

#### Conséquences :
- ❗ **Suppression du profil** de la liste
- ⚠️ **Impact sur les utilisateurs** ayant ce profil
- ❗ **Peut affecter les permissions** existantes

### 11.7 Recommandations de Sécurité

#### Avant toute suppression :
1. **Vérifiez** l'impact sur les autres éléments
2. **Sauvegardez** si nécessaire
3. **Informez** les utilisateurs concernés
4. **Documentez** la raison de la suppression

#### Bonnes pratiques :
- **Privilégiez la désactivation** à la suppression
- **Utilisez le retrait du contexte** plutôt que la suppression complète
- **Testez** sur un environnement de test si possible
- **Vérifiez les permissions** avant d'autoriser la suppression

## 13. Gestion des PAQs {#paqs}

### 11.1 Plans d'Assurance Qualité

La section PAQ permet de gérer les Plans d'Assurance Qualité associés aux projets.

**[INSÉRER CAPTURE D'ÉCRAN : Interface de gestion des PAQs]**

#### Fonctionnalités PAQ :
- Création de nouveaux PAQs
- Association aux projets
- Suivi des versions
- Validation des étapes
- Génération de rapports qualité

### 11.2 Création d'un PAQ

**[INSÉRER CAPTURE D'ÉCRAN : Formulaire de création de PAQ]**

#### Éléments du PAQ :
- Référence du PAQ
- Projet associé
- Responsable qualité
- Objectifs qualité
- Procédures et contrôles
- Planning des audits
- Critères d'acceptation

---

## 14. Dépannage {#dépannage}

### 12.1 Problèmes de Connexion

#### Symptômes courants :
- Message "Identifiants incorrects"
- Page de connexion qui se recharge
- Erreur de serveur

#### Solutions :
1. Vérifiez vos identifiants
2. Videz le cache de votre navigateur
3. Essayez un autre navigateur
4. Contactez l'administrateur

**[INSÉRER CAPTURE D'ÉCRAN : Messages d'erreur courants]**

### 12.2 Problèmes d'Upload de Fichiers

#### Causes possibles :
- Fichier trop volumineux
- Format non supporté
- Connexion internet instable
- Espace de stockage insuffisant

#### Solutions :
1. Vérifiez la taille du fichier (limite : XX MB)
2. Convertissez le fichier dans un format supporté
3. Vérifiez votre connexion internet
4. Contactez l'administrateur pour l'espace de stockage

**[INSÉRER CAPTURE D'ÉCRAN : Messages d'erreur d'upload]**

### 12.3 Problèmes de Performance

#### Symptômes :
- Chargement lent des pages
- Timeout lors des opérations
- Interface qui ne répond pas

#### Solutions :
1. Fermez les onglets inutiles
2. Redémarrez votre navigateur
3. Vérifiez votre connexion internet
4. Contactez le support technique

### 12.4 Problèmes d'Affichage

#### Problèmes courants :
- Interface déformée
- Boutons non cliquables
- Texte illisible

#### Solutions :
1. Actualisez la page (F5)
2. Vérifiez le zoom de votre navigateur (100%)
3. Essayez un autre navigateur
4. Videz le cache et les cookies

**[INSÉRER CAPTURE D'ÉCRAN : Interface avec problèmes d'affichage]**

### 12.5 Contact Support

En cas de problème persistant :

#### Informations à fournir :
- Description détaillée du problème
- Étapes pour reproduire l'erreur
- Navigateur et version utilisés
- Captures d'écran si possible
- Messages d'erreur exacts

#### Coordonnées du support :
- **Email** : support@fdem.com
- **Téléphone** : +XX XX XX XX XX
- **Heures d'ouverture** : Lundi-Vendredi 8h-18h

**[INSÉRER CAPTURE D'ÉCRAN : Page de contact du support]**

---

## Annexes

### Annexe A : Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| Ctrl + S | Sauvegarder |
| Ctrl + F | Rechercher |
| Ctrl + N | Nouveau document |
| Ctrl + P | Imprimer |
| F5 | Actualiser |
| Échap | Fermer modal |

### Annexe B : Formats de Fichiers Supportés

#### Documents
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Microsoft Excel (.xls, .xlsx)
- Microsoft PowerPoint (.ppt, .pptx)
- Texte (.txt)
- RTF (.rtf)

#### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- TIFF (.tiff)

#### Vidéos
- MP4 (.mp4)
- AVI (.avi)
- MOV (.mov)
- WMV (.wmv)

#### Archives
- ZIP (.zip)
- RAR (.rar)
- 7Z (.7z)

### Annexe C : Limites du Système

- **Taille maximale par fichier** : 100 MB
- **Nombre de fichiers par upload** : 10
- **Espace de stockage par utilisateur** : 1 GB
- **Durée de session** : 8 heures
- **Nombre d'utilisateurs simultanés** : 100

---

**Version du guide** : 1.0  
**Date de création** : [DATE]  
**Dernière mise à jour** : [DATE]  
**Auteur** : [NOM]

---

*Ce guide est un document évolutif. N'hésitez pas à faire remonter vos suggestions d'amélioration au support technique.*