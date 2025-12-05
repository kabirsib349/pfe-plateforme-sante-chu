# 📋 CAHIER DE TEST - FONCTIONNALITÉS FORMULAIRES

**Projet** : Plateforme Santé CHU  
**Module** : Gestion des Formulaires  
**Date** : 04/12/2025  
**Version** : 2.0  
**Auteur** : Emmanuel

---

## 📚 LÉGENDE DES STATUTS

| Statut | Signification |
|--------|---------------|
| ✅ | Test réussi |
| ❌ | Test échoué |
| ⏳ | En attente |
| 🔄 | En cours |
| ⚠️ | Bloqué |
| ➖ | Non applicable |

---

## 🔧 PRÉREQUIS

### Configuration requise
- Backend démarré sur `http://localhost:8080`
- Frontend démarré sur `http://localhost:3000`
- Base de données accessible et initialisée
- Au moins 1 compte chercheur
- Au moins 2 comptes médecins
- Au moins 1 étude créée

### Comptes de test
| Rôle | Email | Mot de passe | Nom |
|------|-------|--------------|-----|
| Chercheur | chercheur@test.com | Test123! | Dr. Dupont |
| Médecin 1 | medecin1@test.com | Test123! | Dr. Martin |
| Médecin 2 | medecin2@test.com | Test123! | Dr. Bernard |

---

## 👨‍🔬 SECTION 1 : TESTS CHERCHEUR - CRÉATION ET GESTION

| ID | Description du test | Résultat attendu | Résultat obtenu | Auteur | Statut |
|----|---------------------|------------------|-----------------|--------|--------|
| TC-F-001 | **Création d'un formulaire complet**<br>1. Se connecter en chercheur<br>2. Aller dans "Mes Formulaires"<br>3. Cliquer "Nouveau Formulaire"<br>4. Remplir titre, étude, description<br>5. Ajouter champs TEXTE, NOMBRE, DATE, CHOIX MULTIPLE<br>6. Cliquer "Créer" | - Message "Formulaire créé avec succès"<br>- Redirection vers liste<br>- Formulaire visible avec statut "Brouillon"<br>- Tous les champs sauvegardés | | Emmanuel | ⏳ |
| TC-F-002 | **Création formulaire avec champs calculés**<br>1. Créer formulaire "Test Calculs"<br>2. Ajouter champ NOMBRE "Poids" (kg)<br>3. Ajouter champ NOMBRE "Taille" (m)<br>4. Ajouter champ avec formule IMC<br>5. Enregistrer | - Champ "IMC" marqué comme calculé<br>- Formule acceptée<br>- Calcul automatique lors remplissage | | Emmanuel | ⏳ |
| TC-F-003 | **Modification formulaire brouillon**<br>1. Sélectionner formulaire "Brouillon"<br>2. Cliquer "Modifier"<br>3. Changer titre<br>4. Ajouter/supprimer champ<br>5. Enregistrer | - Modifications sauvegardées<br>- Message de succès<br>- Statut reste "Brouillon" | | Emmanuel | ⏳ |
| TC-F-004 | **Suppression formulaire brouillon**<br>1. Cliquer icône "Supprimer" sur brouillon<br>2. Confirmer suppression | - Popup confirmation<br>- Formulaire supprimé de la liste<br>- Suppression définitive en base | | Emmanuel | ⏳ |
| TC-F-005 | **Aperçu formulaire avant envoi**<br>1. Cliquer "Aperçu" sur formulaire<br>2. Observer affichage | - Page aperçu s'affiche<br>- Toutes questions visibles<br>- Mode lecture seule<br>- Bouton "Retour" fonctionnel | | Emmanuel | ⏳ |

---

## 📤 SECTION 2 : TESTS CHERCHEUR - ENVOI DE FORMULAIRES

