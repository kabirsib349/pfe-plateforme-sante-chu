# Routes des Formulaires

## Nouvelles routes ajoutées

### `/formulaire`
- **Description** : Page principale de gestion des formulaires
- **Fonctionnalités** :
  - Liste de tous les formulaires créés
  - Filtrage par étude et statut
  - Recherche par nom
  - Actions : Aperçu, Modification, Suppression
  - Bouton de création de nouveau formulaire

### `/formulaire/nouveau`
- **Description** : Page de création d'un nouveau formulaire
- **Fonctionnalités** :
  - Informations générales du formulaire
  - Ajout de questions de différents types
  - Thèmes médicaux prédéfinis
  - Mode aperçu
  - Sauvegarde en brouillon ou publication

### `/formulaire/apercu?id={id}`
- **Description** : Page d'aperçu d'un formulaire existant
- **Fonctionnalités** :
  - Affichage des informations du formulaire
  - Prévisualisation de toutes les questions
  - Simulation des champs de saisie

## Intégration avec le Dashboard Chercheur

L'onglet "Gestion des Formulaires" dans le dashboard du chercheur a été mis à jour avec :
- Bouton "Gérer les formulaires" → redirige vers `/formulaire`
- Bouton "Créer un formulaire" → redirige vers `/formulaire/nouveau`
- Section informative sur la gestion avancée des formulaires

## Types de questions supportés

1. **Texte court** - Pour noms, prénoms, etc.
2. **Texte long** - Pour observations, notes
3. **Nombre** - Avec unité (âge, poids, tension)
4. **Date** - Pour dates de naissance, consultations
5. **Choix unique** - Radio buttons (sexe, groupe sanguin)
6. **Choix multiples** - Checkboxes (symptômes, allergies)
7. **Échelle** - Slider (douleur 1-10)
8. **Champ calculé** - Formules automatiques (IMC)

## Validation des données

- Noms de variables en MAJUSCULES (max 25 caractères)
- Codes modalités respectant les standards médicaux (OUI=1, NON=0)
- Validation des formules de calcul
- Vérification de l'unicité des variables

## Conformité

- ✅ Conforme RGPD
- ✅ Export CSV automatique
- ✅ Validation des données médicales
- ✅ Interface responsive