# 🧪 Test du Scénario Chercheur - Création de Formulaires

## 📋 Checklist de Test

### **1. Navigation depuis le Dashboard**
- [ ] Aller sur `http://localhost:3000/dashboard-chercheur`
- [ ] Cliquer sur l'onglet "Gestion des Formulaires"
- [ ] Vérifier l'indicateur "📊 2 formulaires actifs" en haut à droite
- [ ] Vérifier la section "⚡ Actions rapides" avec 2 cartes :
  - [ ] "Interface complète" (bleu) → `/formulaire`
  - [ ] "Créer un formulaire" (vert) → `/formulaire/nouveau`
- [ ] Tester les interactions hover sur les cartes

### **2. Page de Gestion des Formulaires**
- [ ] Naviguer vers `/formulaire`
- [ ] Vérifier le header avec titre "Mes Formulaires" et stats
- [ ] Tester la barre de recherche
- [ ] Tester les filtres (étude, statut)
- [ ] Vérifier l'affichage des cartes de formulaires
- [ ] Tester le bouton "Nouveau formulaire" (animation hover)
- [ ] Cliquer sur "Aperçu" d'un formulaire existant

### **3. Page de Création de Formulaire**
- [ ] Naviguer vers `/formulaire/nouveau`
- [ ] Vérifier le breadcrumb : Dashboard › Formulaires › Nouveau
- [ ] Vérifier le header avec boutons : Annuler, Brouillon, Publier
- [ ] Tester le formulaire d'informations générales :
  - [ ] Nom du formulaire (obligatoire)
  - [ ] Type d'étude (dropdown)
  - [ ] Créé par (obligatoire)
  - [ ] Description (optionnel)
- [ ] Tester l'ajout de questions :
  - [ ] Cliquer "Ajouter une question"
  - [ ] Sélectionner différents types (texte, nombre, date, choix)
  - [ ] Remplir les champs question et nom de variable
  - [ ] Supprimer une question
- [ ] Tester la sauvegarde :
  - [ ] Essayer de sauver sans nom → erreur
  - [ ] Essayer de sauver sans créateur → erreur
  - [ ] Sauver en brouillon → succès + redirection
  - [ ] Sauver et publier → succès + redirection

### **4. Page d'Aperçu**
- [ ] Naviguer vers `/formulaire/apercu?id=1`
- [ ] Vérifier le breadcrumb : Dashboard › Formulaires › Aperçu
- [ ] Vérifier les informations du formulaire
- [ ] Vérifier l'affichage des questions avec icônes
- [ ] Vérifier la simulation des champs de saisie
- [ ] Tester le bouton "Retour"

### **5. Navigation et UX**
- [ ] Tester tous les boutons "Retour"
- [ ] Vérifier la cohérence des couleurs
- [ ] Tester sur mobile (responsive)
- [ ] Vérifier les états de chargement
- [ ] Tester les transitions et animations

## 🎯 **Critères de Réussite**

### **Design ✅**
- Cohérence visuelle entre toutes les pages
- Palette de couleurs respectée
- Iconographie uniforme
- Interface responsive

### **Navigation ✅**
- Flux logique et intuitif
- Breadcrumbs fonctionnels
- Boutons de retour cohérents
- Redirections appropriées

### **Fonctionnalité ✅**
- Validation des formulaires
- Sauvegarde des données
- États de chargement
- Messages d'erreur clairs

### **Accessibilité ✅**
- Boutons avec titres explicites
- Contrastes suffisants
- Navigation au clavier possible
- Labels de formulaires appropriés

## 🚀 **Scénario Complet de Test**

1. **Démarrer** : `npm run dev` dans le dossier frontend
2. **Naviguer** : `http://localhost:3000/dashboard-chercheur`
3. **Créer** : Suivre le flux complet de création d'un formulaire
4. **Vérifier** : Retourner à la liste et voir le nouveau formulaire
5. **Aperçu** : Tester la prévisualisation

## 📊 **Résultat Attendu**

Un chercheur doit pouvoir :
- Accéder facilement à la gestion des formulaires depuis son dashboard
- Créer un nouveau formulaire de manière intuitive
- Prévisualiser ses formulaires
- Naviguer fluidement entre les pages
- Comprendre immédiatement où il se trouve et comment revenir en arrière