| ID | Description du test | Résultat attendu | Résultat obtenu | Auteur | Statut |
|----|---------------------|------------------|-----------------|--------|--------|
| TC-F-006 | **Envoi formulaire à un médecin**<br>1. Cliquer "Envoyer" sur formulaire<br>2. Sélectionner Dr. Martin<br>3. Confirmer envoi | - Message "Formulaire envoyé à Dr. Martin"<br>- Statut passe à "Publié" si brouillon<br>- Visible dans "Formulaires envoyés"<br>- Médecin reçoit le formulaire | | Emmanuel | ⏳ |
| TC-F-007 | **Tentative envoi en double au même médecin**<br>1. Réenvoyer même formulaire<br>2. Sélectionner même médecin<br>3. Tenter envoi | - Message d'erreur : "Ce formulaire a déjà été envoyé au Dr. Martin. Le médecin peut le remplir plusieurs fois pour différents patients."<br>- Envoi bloqué | | Emmanuel | ⏳ |
| TC-F-008 | **Envoi même formulaire à médecins différents**<br>1. Envoyer formulaire au Dr. Martin<br>2. Envoyer même formulaire au Dr. Bernard<br>3. Vérifier "Formulaires envoyés" | - 2 envois réussissent<br>- 2 lignes distinctes dans "Formulaires envoyés"<br>- Chaque médecin voit le formulaire | | Emmanuel | ⏳ |
| TC-F-009 | **Consultation liste formulaires envoyés**<br>1. Aller dans "Formulaires envoyés"<br>2. Observer la liste | - Tous formulaires envoyés listés<br>- Infos complètes (titre, médecin, date, statut)<br>- Badge "Lu"/"Non lu"<br>- Recherche fonctionnelle | | Emmanuel | ⏳ |
| TC-F-010 | **Masquage formulaire envoyé**<br>1. Cliquer "Supprimer" sur formulaire envoyé<br>2. Confirmer | - Formulaire masqué pour chercheur<br>- Reste visible pour médecin<br>- Message de succès | | Emmanuel | ⏳ |

---

## 👨‍⚕️ SECTION 3 : TESTS MÉDECIN - RÉCEPTION ET CONSULTATION

| ID | Description du test | Résultat attendu | Résultat obtenu | Auteur | Statut |
|----|---------------------|------------------|-----------------|--------|--------|
| TC-F-011 | **Consultation formulaires reçus**<br>1. Se connecter en Dr. Martin<br>2. Aller "Dashboard Médecin"<br>3. Observer "Formulaires reçus" | - Tous formulaires envoyés listés<br>- Badge "Non lu" sur nouveaux<br>- Infos complètes (titre, étude, chercheur, date)<br>- Boutons "Remplir" et "Supprimer" | | Emmanuel | ⏳ |
| TC-F-012 | **Marquage automatique "Lu"**<br>1. Identifier formulaire "Non lu"<br>2. Cliquer "Remplir"<br>3. Revenir au dashboard<br>4. Observer formulaire | - Badge "Non lu" disparaît<br>- Statut passe à "Lu"<br>- Date lecture enregistrée<br>- Visible côté chercheur | | Emmanuel | ⏳ |
| TC-F-013 | **Masquage formulaire reçu**<br>1. Cliquer "Supprimer" sur formulaire<br>2. Confirmer | - Formulaire masqué pour médecin<br>- Reste visible pour chercheur<br>- Message confirmation | | Emmanuel | ⏳ |

---

## 📝 SECTION 4 : TESTS MÉDECIN - REMPLISSAGE FORMULAIRES

