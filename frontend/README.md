# Plateforme Santé CHU - Frontend

Application web de gestion de formulaires médicaux et de communication sécurisée entre Médecins et Chercheurs.

##  Technologies

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **Icônes** : Heroicons

##  Fonctionnalités Clés

### 1. Gestion de Formulaires (`/formulaire`)
- **Création Dynamique** : Constructeur de formulaire avec Drag & Drop.
- **Questions Personnalisables** : Types multiples (Texte, Nombre, Date, Choix Unique/Multiple, Calculé).
- **Thèmes Médicaux** : Ajout rapide de groupes de questions (Cardiologie, Neurologie...).
- **Architecture** : Logique centralisée dans le hook `useFormulaireBuilder`.

### 2. Dashboard (`/dashboard-medecin` & `/dashboard-chercheur`)
- Vue d'ensemble des activités.
- Suivi des formulaires (Reçus, Envoyés, Brouillons).
- Statistiques clés.

### 3. Messagerie Sécurisée
- Communication temps réel entre les utilisateurs.
- Architecture modulaire : `useMessages` (Logique) + Composants Atomiques (`ContactList`, `ChatWindow`).

##  Architecture du Code

Le projet suit une architecture modulaire pour faciliter la maintenance :

- **`src/types/`** : Définitions TypeScript segmentées (`user.ts`, `formulaire.ts`, `api.ts`, `stats.ts`).
- **`src/hooks/`** : Logique métier extraite des composants (ex: `useFormulaireBuilder.ts`).
- **`src/components/`** :
    - **`form-builder/`** : Composants atomiques du constructeur de formulaire (`FormHeader`, `QuestionList`).
    - **`messaging/`** : Composants atomiques de la messagerie.
    - **`ui/`** : Composants génériques (Modales, Boutons).

##  Installation & Démarrage

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Lancement en mode développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

3. **Build de production**
   ```bash
   npm run build
   npm start
   ```

##  Bonnes Pratiques

- **Typage Strict** : Utiliser les interfaces définies dans `src/types`.
- **Atomicité** : Privilégier les petits composants réutilisables.
- **Commentaires** : Documenter les fonctions complexes (JSDoc).
- **Git** : Commits atomiques avec messages conventionnels (feat, fix, refactor).
