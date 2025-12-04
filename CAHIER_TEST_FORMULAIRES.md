# 📋 CAHIER DE TEST - FONCTIONNALITÉS FORMULAIRES

**Projet** : Plateforme Santé CHU  
**Module** : Gestion des Formulaires  
**Date** : 04/12/2025  
**Version** : 1.0  

---

## 📚 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Données de test](#données-de-test)
3. [Tests Chercheur](#tests-chercheur)
4. [Tests Médecin](#tests-médecin)
5. [Tests Affichage et Consultation](#tests-affichage-et-consultation)
6. [Tests d'Export](#tests-dexport)
7. [Tests de Sécurité](#tests-de-sécurité)
8. [Tests de Non-Régression](#tests-de-non-régression)

---

## 🔧 PRÉREQUIS

### Configuration requise
- ✅ Backend démarré sur `http://localhost:8080`
- ✅ Frontend démarré sur `http://localhost:3000`
- ✅ Base de données accessible et initialisée
- ✅ Au moins 1 compte chercheur
- ✅ Au moins 2 comptes médecins
- ✅ Au moins 1 étude créée

### Comptes de test recommandés
| Rôle | Email | Mot de passe | Nom |
|------|-------|--------------|-----|
| Chercheur | chercheur@test.com | Test123! | Dr. Dupont |
| Médecin 1 | medecin1@test.com | Test123! | Dr. Martin |
| Médecin 2 | medecin2@test.com | Test123! | Dr. Bernard |

---

## 📊 DONNÉES DE TEST

### Formulaires types à créer

#### Formulaire Test 1 : "Évaluation Cardiaque"
- **Étude** : Étude Cardiovasculaire
- **Description** : Formulaire d'évaluation cardiaque patient
- **Champs** :
  1. Âge (Nombre, obligatoire, min: 0, max: 120)
  2. Tension artérielle (Texte, obligatoire)
  3. Fréquence cardiaque (Nombre, obligatoire, unité: bpm)
  4. Date consultation (Date, obligatoire)
  5. Antécédents (Choix multiple: Aucun, Hypertension, Diabète, Autre)

#### Formulaire Test 2 : "Suivi Diabète"
- **Étude** : Étude Endocrinologie
- **Description** : Suivi des patients diabétiques
- **Champs** :
  1. Glycémie à jeun (Nombre, obligatoire, unité: g/L)
  2. HbA1c (Nombre, obligatoire, unité: %)
  3. Poids (Nombre, obligatoire, unité: kg)
  4. Traitement actuel (Texte, non obligatoire)

#### Formulaire Test 3 : "Formulaire Vide"
- **Étude** : Étude Test
- **Description** : Formulaire sans questions (test cas limite)
- **Champs** : Aucun

---

## 👨‍🔬 TESTS CHERCHEUR

### TC-F-001 : Création d'un formulaire complet

**Objectif** : Vérifier qu'un chercheur peut créer un formulaire avec tous les types de champs

**Prérequis** : Connecté en tant que chercheur

**Étapes** :
1. Aller dans "Mes Formulaires"
2. Cliquer sur "Nouveau Formulaire"
3. Remplir :
   - Titre : "Test Création Formulaire"
   - Étude : Sélectionner une étude
   - Description : "Ceci est un test"
4. Ajouter un champ TEXTE :
   - Label : "Nom du patient"
   - Type : Texte
   - Obligatoire : Oui
5. Ajouter un champ NOMBRE :
   - Label : "Âge"
   - Type : Nombre
   - Min : 0, Max : 120
   - Obligatoire : Oui
6. Ajouter un champ DATE :
   - Label : "Date de naissance"
   - Type : Date
   - Obligatoire : Non
7. Ajouter un champ CHOIX MULTIPLE :
   - Label : "Type de traitement"
   - Type : Choix multiple
   - Options : "Médical", "Chirurgical", "Autre"
   - Obligatoire : Oui
8. Cliquer sur "Créer le formulaire"

**Résultat attendu** :
- ✅ Message de succès "Formulaire créé avec succès"
- ✅ Redirection vers la liste des formulaires
- ✅ Le nouveau formulaire apparaît avec le statut "Brouillon"
- ✅ Tous les champs sont sauvegardés correctement

**Critères de validation** :
- [ ] Formulaire créé
- [ ] Tous les champs présents
- [ ] Statut = Brouillon
- [ ] Visible dans la liste

---

### TC-F-002 : Création d'un formulaire avec champs calculés

**Objectif** : Vérifier le support des formules de calcul

**Prérequis** : Connecté en tant que chercheur

**Étapes** :
1. Créer un nouveau formulaire "Test Calculs"
2. Ajouter un champ NOMBRE "Poids" (kg)
3. Ajouter un champ NOMBRE "Taille" (m)
4. Ajouter un champ TEXTE "IMC"
   - Dans "Unité", saisir : `CALC: POIDS / (TAILLE * TAILLE)`
5. Enregistrer le formulaire

**Résultat attendu** :
- ✅ Le champ "IMC" est marqué comme calculé
- ✅ Lors du remplissage, l'IMC se calcule automatiquement

**Critères de validation** :
- [ ] Formule acceptée
- [ ] Champ marqué comme calculé
- [ ] Calcul automatique fonctionnel

---

### TC-F-003 : Modification d'un formulaire en brouillon

**Objectif** : Vérifier qu'un formulaire brouillon peut être modifié

**Prérequis** : 
- Connecté en tant que chercheur
- Un formulaire en statut "Brouillon" existe

**Étapes** :
1. Aller dans "Mes Formulaires"
2. Cliquer sur "Modifier" sur un formulaire brouillon
3. Modifier le titre : "Titre Modifié"
4. Ajouter un nouveau champ
5. Supprimer un champ existant
6. Cliquer sur "Enregistrer"

**Résultat attendu** :
- ✅ Modifications sauvegardées
- ✅ Message de succès
- ✅ Statut reste "Brouillon"

**Critères de validation** :
- [ ] Titre modifié visible
- [ ] Nouveau champ ajouté
- [ ] Champ supprimé n'apparaît plus
- [ ] Statut = Brouillon

---

### TC-F-004 : Suppression d'un formulaire brouillon

**Objectif** : Vérifier qu'un formulaire brouillon peut être supprimé

**Prérequis** : 
- Connecté en tant que chercheur
- Un formulaire en statut "Brouillon" existe

**Étapes** :
1. Aller dans "Mes Formulaires"
2. Cliquer sur l'icône "Supprimer" (poubelle) sur un formulaire brouillon
3. Confirmer la suppression dans la popup

**Résultat attendu** :
- ✅ Message de confirmation
- ✅ Le formulaire disparaît de la liste
- ✅ Suppression définitive de la base de données

**Critères de validation** :
- [ ] Popup de confirmation apparaît
- [ ] Formulaire supprimé de la liste
- [ ] Message de succès affiché

---

### TC-F-005 : Envoi d'un formulaire à un médecin

**Objectif** : Vérifier qu'un formulaire peut être envoyé à un médecin

**Prérequis** : 
- Connecté en tant que chercheur
- Un formulaire existe (brouillon ou publié)
- Au moins 1 médecin dans le système

**Étapes** :
1. Aller dans "Mes Formulaires"
2. Cliquer sur "Envoyer" sur un formulaire
3. Sélectionner un médecin dans la liste
4. Cliquer sur "Envoyer le formulaire"

**Résultat attendu** :
- ✅ Message de succès "Formulaire envoyé à Dr. [Nom]"
- ✅ Si le formulaire était en brouillon, son statut passe à "Publié"
- ✅ Le formulaire apparaît dans "Formulaires envoyés"
- ✅ Le médecin reçoit le formulaire dans "Formulaires reçus"

**Critères de validation** :
- [ ] Message de succès
- [ ] Statut = Publié
- [ ] Visible dans "Formulaires envoyés"
- [ ] Médecin peut le voir

---

### TC-F-006 : Tentative d'envoi en double au même médecin

**Objectif** : Vérifier qu'on ne peut pas envoyer 2 fois le même formulaire au même médecin

**Prérequis** : 
- Connecté en tant que chercheur
- Un formulaire déjà envoyé au Dr. Martin

**Étapes** :
1. Aller dans "Mes Formulaires"
2. Cliquer sur "Envoyer" sur le même formulaire
3. Sélectionner le même médecin (Dr. Martin)
4. Cliquer sur "Envoyer le formulaire"

**Résultat attendu** :
- ❌ Message d'erreur : "Ce formulaire a déjà été envoyé au Dr. Martin. Le médecin peut le remplir plusieurs fois pour différents patients."
- ❌ Le formulaire n'est pas envoyé à nouveau

**Critères de validation** :
- [ ] Message d'erreur affiché
- [ ] Envoi bloqué
- [ ] Pas de doublon créé

---

### TC-F-007 : Envoi du même formulaire à plusieurs médecins différents

**Objectif** : Vérifier qu'un formulaire peut être envoyé à plusieurs médecins différents

**Prérequis** : 
- Connecté en tant que chercheur
- Un formulaire existe
- Au moins 2 médecins disponibles

**Étapes** :
1. Envoyer le formulaire au Dr. Martin
2. Envoyer le même formulaire au Dr. Bernard
3. Vérifier "Formulaires envoyés"

**Résultat attendu** :
- ✅ Les 2 envois réussissent
- ✅ Dans "Formulaires envoyés", 2 lignes apparaissent :
  - "Formulaire X | Dr. Martin | Envoyé le..."
  - "Formulaire X | Dr. Bernard | Envoyé le..."

**Critères de validation** :
- [ ] 2 envois réussis
- [ ] 2 lignes dans "Formulaires envoyés"
- [ ] Chaque médecin voit le formulaire

---

### TC-F-008 : Consultation de la liste des formulaires envoyés

**Objectif** : Vérifier l'affichage de tous les formulaires envoyés

**Prérequis** : 
- Connecté en tant que chercheur
- Au moins 3 formulaires envoyés à différents médecins

**Étapes** :
1. Aller dans "Dashboard Chercheur"
2. Cliquer sur l'onglet "Formulaires envoyés"
3. Observer la liste

**Résultat attendu** :
- ✅ Tous les formulaires envoyés sont listés
- ✅ Pour chaque formulaire, on voit :
  - Titre du formulaire
  - Nom du médecin destinataire
  - Date d'envoi
  - Statut (Lu/Non lu)
  - Statut de complétion (Complété/En attente)
- ✅ Possibilité de filtrer/rechercher
- ✅ Badge "Lu" ou "Non lu"

**Critères de validation** :
- [ ] Tous les formulaires affichés
- [ ] Informations complètes
- [ ] Statuts corrects
- [ ] Recherche fonctionnelle

---

### TC-F-009 : Masquage d'un formulaire envoyé (suppression côté chercheur)

**Objectif** : Vérifier qu'un chercheur peut masquer un formulaire envoyé

**Prérequis** : 
- Connecté en tant que chercheur
- Un formulaire envoyé existe

**Étapes** :
1. Aller dans "Formulaires envoyés"
2. Cliquer sur l'icône "Supprimer" sur un formulaire
3. Confirmer

**Résultat attendu** :
- ✅ Le formulaire disparaît de la vue du chercheur
- ✅ Le formulaire reste visible pour le médecin
- ✅ Si le médecin le masque aussi, suppression définitive

**Critères de validation** :
- [ ] Formulaire masqué pour le chercheur
- [ ] Toujours visible pour le médecin
- [ ] Message de succès

---

### TC-F-010 : Aperçu d'un formulaire avant envoi

**Objectif** : Vérifier la fonction d'aperçu

**Prérequis** : 
- Connecté en tant que chercheur
- Un formulaire existe

**Étapes** :
1. Aller dans "Mes Formulaires"
2. Cliquer sur "Aperçu" sur un formulaire
3. Observer l'affichage

**Résultat attendu** :
- ✅ Page d'aperçu s'affiche
- ✅ Toutes les questions sont visibles
- ✅ Pas de possibilité de modification
- ✅ Bouton "Retour" fonctionnel

**Critères de validation** :
- [ ] Aperçu affiché correctement
- [ ] Toutes les questions présentes
- [ ] Mode lecture seule
- [ ] Navigation fonctionnelle

---

## 👨‍⚕️ TESTS MÉDECIN

### TC-F-011 : Consultation des formulaires reçus

**Objectif** : Vérifier qu'un médecin voit tous les formulaires qui lui sont envoyés

**Prérequis** : 
- Connecté en tant que médecin
- Au moins 2 formulaires ont été envoyés à ce médecin

**Étapes** :
1. Se connecter en tant que Dr. Martin
2. Aller dans "Dashboard Médecin"
3. Observer l'onglet "Formulaires reçus"

**Résultat attendu** :
- ✅ Tous les formulaires envoyés sont listés
- ✅ Badges "Non lu" sur les nouveaux
- ✅ Informations visibles :
  - Titre
  - Étude
  - Chercheur expéditeur
  - Date d'envoi
- ✅ Boutons "Remplir" et "Supprimer" disponibles

**Critères de validation** :
- [ ] Tous les formulaires affichés
- [ ] Statuts corrects (Lu/Non lu)
- [ ] Informations complètes
- [ ] Actions disponibles

---

### TC-F-012 : Marquage automatique comme "Lu"

**Objectif** : Vérifier qu'un formulaire est marqué "Lu" quand le médecin l'ouvre

**Prérequis** : 
- Connecté en tant que médecin
- Un formulaire "Non lu" existe

**Étapes** :
1. Identifier un formulaire avec badge "Non lu"
2. Cliquer sur "Remplir"
3. Revenir au dashboard
4. Observer le formulaire

**Résultat attendu** :
- ✅ Le badge "Non lu" disparaît
- ✅ Le statut passe à "Lu"
- ✅ La date de lecture est enregistrée
- ✅ Visible côté chercheur également

**Critères de validation** :
- [ ] Statut = Lu
- [ ] Badge disparu
- [ ] Date de lecture enregistrée

---

### TC-F-013 : Remplissage d'un formulaire pour le 1er patient

**Objectif** : Vérifier le remplissage complet d'un formulaire

**Prérequis** : 
- Connecté en tant que médecin
- Un formulaire reçu et non complété

**Étapes** :
1. Cliquer sur "Remplir" sur un formulaire
2. **IMPORTANT** : Remplir le champ "Identifiant Patient" : `Patient-001`
3. Remplir tous les champs obligatoires :
   - Âge : 45
   - Tension : 120/80
   - Fréquence cardiaque : 72
   - Date : 04/12/2025
   - Antécédents : Hypertension
4. Cliquer sur "Soumettre"

**Résultat attendu** :
- ✅ Message de succès : "Formulaire enregistré avec succès pour le patient Patient-001"
- ✅ Redirection vers le dashboard médecin
- ✅ Le formulaire est marqué comme "Complété"
- ✅ Le formulaire reste dans "Formulaires reçus"
- ✅ Possibilité de le remplir à nouveau

**Critères de validation** :
- [ ] Message de succès avec identifiant patient
- [ ] Statut = Complété
- [ ] Formulaire toujours visible
- [ ] Bouton "Remplir" toujours disponible

---

### TC-F-014 : Remplissage du même formulaire pour un 2ème patient

**Objectif** : Vérifier qu'un médecin peut remplir plusieurs fois le même formulaire

**Prérequis** : 
- Connecté en tant que médecin
- Le formulaire a déjà été rempli pour Patient-001

**Étapes** :
1. Cliquer à nouveau sur "Remplir" sur le même formulaire
2. Remplir le champ "Identifiant Patient" : `Patient-002`
3. Remplir avec des données différentes :
   - Âge : 32
   - Tension : 110/70
   - Fréquence cardiaque : 68
   - Date : 04/12/2025
   - Antécédents : Aucun
4. Soumettre

**Résultat attendu** :
- ✅ Message de succès pour Patient-002
- ✅ Pas d'erreur (pas d'écrasement de Patient-001)
- ✅ Les 2 patients sont enregistrés
- ✅ Le formulaire reste disponible pour d'autres patients

**Critères de validation** :
- [ ] Soumission réussie
- [ ] Patient-001 toujours en base
- [ ] Patient-002 enregistré
- [ ] Formulaire toujours disponible

---

### TC-F-015 : Tentative de remplissage avec identifiant patient en double

**Objectif** : Vérifier qu'on ne peut pas utiliser 2 fois le même identifiant patient

**Prérequis** : 
- Connecté en tant que médecin
- Le formulaire a déjà été rempli pour Patient-001

**Étapes** :
1. Cliquer sur "Remplir"
2. Saisir l'identifiant : `Patient-001` (déjà utilisé)
3. Remplir les champs
4. Soumettre

**Résultat attendu** :
- ❌ Message d'erreur : "Le patient 'Patient-001' a déjà été enregistré pour ce formulaire. Utilisez un identifiant différent."
- ❌ Le formulaire n'est pas soumis
- ❌ Pas de doublon créé

**Critères de validation** :
- [ ] Message d'erreur affiché
- [ ] Soumission bloquée
- [ ] Pas de doublon

---

### TC-F-016 : Remplissage avec champ obligatoire manquant

**Objectif** : Vérifier la validation des champs obligatoires

**Prérequis** : 
- Connecté en tant que médecin
- Un formulaire avec champs obligatoires

**Étapes** :
1. Cliquer sur "Remplir"
2. Remplir l'identifiant patient
3. Laisser un champ obligatoire vide
4. Tenter de soumettre

**Résultat attendu** :
- ❌ Message d'erreur de validation HTML5
- ❌ Le formulaire n'est pas soumis
- ❌ Le champ manquant est surligné

**Critères de validation** :
- [ ] Validation côté client active
- [ ] Message d'erreur visible
- [ ] Soumission bloquée

---

### TC-F-017 : Remplissage avec nombre hors limites

**Objectif** : Vérifier la validation min/max des champs nombre

**Prérequis** : 
- Un champ nombre avec min=0, max=120

**Étapes** :
1. Remplir le formulaire
2. Dans "Âge", saisir : 150 (> max)
3. Tenter de soumettre

**Résultat attendu** :
- ❌ Message d'erreur : "La valeur doit être entre 0 et 120"
- ❌ Soumission bloquée

**Critères de validation** :
- [ ] Validation min/max active
- [ ] Message d'erreur approprié
- [ ] Soumission bloquée

---

### TC-F-018 : Test des champs calculés automatiques

**Objectif** : Vérifier que les formules se calculent automatiquement

**Prérequis** : 
- Un formulaire avec un champ calculé (ex: IMC)

**Étapes** :
1. Ouvrir le formulaire
2. Remplir "Poids" : 70
3. Remplir "Taille" : 1.75
4. Observer le champ "IMC"

**Résultat attendu** :
- ✅ Le champ "IMC" se remplit automatiquement
- ✅ Valeur calculée : 22.86 (70 / (1.75 * 1.75))
- ✅ Le champ est en lecture seule
- ✅ Icône de calculatrice visible

**Critères de validation** :
- [ ] Calcul automatique fonctionnel
- [ ] Valeur correcte
- [ ] Champ en lecture seule
- [ ] Indicateur visuel présent

---

### TC-F-019 : Masquage (suppression) d'un formulaire reçu

**Objectif** : Vérifier qu'un médecin peut supprimer un formulaire de sa vue

**Prérequis** : 
- Connecté en tant que médecin
- Un formulaire reçu

**Étapes** :
1. Dans "Formulaires reçus"
2. Cliquer sur l'icône "Supprimer"
3. Confirmer

**Résultat attendu** :
- ✅ Le formulaire disparaît de la vue du médecin
- ✅ Il reste visible pour le chercheur
- ✅ Message de succès

**Critères de validation** :
- [ ] Formulaire masqué
- [ ] Toujours visible côté chercheur
- [ ] Message de confirmation

---

### TC-F-020 : Remplissage d'un formulaire sans identifiant patient

**Objectif** : Vérifier qu'on ne peut pas soumettre sans identifiant patient

**Prérequis** : 
- Connecté en tant que médecin

**Étapes** :
1. Ouvrir un formulaire
2. **Ne pas remplir** le champ "Identifiant Patient"
3. Remplir les autres champs
4. Tenter de soumettre

**Résultat attendu** :
- ❌ Message d'erreur : "Veuillez saisir un identifiant patient"
- ❌ Soumission bloquée
- ❌ Focus sur le champ "Identifiant Patient"

**Critères de validation** :
- [ ] Validation active
- [ ] Message d'erreur clair
- [ ] Soumission bloquée

---

## 📊 TESTS AFFICHAGE ET CONSULTATION

### TC-F-021 : Consultation des données collectées (vue chercheur)

**Objectif** : Vérifier l'affichage des formulaires complétés dans le dashboard chercheur

**Prérequis** : 
- Connecté en tant que chercheur
- Au moins 2 formulaires complétés par des médecins

**Étapes** :
1. Aller dans "Dashboard Chercheur"
2. Cliquer sur l'onglet "Données collectées"
3. Observer la liste

**Résultat attendu** :
- ✅ Seuls les formulaires **complétés** apparaissent
- ✅ Pour chaque formulaire :
  - Titre du formulaire
  - Nom du médecin
  - Étude associée
  - Date de complétion
  - Bouton "Voir les réponses"
- ✅ Badge "Complété" en vert
- ✅ Pas de formulaires en attente

**Critères de validation** :
- [ ] Seuls les formulaires complétés
- [ ] Informations complètes
- [ ] Tri par date (plus récent en premier)
- [ ] Actions disponibles

---

### TC-F-022 : Visualisation des réponses groupées par patient

**Objectif** : Vérifier l'affichage des réponses groupées par patient

**Prérequis** : 
- Connecté en tant que chercheur
- Un formulaire complété pour 3 patients (Patient-001, Patient-002, Patient-003)

**Étapes** :
1. Dans "Données collectées"
2. Cliquer sur "Voir les réponses" sur un formulaire
3. Observer l'affichage

**Résultat attendu** :
- ✅ En-tête : "📊 3 patients enregistrés"
- ✅ 3 sections distinctes, chacune avec :
  - En-tête vert : "[1] Patient : Patient-001"
  - Toutes les questions/réponses pour ce patient
  - Séparation claire entre les patients
- ✅ Chaque section affiche :
  - Numéro séquentiel [1], [2], [3]
  - Identifiant patient
  - Questions et réponses du formulaire
  - Valeurs remplies surlignées en vert

**Critères de validation** :
- [ ] 3 sections patients distinctes
- [ ] Compteur total correct
- [ ] Groupement clair par patient
- [ ] Toutes les réponses présentes

---

### TC-F-023 : Affichage des différents types de champs dans les réponses

**Objectif** : Vérifier l'affichage correct de chaque type de champ

**Prérequis** : 
- Un formulaire complété avec tous les types de champs

**Étapes** :
1. Visualiser les réponses d'un formulaire
2. Observer chaque type de champ

**Résultat attendu** :

**Champ TEXTE** :
- ✅ Texte affiché dans un encadré vert
- ✅ Texte complet visible

**Champ NOMBRE** :
- ✅ Valeur numérique affichée
- ✅ Unité affichée à côté (ex: "70 kg")

**Champ DATE** :
- ✅ Date formatée en français (ex: "04 décembre 2025")

**Champ CHOIX MULTIPLE** :
- ✅ Option sélectionnée surlignée en vert
- ✅ Icône de check ✓
- ✅ Texte "Sélectionné" visible
- ✅ Autres options en gris

**Champ CALCULÉ** :
- ✅ Valeur calculée affichée
- ✅ Résultat du calcul correct

**Critères de validation** :
- [ ] Chaque type affiché correctement
- [ ] Formatage approprié
- [ ] Lisibilité optimale

---

### TC-F-024 : Recherche dans les données collectées

**Objectif** : Vérifier la fonction de recherche

**Prérequis** : 
- Au moins 5 formulaires complétés

**Étapes** :
1. Dans "Données collectées"
2. Utiliser la barre de recherche
3. Taper "Cardiaque"
4. Observer les résultats

**Résultat attendu** :
- ✅ Seuls les formulaires contenant "Cardiaque" dans le titre sont affichés
- ✅ Filtrage en temps réel
- ✅ Nombre de résultats mis à jour

**Critères de validation** :
- [ ] Recherche fonctionnelle
- [ ] Résultats filtrés
- [ ] Temps réel

---

### TC-F-025 : Pagination des données collectées

**Objectif** : Vérifier la pagination

**Prérequis** : 
- Plus de 5 formulaires complétés

**Étapes** :
1. Dans "Données collectées"
2. Observer la pagination en bas
3. Cliquer sur "Suivant"
4. Observer le changement

**Résultat attendu** :
- ✅ Affichage de 5 items par page
- ✅ Boutons "Précédent" / "Suivant"
- ✅ Indicateur "Page X / Y"
- ✅ Bouton "Précédent" désactivé sur page 1
- ✅ Bouton "Suivant" désactivé sur dernière page

**Critères de validation** :
- [ ] Pagination active
- [ ] Navigation fonctionnelle
- [ ] Indicateurs corrects

---

### TC-F-026 : Statistiques du dashboard chercheur

**Objectif** : Vérifier l'affichage des statistiques

**Prérequis** : 
- Des formulaires créés, envoyés, complétés

**Étapes** :
1. Aller sur le dashboard chercheur
2. Observer les cartes statistiques en haut

**Résultat attendu** :
- ✅ Carte "Formulaires créés" : nombre correct
- ✅ Carte "Formulaires envoyés" : nombre correct
- ✅ Carte "Formulaires complétés" : nombre correct
- ✅ Carte "Médecins collaborateurs" : nombre correct
- ✅ Chiffres en temps réel

**Critères de validation** :
- [ ] Toutes les statistiques affichées
- [ ] Chiffres corrects
- [ ] Mise à jour en temps réel

---

### TC-F-027 : Affichage d'un formulaire vide (0 questions)

**Objectif** : Vérifier le comportement avec un formulaire sans questions

**Prérequis** : 
- Un formulaire créé sans aucun champ

**Étapes** :
1. Envoyer ce formulaire à un médecin
2. En tant que médecin, l'ouvrir
3. Observer l'affichage

**Résultat attendu** :
- ✅ Message : "Aucune question dans ce formulaire"
- ✅ Icône 📝 affichée
- ✅ Pas d'erreur JavaScript
- ✅ Possibilité de revenir au dashboard

**Critères de validation** :
- [ ] Message approprié
- [ ] Pas d'erreur
- [ ] Navigation fonctionnelle

---

## 📤 TESTS D'EXPORT

### TC-F-028 : Export CSV d'un formulaire avec 1 patient

**Objectif** : Vérifier l'export CSV basique

**Prérequis** : 
- Un formulaire complété pour 1 patient

**Étapes** :
1. Visualiser les réponses du formulaire
2. Cliquer sur "Exporter CSV"
3. Télécharger le fichier
4. Ouvrir avec Excel/LibreOffice

**Résultat attendu** :
- ✅ Fichier CSV téléchargé
- ✅ Nom du fichier : `formulaire_[titre]_[date].csv`
- ✅ Encodage UTF-8 (accents corrects)
- ✅ Structure :
  ```
  Patient,Question,Réponse
  Patient-001,Âge,45
  Patient-001,Tension,120/80
  ...
  ```

**Critères de validation** :
- [ ] Export réussi
- [ ] Fichier bien formé
- [ ] Données correctes
- [ ] Encodage correct

---

### TC-F-029 : Export CSV avec plusieurs patients

**Objectif** : Vérifier l'export avec données multiples

**Prérequis** : 
- Un formulaire complété pour 3 patients

**Étapes** :
1. Exporter le formulaire
2. Ouvrir le CSV

**Résultat attendu** :
- ✅ Toutes les données des 3 patients présentes
- ✅ Structure :
  ```
  Patient,Question,Réponse
  Patient-001,Âge,45
  Patient-001,Tension,120/80
  Patient-002,Âge,32
  Patient-002,Tension,110/70
  Patient-003,Âge,58
  Patient-003,Tension,130/85
  ```
- ✅ Séparation claire par patient

**Critères de validation** :
- [ ] Tous les patients exportés
- [ ] Ordre cohérent
- [ ] Données complètes

---

### TC-F-030 : Impression d'un formulaire

**Objectif** : Vérifier la fonction d'impression

**Prérequis** : 
- Un formulaire complété

**Étapes** :
1. Visualiser les réponses
2. Cliquer sur "Imprimer"
3. Observer l'aperçu avant impression

**Résultat attendu** :
- ✅ Fenêtre d'impression du navigateur s'ouvre
- ✅ Mise en page adaptée à l'impression
- ✅ Toutes les informations visibles
- ✅ Groupement par patient préservé

**Critères de validation** :
- [ ] Fenêtre d'impression
- [ ] Mise en page correcte
- [ ] Contenu complet

---

## 🔒 TESTS DE SÉCURITÉ

### TC-F-031 : Tentative d'accès médecin aux formulaires d'un autre chercheur

**Objectif** : Vérifier l'isolation des données

**Prérequis** : 
- 2 chercheurs : Chercheur A et Chercheur B
- Chercheur A a envoyé un formulaire au Dr. Martin

**Étapes** :
1. Se connecter en tant que Chercheur B
2. Tenter d'accéder directement à l'URL du formulaire du Chercheur A
   (ex: `/formulaire/reponses?id=123`)

**Résultat attendu** :
- ❌ Erreur 403 Forbidden ou redirection
- ❌ Pas d'accès aux données du Chercheur A
- ❌ Message d'erreur approprié

**Critères de validation** :
- [ ] Accès refusé
- [ ] Pas de fuite de données
- [ ] Message d'erreur

---

### TC-F-032 : Tentative d'accès chercheur aux formulaires d'un autre médecin

**Objectif** : Vérifier qu'un médecin ne peut pas voir les formulaires d'un autre

**Prérequis** : 
- Un formulaire envoyé au Dr. Martin

**Étapes** :
1. Se connecter en tant que Dr. Bernard
2. Aller dans "Formulaires reçus"
3. Vérifier que le formulaire du Dr. Martin n'apparaît pas

**Résultat attendu** :
- ✅ Seuls les formulaires du Dr. Bernard sont visibles
- ❌ Pas de formulaires destinés à d'autres médecins

**Critères de validation** :
- [ ] Isolation correcte
- [ ] Pas de fuite de données

---

### TC-F-033 : Validation du token JWT

**Objectif** : Vérifier que les requêtes nécessitent un token valide

**Prérequis** : 
- Navigateur avec outils de développement

**Étapes** :
1. Se déconnecter
2. Ouvrir les DevTools (F12) → Network
3. Tenter d'accéder directement à `/api/formulaires/envoyes`

**Résultat attendu** :
- ❌ Erreur 401 Unauthorized
- ❌ Pas de données retournées
- ❌ Message : "Token manquant ou invalide"

**Critères de validation** :
- [ ] Erreur 401
- [ ] Authentification obligatoire
- [ ] Pas de données exposées

---

### TC-F-034 : Injection SQL dans le champ patient

**Objectif** : Tester la résistance aux injections SQL

**Prérequis** : 
- Connecté en tant que médecin

**Étapes** :
1. Remplir un formulaire
2. Dans "Identifiant Patient", saisir : `Patient'; DROP TABLE formulaire; --`
3. Soumettre

**Résultat attendu** :
- ✅ La chaîne est échappée/validée
- ✅ Pas d'exécution SQL malveillante
- ✅ Formulaire sauvegardé avec l'identifiant tel quel

**Critères de validation** :
- [ ] Injection bloquée
- [ ] Base de données intacte
- [ ] Validation/échappement actif

---

### TC-F-035 : XSS dans le champ texte

**Objectif** : Tester la résistance aux scripts malveillants

**Prérequis** : 
- Un formulaire avec un champ texte

**Étapes** :
1. Remplir le champ avec : `<script>alert('XSS')</script>`
2. Soumettre
3. Visualiser les réponses en tant que chercheur

**Résultat attendu** :
- ✅ Le script n'est pas exécuté
- ✅ Le texte est affiché comme texte brut
- ✅ Pas d'alerte JavaScript
- ✅ Caractères HTML échappés

**Critères de validation** :
- [ ] Script non exécuté
- [ ] Affichage sécurisé
- [ ] Échappement HTML actif

---

## 🔄 TESTS DE NON-RÉGRESSION

### TC-F-036 : Compatibilité avec anciennes données (sans patientIdentifier)

**Objectif** : Vérifier que les formulaires remplis avant l'ajout du champ patient fonctionnent

**Prérequis** : 
- Des données en base sans `patientIdentifier` (valeur NULL)

**Étapes** :
1. Visualiser un ancien formulaire dans "Données collectées"
2. Cliquer sur "Voir les réponses"

**Résultat attendu** :
- ✅ Le formulaire s'affiche sans erreur
- ✅ Patient affiché comme "Non spécifié"
- ✅ Toutes les réponses sont visibles
- ✅ Pas d'erreur JavaScript

**Critères de validation** :
- [ ] Affichage sans erreur
- [ ] "Non spécifié" pour patient NULL
- [ ] Données accessibles

---

### TC-F-037 : Modification d'un formulaire publié (vérifier qu'elle est bloquée)

**Objectif** : Vérifier qu'un formulaire publié ne peut pas être modifié

**Prérequis** : 
- Un formulaire avec statut "Publié"

**Étapes** :
1. Aller dans "Mes Formulaires"
2. Observer le formulaire publié

**Résultat attendu** :
- ❌ Pas de bouton "Modifier" sur les formulaires publiés
- ✅ Uniquement "Aperçu" et "Envoyer" disponibles
- ✅ Message explicatif si on tente de modifier

**Critères de validation** :
- [ ] Modification bloquée
- [ ] Actions limitées
- [ ] Message approprié

---

### TC-F-038 : Performance avec grand nombre de patients (10+)

**Objectif** : Tester les performances avec beaucoup de données

**Prérequis** : 
- Un formulaire rempli pour 15 patients

**Étapes** :
1. Visualiser les réponses
2. Observer le temps de chargement
3. Tester le scroll

**Résultat attendu** :
- ✅ Chargement < 3 secondes
- ✅ Scroll fluide
- ✅ Tous les patients affichés
- ✅ Pas de ralentissement

**Critères de validation** :
- [ ] Temps de chargement acceptable
- [ ] Interface réactive
- [ ] Pas de bug d'affichage

---

### TC-F-039 : Rechargement de page pendant le remplissage

**Objectif** : Vérifier la perte de données en cas de rechargement

**Prérequis** : 
- En cours de remplissage d'un formulaire

**Étapes** :
1. Remplir à moitié un formulaire
2. Appuyer sur F5 (recharger)
3. Observer

**Résultat attendu** :
- ⚠️ Les données saisies sont perdues (comportement attendu)
- ✅ Pas d'erreur JavaScript
- ✅ Formulaire vierge réaffiché
- ⚠️ Avertissement recommandé

**Critères de validation** :
- [ ] Pas d'erreur
- [ ] Formulaire réinitialisé
- [ ] Message d'avertissement (bonus)

---

### TC-F-040 : Test de bout en bout complet

**Objectif** : Scénario complet de A à Z

**Étapes** :
1. **Chercheur** : Se connecter
2. **Chercheur** : Créer un nouveau formulaire "Test E2E"
3. **Chercheur** : Ajouter 3 types de champs différents
4. **Chercheur** : Envoyer à Dr. Martin
5. **Médecin** : Se connecter (Dr. Martin)
6. **Médecin** : Vérifier réception (badge "Non lu")
7. **Médecin** : Remplir pour Patient-001
8. **Médecin** : Remplir pour Patient-002
9. **Chercheur** : Se reconnecter
10. **Chercheur** : Vérifier "Données collectées"
11. **Chercheur** : Visualiser les réponses (2 patients)
12. **Chercheur** : Exporter en CSV
13. **Chercheur** : Vérifier le CSV

**Résultat attendu** :
- ✅ Toutes les étapes réussies
- ✅ Aucune erreur rencontrée
- ✅ Données cohérentes de bout en bout
- ✅ Export contient les 2 patients

**Critères de validation** :
- [ ] Scénario complet réussi
- [ ] Pas d'erreur
- [ ] Données cohérentes

---

## 📝 RÉSUMÉ DES TESTS

### Répartition par catégorie

| Catégorie | Nombre de tests | Tests critiques |
|-----------|-----------------|-----------------|
| Chercheur | 10 | TC-F-001, TC-F-005, TC-F-006 |
| Médecin | 10 | TC-F-013, TC-F-014, TC-F-015 |
| Affichage | 7 | TC-F-022, TC-F-023 |
| Export | 3 | TC-F-028, TC-F-029 |
| Sécurité | 5 | TC-F-031, TC-F-034, TC-F-035 |
| Non-régression | 5 | TC-F-036, TC-F-040 |
| **TOTAL** | **40** | **12** |

### Priorités

#### 🔴 Priorité Critique (P0) - À tester en premier
- TC-F-001 : Création formulaire
- TC-F-005 : Envoi formulaire
- TC-F-006 : Restriction double envoi
- TC-F-013 : Remplissage 1er patient
- TC-F-014 : Remplissage 2ème patient
- TC-F-015 : Interdiction doublon patient
- TC-F-022 : Visualisation groupée
- TC-F-040 : Test E2E complet

#### 🟠 Priorité Haute (P1)
- TC-F-002 : Champs calculés
- TC-F-016 : Validation obligatoire
- TC-F-023 : Affichage types de champs
- TC-F-028 : Export CSV
- TC-F-031 : Sécurité isolation
- TC-F-034 : Injection SQL
- TC-F-035 : XSS

#### 🟡 Priorité Moyenne (P2)
- Tous les autres tests

### Taux de couverture cible

- ✅ **Fonctionnalités de base** : 100%
- ✅ **Cas limites** : 90%
- ✅ **Sécurité** : 100%
- ✅ **Performance** : 80%

---

## 📋 MODÈLE DE RAPPORT DE TEST

```
TEST ID: TC-F-XXX
DATE: __/__/____
TESTEUR: ________________
ENVIRONNEMENT: Dev / Test / Prod

RÉSULTAT: ✅ PASS / ❌ FAIL / ⚠️ BLOQUÉ

OBSERVATIONS:
________________________________________________________________
________________________________________________________________

BUGS IDENTIFIÉS:
________________________________________________________________
________________________________________________________________

CAPTURES D'ÉCRAN: Oui / Non
FICHIERS JOINTS: ________________
```

---

## ✅ CRITÈRES DE SUCCÈS GLOBAUX

Le module "Formulaires" est considéré comme validé si :

- ✅ **100%** des tests P0 passent
- ✅ **95%** des tests P1 passent
- ✅ **85%** des tests P2 passent
- ✅ **0** bug critique ouvert
- ✅ **≤ 2** bugs majeurs ouverts
- ✅ **Performance** : Temps de réponse < 2s (95ème percentile)
- ✅ **Sécurité** : 0 vulnérabilité critique détectée

---

**FIN DU CAHIER DE TEST**

*Document à mettre à jour à chaque évolution fonctionnelle*