| ID | Description du test | Résultat attendu | Résultat obtenu | Auteur | Statut |
|----|---------------------|------------------|-----------------|--------|--------|
| TC-F-014 | **Remplissage pour 1er patient**<br>1. Cliquer "Remplir"<br>2. Saisir ID patient : "Patient-001"<br>3. Remplir champs obligatoires :<br>   - Âge : 45<br>   - Tension : 120/80<br>   - Date : 04/12/2025<br>4. Soumettre | - Message "Formulaire enregistré avec succès pour le patient Patient-001"<br>- Redirection dashboard<br>- Formulaire marqué "Complété"<br>- Reste dans "Formulaires reçus"<br>- Bouton "Remplir" disponible | | Emmanuel | ⏳ |
| TC-F-015 | **Remplissage pour 2ème patient**<br>1. Cliquer "Remplir" sur même formulaire<br>2. Saisir ID : "Patient-002"<br>3. Remplir avec données différentes<br>4. Soumettre | - Message succès pour Patient-002<br>- Pas d'écrasement Patient-001<br>- 2 patients enregistrés<br>- Formulaire disponible pour autres patients | | Emmanuel | ⏳ |
| TC-F-016 | **Remplissage pour 3ème patient avec ID alphanumérique**<br>1. Cliquer "Remplir"<br>2. Saisir ID : "PAT-ABC-123"<br>3. Remplir données<br>4. Soumettre | - Accepte ID avec lettres/chiffres<br>- Message succès<br>- Patient enregistré avec ID exact | | Emmanuel | ⏳ |
| TC-F-017 | **Tentative remplissage ID patient en double**<br>1. Cliquer "Remplir"<br>2. Saisir ID déjà utilisé : "Patient-001"<br>3. Tenter soumettre | - Message erreur : "Le patient 'Patient-001' a déjà été enregistré pour ce formulaire"<br>- Soumission bloquée<br>- Pas de doublon | | Emmanuel | ⏳ |
| TC-F-018 | **Remplissage sans ID patient**<br>1. Ouvrir formulaire<br>2. Ne pas remplir "ID Patient"<br>3. Remplir autres champs<br>4. Tenter soumettre | - Message erreur : "Veuillez saisir un identifiant patient"<br>- Soumission bloquée<br>- Focus sur champ ID | | Emmanuel | ⏳ |
| TC-F-019 | **Validation champ obligatoire manquant**<br>1. Remplir ID patient<br>2. Laisser champ obligatoire vide<br>3. Tenter soumettre | - Message erreur validation HTML5<br>- Champ manquant surligné<br>- Soumission bloquée | | Emmanuel | ⏳ |
| TC-F-020 | **Validation nombre hors limites**<br>1. Remplir formulaire<br>2. Saisir âge = 150 (max=120)<br>3. Tenter soumettre | - Message : "La valeur doit être entre 0 et 120"<br>- Soumission bloquée | | Emmanuel | ⏳ |
| TC-F-021 | **Test champs calculés automatiques**<br>1. Formulaire avec IMC calculé<br>2. Remplir Poids : 70<br>3. Remplir Taille : 1.75<br>4. Observer IMC | - IMC calculé automatiquement : 22.86<br>- Champ en lecture seule<br>- Icône calculatrice visible | | Emmanuel | ⏳ |

---

## 📊 SECTION 5 : TESTS CHERCHEUR - CONSULTATION DONNÉES COLLECTÉES

