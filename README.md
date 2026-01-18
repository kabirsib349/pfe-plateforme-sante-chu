# MedDataCollect - Plateforme de Collecte de Données de Santé

[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-white.svg)](https://sonarcloud.io/summary/new_code?id=kabirsib349_pfe-plateforme-sante-chu)

## Description du Projet
Ce projet de fin d'étude (PFE) a pour objectif de développer une plateforme web sécurisée, intuitive et conforme au RGPD. Elle permet aux chercheurs et aux médecins hospitaliers de collaborer efficacement pour la création de formulaires d'étude, la collecte de données médicales auprès des patients et l'exportation standardisée de ces données pour la recherche.

La plateforme vise à remplacer les processus manuels ou non sécurisés par une solution centralisée assurant l'intégrité et la confidentialité des données de santé.

## Objectifs Principaux
*   **Simplicité & Rapidité** : Interface intuitive permettant de créer des formulaires complexes sans compétences techniques.
*   **Sécurité des Données** : Chiffrement des communications, authentification à deux facteurs (MFA/OTP), gestion stricte des accès (JWT, Rôles).
*   **Conformité RGPD** : Gestion de l'anonymisation et du consentement.
*   **Interopérabilité** : Export des données structurées (CSV) pour l'analyse statistique externe.

## Fonctionnalités Clés

### Pour les Chercheurs
*   **Création de formulaires avancés** :
    *   Types de champs : Texte, Nombre, Date, Choix unique, Choix multiple, Champs calculés
    *   **Validation des champs numériques** : Définition de valeurs min/max (supporte les valeurs négatives pour température, acuité visuelle, etc.)
    *   **Contraintes de dates** : Définition de plages de dates acceptables (dateMin/dateMax)
    *   Validation automatique des noms de variables (unicité, format)
    *   Gestion de thèmes médicaux prédéfinis et questions personnalisées
*   Envoi de formulaires aux médecins collaborateurs.
*   Tableau de bord de suivi de la collecte (taux de réponse, progression).
*   **Messagerie intégrée** : Communication directe avec les médecins collaborateurs.
*   Exportation des données collectées (format CSV sécurisé).

### Pour les Médecins
*   Réception des formulaires à remplir pour leurs patients.
*   Interface de saisie ergonomique adaptée à la pratique clinique.
*   **Messagerie intégrée** : Communication directe avec les chercheurs.
*   Historique des soumissions et suivi des patients inclus.

### Sécurité & Authentification
*   **Authentification MFA (OTP par email)** : Vérification en deux étapes lors de la connexion.
*   **Réinitialisation de mot de passe** : Processus sécurisé par code OTP envoyé par email.
*   **Politique de mot de passe fort** : Minimum 12 caractères, majuscule, minuscule, chiffre, caractère spécial.

## Stack Technologique

### Backend
*   **Langage** : Java 17+
*   **Framework** : Spring Boot 3.5.3 (Compatible Java 17+)
*   **Sécurité** : Spring Security, JWT (JSON Web Tokens)
*   **Base de Données** : PostgreSQL
*   **ORM** : Spring Data JPA, Hibernate
*   **Outils** : Maven, Lombok

### Frontend
*   **Framework** : Next.js 15.5 (React 19)
*   **Langage** : TypeScript 5
*   **Styles** : Tailwind CSS 4
*   **Animations** : Framer Motion
*   **Composants** : Heroicons

## Prérequis
Avant de lancer le projet, assurez-vous de disposer des outils suivants :
1.  **Java JDK 17** ou supérieur.
2.  **Node.js** (version LTS recommandée, ex: v18+).
3.  **Maven** (ou utiliser le wrapper `mvnw` inclus).
4.  **PostgreSQL** (ou une base de données compatible configurée).

## Guide d'Installation et de Démarrage

### 1. Configuration du Backend

Le backend est situé dans le répertoire `backend`.

1.  Accédez au dossier :
    ```bash
    cd backend
    ```

2.  Configurez les variables d'environnement :
    *   Créez un fichier `.env` dans le dossier `backend` (ou à la racine du projet).
    *   Ajoutez les variables requises (voir le fichier `.env.example`) :
    ```properties
    # Configuration Base de Données
    DB_URL=jdbc:postgresql://localhost:5432/nom_de_votre_base
    DB_USERNAME=votre_utilisateur
    DB_PASSWORD=votre_mot_de_passe

    # Sécurité JWT (Obligatoire)
    JWT_SECRET_KEY=votre_clé_secrète_très_longue_et_sécurisée_pour_chiffrement
    ENCRYPTION_KEY=votre_clé_chiffrement_données
    
    # CORS
    CORS_ALLOWED_ORIGINS=http://localhost:3000
    
    # Configuration SMTP (Obligatoire pour MFA et réinitialisation mot de passe)
    # Exemple avec Brevo (ex-Sendinblue)
    MAIL_HOST=smtp-relay.brevo.com
    MAIL_PORT=587
    MAIL_USERNAME=votre_email@domaine.com
    MAIL_PASSWORD=votre_clé_smtp_brevo
    MAIL_FROM=noreply@votre-domaine.com
    ```
    *Note : L'application charge automatiquement ce fichier `.env` au démarrage.*
    
    > **Important** : Sans configuration SMTP, l'authentification MFA et la réinitialisation de mot de passe ne fonctionneront pas.

3.  Compilez et lancez l'application :
    ```bash
    ./mvnw spring-boot:run
    ```
    L'API Backend sera accessible sur `http://localhost:8080`.

### 2. Configuration du Frontend

Le frontend est situé dans le répertoire `frontend`.

1.  Accédez au dossier :
    ```bash
    cd frontend
    ```

2.  Installez les dépendances :
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```
    L'application Web sera accessible sur `http://localhost:3000`.

## Architecture du Projet
Le projet suit une architecture classique en couches :

*   **backend/** : Contient l'API RESTful.
    *   `controller` : Points d'entrée de l'API.
    *   `service` : Logique métier.
    *   `repository` : Accès aux données.
    *   `model` : Entités JPA.
    *   `dto` : Objets de transfert de données.
    *   `config` : Configuration de sécurité et globale.

*   **frontend/** : Contient l'interface utilisateur.
    *   `src/app` : Pages et routage (Next.js App Router).
    *   `src/components` : Composants React atomiques et réutilisables.
    *   `src/hooks` : Logique métier (Custom Hooks).
    *   `src/types` : Définitions de types TypeScript modulaires.
    *   `src/lib` : Utilitaires et appels API.

## Membres de l'Équipe
*   **Scrum Master** : KWEGUENG Mandela
*   **Product Owner** : Hélène PETNKEU
*   **Quality Manager** : KABIR SALEH Ibrahim
*   **Test Manager** : YIMGA Samuelle


