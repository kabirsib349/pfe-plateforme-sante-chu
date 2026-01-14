# MedDataCollect - Plateforme de Collecte de Données de Santé

[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-white.svg)](https://sonarcloud.io/summary/new_code?id=kabirsib349_pfe-plateforme-sante-chu)

## Description du Projet
Ce projet de fin d'étude (PFE) a pour objectif de développer une plateforme web sécurisée, intuitive et conforme au RGPD. Elle permet aux chercheurs et aux médecins hospitaliers de collaborer efficacement pour la création de formulaires d'étude, la collecte de données médicales auprès des patients et l'exportation standardisée de ces données pour la recherche.

La plateforme vise à remplacer les processus manuels ou non sécurisés par une solution centralisée assurant l'intégrité et la confidentialité des données de santé.

## Objectifs Principaux
*   **Simplicité & Rapidité** : Interface intuitive permettant de créer des formulaires complexes sans compétences techniques.
*   **Sécurité des Données** : Chiffrement des communications et gestion stricte des accès (Authentification JWT, Rôles).
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
*   Exportation des données collectées (format CSV sécurisé).

### Pour les Médecins
*   Réception des formulaires à remplir pour leurs patients.
*   Interface de saisie ergonomique adaptée à la pratique clinique.
*   Historique des soumissions et suivi des patients inclus.

## Stack Technologique

### Backend
*   **Langage** : Java 17+
*   **Framework** : Spring Boot 3
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

2.  Configurez la base de données :
    *   Ouvrez le fichier `src/main/resources/application.properties`.
    *   Modifiez les paramètres de connexion (URL, username, password) pour correspondre à votre instance PostgreSQL locale.
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/votre_base
    spring.datasource.username=votre_utilisateur
    spring.datasource.password=votre_mot_de_passe
    ```

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