| ID | Description du test | Résultat attendu | Résultat obtenu | Auteur | Statut |
|----|---------------------|------------------|-----------------|--------|--------|
| TC-F-022 | **Consultation données collectées**<br>1. Connexion chercheur<br>2. Aller "Dashboard Chercheur"<br>3. Cliquer "Données collectées"<br>4. Observer liste | - Seuls formulaires complétés affichés<br>- Infos : titre, médecin, étude, date<br>- Badge "Complété" vert<br>- Bouton "Voir les réponses"<br>- Tri par date (récent → ancien) | | Emmanuel | ⏳ |
| TC-F-023 | **Affichage page réponses - Vue tableau**<br>1. Cliquer "Voir les réponses"<br>2. Observer affichage | - En-tête avec titre formulaire<br>- Statistiques : "X patients" et "Y réponses"<br>- Barre de recherche fonctionnelle<br>- Tableau avec colonnes : ID Patient, Date, Action<br>- Pagination si >10 patients | | Emmanuel | ⏳ |
| TC-F-024 | **Visualisation réponses 1 patient - Modal**<br>1. Cliquer "Voir les réponses" sur patient<br>2. Observer modal | - Modal s'ouvre en plein écran blanc<br>- En-tête vert avec ID patient et date<br>- Toutes questions/réponses affichées<br>- Réponses surlignées en vert<br>- Bouton "Fermer" | | Emmanuel | ⏳ |
| TC-F-025 | **Affichage types de champs différents**<br>1. Formulaire avec tous types champs<br>2. Visualiser réponses | **Texte** : Encadré vert, texte complet<br>**Nombre** : Valeur + unité (ex: 70 kg)<br>**Date** : Format français (04 décembre 2025)<br>**Choix multiple** : Option sélectionnée en vert, ✓, "Sélectionné"<br>**Calculé** : Résultat calcul affiché | | Emmanuel | ⏳ |
| TC-F-026 | **Recherche patient par ID**<br>1. Page réponses avec 5+ patients<br>2. Taper "Patient-001" dans recherche<br>3. Observer résultats | - Seul "Patient-001" affiché<br>- Filtrage temps réel<br>- Message si aucun résultat<br>- Bouton "Réinitialiser recherche" | | Emmanuel | ⏳ |
| TC-F-027 | **Recherche patient partielle**<br>1. Patients : "PAT-001", "PAT-002", "ABC-001"<br>2. Taper "PAT"<br>3. Observer | - "PAT-001" et "PAT-002" trouvés<br>- "ABC-001" non affiché<br>- Insensible à la casse | | Emmanuel | ⏳ |
| TC-F-028 | **Pagination patients**<br>1. Formulaire avec 25 patients<br>2. Observer pagination | - 10 patients par page<br>- 3 pages au total<br>- Boutons Précédent/Suivant<br>- Indicateur "Page X sur Y"<br>- Précédent désactivé sur page 1<br>- Suivant désactivé sur dernière page | | Emmanuel | ⏳ |
| TC-F-029 | **Rechargement page réponses**<br>1. Page réponses avec patients affichés<br>2. Appuyer F5 (recharger)<br>3. Observer | - Pas d'erreur "ID manquant"<br>- Page se recharge correctement<br>- Données toujours affichées | | Emmanuel | ⏳ |
| TC-F-030 | **Recherche puis rechargement**<br>1. Rechercher patient<br>2. Appuyer F5<br>3. Observer | - Pas d'erreur<br>- Recherche réinitialisée<br>- Tous patients affichés | | Emmanuel | ⏳ |

---

## 📤 SECTION 6 : TESTS EXPORT ET IMPRESSION

| ID | Description du test | Résultat attendu | Résultat obtenu | Auteur | Statut |
|----|---------------------|------------------|-----------------|--------|--------|
| TC-F-031 | **Export CSV - 1 patient**<br>1. Formulaire avec 1 patient<br>2. Cliquer "Exporter CSV"<br>3. Télécharger et ouvrir fichier | - Fichier CSV téléchargé<br>- Nom : `formulaire_[titre]_[date].csv`<br>- Encodage UTF-8 (accents OK)<br>- Structure : Patient, Question, Réponse | | Emmanuel | ⏳ |
| TC-F-032 | **Export CSV - Plusieurs patients**<br>1. Formulaire avec 3 patients<br>2. Exporter CSV<br>3. Ouvrir fichier | - Tous patients présents<br>- Données organisées par patient<br>- Ordre cohérent | | Emmanuel | ⏳ |
| TC-F-033 | **Impression formulaire**<br>1. Page réponses<br>2. Cliquer "Imprimer"<br>3. Observer aperçu | - Fenêtre impression navigateur<br>- Mise en page adaptée<br>- Toutes infos visibles<br>- Groupement patients préservé | | Emmanuel | ⏳ |

---

## 🔒 SECTION 7 : TESTS SÉCURITÉ

| ID | Description du test | Résultat attendu | Résultat obtenu | Auteur | Statut |
|----|---------------------|------------------|-----------------|--------|--------|
| TC-F-034 | **Isolation données - Chercheurs**<br>1. Chercheur A envoie formulaire<br>2. Connexion Chercheur B<br>3. Tenter accès URL formulaire A | - Erreur 403 Forbidden<br>- Pas d'accès données Chercheur A<br>- Message erreur approprié | | Emmanuel | ⏳ |
| TC-F-035 | **Isolation données - Médecins**<br>1. Formulaire envoyé à Dr. Martin<br>2. Connexion Dr. Bernard<br>3. Vérifier "Formulaires reçus" | - Seuls formulaires Dr. Bernard visibles<br>- Formulaires Dr. Martin non affichés | | Emmanuel | ⏳ |
| TC-F-036 | **Validation token JWT**<br>1. Se déconnecter<br>2. Outils Dev (F12) → Network<br>3. Tenter accès `/api/formulaires/envoyes` | - Erreur 401 Unauthorized<br>- Pas de données retournées<br>- Message : "Token manquant ou invalide" | | Emmanuel | ⏳ |
| TC-F-037 | **Protection injection SQL**<br>1. Connexion médecin<br>2. ID Patient : `Patient'; DROP TABLE formulaire; --`<br>3. Soumettre | - Chaîne échappée/validée<br>- Pas d'exécution SQL malveillante<br>- Formulaire sauvegardé avec ID tel quel | | Emmanuel | ⏳ |
| TC-F-038 | **Protection XSS**<br>1. Champ texte : `<script>alert('XSS')</script>`<br>2. Soumettre<br>3. Visualiser réponses (chercheur) | - Script non exécuté<br>- Texte affiché comme texte brut<br>- Pas d'alerte JavaScript<br>- Caractères HTML échappés | | Emmanuel | ⏳ |

---

## 🔄 SECTION 8 : TESTS NON-RÉGRESSION

| ID | Description du test | Résultat attendu | Résultat obtenu | Auteur | Statut |
|----|---------------------|------------------|-----------------|--------|--------|
| TC-F-039 | **Compatibilité données anciennes**<br>1. Données sans `patientIdentifier` (NULL)<br>2. Visualiser réponses | - Affichage sans erreur<br>- Patient "Non spécifié"<br>- Toutes réponses visibles | | Emmanuel | ⏳ |
| TC-F-040 | **Modification formulaire publié bloquée**<br>1. Formulaire statut "Publié"<br>2. Observer actions disponibles | - Pas de bouton "Modifier"<br>- Seuls "Aperçu" et "Envoyer"<br>- Message si tentative modification | | Emmanuel | ⏳ |
| TC-F-041 | **Performance 15+ patients**<br>1. Formulaire avec 15 patients<br>2. Visualiser réponses<br>3. Tester scroll et navigation | - Chargement < 3 secondes<br>- Scroll fluide<br>- Tous patients affichés<br>- Pas de ralentissement | | Emmanuel | ⏳ |
| TC-F-042 | **Rechargement pendant remplissage**<br>1. Remplir formulaire à moitié<br>2. Appuyer F5<br>3. Observer | - Données saisies perdues (normal)<br>- Pas d'erreur JavaScript<br>- Formulaire vierge réaffiché | | Emmanuel | ⏳ |
| TC-F-043 | **Formulaire vide (0 questions)**<br>1. Créer formulaire sans champs<br>2. Envoyer à médecin<br>3. Médecin ouvre formulaire | - Message : "Aucune question dans ce formulaire"<br>- Icône 📝<br>- Pas d'erreur<br>- Retour dashboard possible | | Emmanuel | ⏳ |

---

## 🎯 SECTION 9 : TEST DE BOUT EN BOUT (E2E)

| ID | Description du test | Résultat attendu | Résultat obtenu | Auteur | Statut |
|----|---------------------|------------------|-----------------|--------|--------|
| TC-F-044 | **Scénario complet A→Z**<br>**CHERCHEUR :**<br>1. Créer formulaire "Test E2E"<br>2. Ajouter 3 champs (texte, nombre, date)<br>3. Envoyer à Dr. Martin<br>**MÉDECIN :**<br>4. Vérifier réception (badge "Non lu")<br>5. Remplir pour Patient-001<br>6. Remplir pour Patient-002<br>7. Remplir pour PAT-ABC-123<br>**CHERCHEUR :**<br>8. Vérifier "Données collectées"<br>9. Visualiser tableau patients<br>10. Rechercher "PAT"<br>11. Voir détails Patient-001<br>12. Exporter CSV<br>13. Vérifier CSV contient 3 patients | - Toutes étapes réussies<br>- Aucune erreur<br>- Données cohérentes bout en bout<br>- CSV contient 3 patients<br>- Recherche fonctionne<br>- Modal affiche détails corrects | | Emmanuel | ⏳ |

---

## 📊 TABLEAU RÉCAPITULATIF

### Statistiques par section

| Section | Nombre tests | Tests P0 | Tests P1 | Tests P2 |
|---------|--------------|----------|----------|----------|
| 1. Chercheur - Création | 5 | 1 | 2 | 2 |
| 2. Chercheur - Envoi | 5 | 2 | 1 | 2 |
| 3. Médecin - Réception | 3 | 0 | 1 | 2 |
| 4. Médecin - Remplissage | 8 | 3 | 3 | 2 |
| 5. Chercheur - Consultation | 9 | 2 | 3 | 4 |
| 6. Export/Impression | 3 | 0 | 2 | 1 |
| 7. Sécurité | 5 | 0 | 5 | 0 |
| 8. Non-régression | 5 | 0 | 1 | 4 |
| 9. E2E | 1 | 1 | 0 | 0 |
| **TOTAL** | **44** | **9** | **18** | **17** |

### Répartition des priorités

#### 🔴 **Priorité P0 - Critique** (9 tests)
- TC-F-001 : Création formulaire
- TC-F-006 : Envoi formulaire
- TC-F-007 : Restriction double envoi
- TC-F-014 : Remplissage 1er patient
- TC-F-015 : Remplissage 2ème patient
- TC-F-017 : Interdiction doublon patient
- TC-F-022 : Consultation données collectées
- TC-F-023 : Affichage tableau patients
- TC-F-044 : Test E2E complet

#### 🟠 **Priorité P1 - Haute** (18 tests)
- Tous tests marqués validation, sécurité, affichage réponses

#### 🟡 **Priorité P2 - Moyenne** (17 tests)
- Tous autres tests

---

## ✅ CRITÈRES DE VALIDATION GLOBAUX

Le module "Formulaires" est validé si :

| Critère | Objectif | Statut |
|---------|----------|--------|
| Tests P0 réussis | 100% (9/9) | ⏳ |
| Tests P1 réussis | ≥ 95% (17/18) | ⏳ |
| Tests P2 réussis | ≥ 85% (15/17) | ⏳ |
| Bugs critiques | 0 | ⏳ |
| Bugs majeurs | ≤ 2 | ⏳ |
| Performance | Temps réponse < 2s | ⏳ |
| Sécurité | 0 vulnérabilité critique | ⏳ |

---

## 📝 MODÈLE RAPPORT DE BUG

```
BUG ID: BUG-F-XXX
TEST ASSOCIÉ: TC-F-XXX
DATE: __/__/____
RAPPORTEUR: Emmanuel

SÉVÉRITÉ: ☐ Critique  ☐ Majeur  ☐ Mineur  ☐ Cosmétique

DESCRIPTION:
________________________________________________________________

ÉTAPES REPRODUCTION:
1. _____________________________________________________________
2. _____________________________________________________________
3. _____________________________________________________________

RÉSULTAT OBTENU:
________________________________________________________________

RÉSULTAT ATTENDU:
________________________________________________________________

ENVIRONNEMENT:
- OS: ___________
- Navigateur: ___________
- Backend version: ___________
- Frontend version: ___________

CAPTURES D'ÉCRAN: ☐ Oui  ☐ Non
PRIORITÉ CORRECTION: ☐ Immédiate  ☐ Haute  ☐ Normale  ☐ Basse
```

---

## 📅 PLANNING DE TESTS

### Phase 1 : Tests Critiques (Semaine 1)
- Tous tests P0
- Durée estimée : 2 jours

### Phase 2 : Tests Prioritaires (Semaine 2)
- Tous tests P1
- Durée estimée : 3 jours

### Phase 3 : Tests Complémentaires (Semaine 3)
- Tous tests P2
- Durée estimée : 2 jours

### Phase 4 : Tests de Régression (Semaine 4)
- Re-test bugs corrigés
- Validation finale
- Durée estimée : 1 jour

---

**Document créé par : Emmanuel**  
**Date création : 04/12/2025**  
**Dernière mise à jour : 04/12/2025**

---

**FIN DU CAHIER DE TEST**

