# 🔧 Guide de Refactorisation - Backend

## 🎯 Objectif
Éliminer les redondances et améliorer la qualité du code sans casser les fonctionnalités.

**Temps estimé total**: 5-6 heures

---

## 🔴 Priorité HAUTE (2h)

### 1. Supprimer les Méthodes Inutilisées (15 min)

#### Fichier: `FormulaireRepository.java`
```java
// ❌ À SUPPRIMER (ligne ~30)
Optional<Formulaire> findByIdFormulaire(Long idFormulaire);
// Raison: Redondant avec findById() de JpaRepository
```

**Action:**
1. Vérifier qu'aucun code n'utilise cette méthode
2. Supprimer la ligne
3. Compiler pour vérifier

#### Fichier: `FormulaireMedecinRepository.java`
```java
// ❌ À SUPPRIMER (ligne ~40)
@Modifying
void deleteByFormulaireIdFormulaire(Long formulaireId);
// Raison: Jamais appelée dans le code
```

**Action:**
1. Rechercher les usages (devrait être 0)
2. Supprimer la méthode
3. Compiler

---

### 2. Déplacer la Requête des Médecins (10 min)

#### Problème
La requête pour récupérer les médecins est dans le mauvais repository.

#### Fichier: `FormulaireMedecinRepository.java`
```java
// ❌ À SUPPRIMER
@Query("SELECT u FROM Utilisateur u WHERE u.role.nom = 'medecin'")
List<Utilisateur> findMedecins();
```

#### Fichier: `UtilisateurRepository.java`
```java
// ✅ À AJOUTER
@Query("SELECT u FROM Utilisateur u WHERE u.role.nom = :roleName")
List<Utilisateur> findByRoleName(@Param("roleName") String roleName);
```

#### Fichier: `FormulaireMedecinService.java`
```java
// ❌ Avant
private final FormulaireMedecinRepository formulaireMedecinRepository;

public List<Utilisateur> getMedecins() {
    return formulaireMedecinRepository.findMedecins();
}

// ✅ Après
private final UtilisateurRepository utilisateurRepository;

public List<Utilisateur> getMedecins() {
    return utilisateurRepository.findByRoleName("medecin");
}
```

---

### 3. Refactoriser les Méthodes de Masquage (30 min)

#### Problème
Code dupliqué à 90% entre `masquerPourMedecin` et `masquerPourChercheur`.

#### Fichier: `FormulaireMedecinService.java`

**Avant (code dupliqué):**
```java
@Transactional
public void masquerPourMedecin(Long formulaireMedecinId, String emailMedecin) {
    FormulaireMedecin fm = formulaireMedecinRepository.findById(formulaireMedecinId)
            .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

    if (!fm.getMedecin().getEmail().equals(emailMedecin)) {
        throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
    }

    fm.setMasquePourMedecin(true);
    formulaireMedecinRepository.save(fm);

    if (fm.isMasquePourChercheur()) {
        supprimerDefinitivement(fm);
    }
}

@Transactional
public void masquerPourChercheur(Long formulaireMedecinId, String emailChercheur) {
    FormulaireMedecin fm = formulaireMedecinRepository.findById(formulaireMedecinId)
            .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

    if (!fm.getChercheur().getEmail().equals(emailChercheur)) {
        throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
    }

    fm.setMasquePourChercheur(true);
    formulaireMedecinRepository.save(fm);

    if (fm.isMasquePourMedecin()) {
        supprimerDefinitivement(fm);
    }
}
```

**Après (refactorisé):**
```java
@Transactional
public void masquerPourMedecin(Long formulaireMedecinId, String emailMedecin) {
    FormulaireMedecin fm = getFormulaireMedecinAvecVerification(formulaireMedecinId);
    verifierAutorisationMedecin(fm, emailMedecin);
    masquer(fm, true);
}

@Transactional
public void masquerPourChercheur(Long formulaireMedecinId, String emailChercheur) {
    FormulaireMedecin fm = getFormulaireMedecinAvecVerification(formulaireMedecinId);
    verifierAutorisationChercheur(fm, emailChercheur);
    masquer(fm, false);
}

// Méthodes privées
private FormulaireMedecin getFormulaireMedecinAvecVerification(Long id) {
    return formulaireMedecinRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));
}

private void verifierAutorisationMedecin(FormulaireMedecin fm, String email) {
    if (!fm.getMedecin().getEmail().equals(email)) {
        throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
    }
}

private void verifierAutorisationChercheur(FormulaireMedecin fm, String email) {
    if (!fm.getChercheur().getEmail().equals(email)) {
        throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
    }
}

private void masquer(FormulaireMedecin fm, boolean pourMedecin) {
    if (pourMedecin) {
        fm.setMasquePourMedecin(true);
    } else {
        fm.setMasquePourChercheur(true);
    }
    
    formulaireMedecinRepository.save(fm);
    
    // Supprimer définitivement si masqué des deux côtés
    if (fm.isMasquePourMedecin() && fm.isMasquePourChercheur()) {
        supprimerDefinitivement(fm);
    }
}
```

**Bénéfices:**
- Réduction de 50% du code
- Logique centralisée
- Plus facile à maintenir
- Moins de risques de bugs

---

### 4. Remplacer System.out.println par Logger (30 min)

#### Fichier: `UserController.java`

**Avant:**
```java
public class UserController {
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Principal principal, @RequestBody UserDto dto) {
        System.out.println("Principal : " + principal);
        System.out.println("Nom : " + dto.getNom());
        System.out.println("Email : " + dto.getEmail());
        
        var updatedUser = userService.updateProfile(principal.getName(), dto);
        System.out.println("User mis à jour : " + updatedUser);
        
        // ...
    }
}
```

**Après:**
```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Principal principal, @RequestBody UserDto dto) {
        log.debug("Updating profile for user: {}", principal.getName());
        log.debug("New data - Name: {}, Email: {}", dto.getNom(), dto.getEmail());
        
        var updatedUser = userService.updateProfile(principal.getName(), dto);
        log.info("Profile updated successfully for user: {}", updatedUser.getEmail());
        
        // ...
    }
}
```

---

### 5. Centraliser la Gestion d'Erreurs (30 min)

#### Problème
`UserController` a son propre `@ExceptionHandler`, ce qui duplique la logique de `GlobalExceptionHandler`.

#### Fichier: `UserController.java`
```java
// ❌ À SUPPRIMER
@ExceptionHandler({IllegalStateException.class, UsernameNotFoundException.class})
public ResponseEntity<Map<String, String>> handleBusinessException(Exception ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("message", ex.getMessage()));
}
```

#### Fichier: `GlobalExceptionHandler.java`
```java
// ✅ Déjà présent, mais ajouter UsernameNotFoundException
@ExceptionHandler(UsernameNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleUsernameNotFoundException(
        UsernameNotFoundException ex, 
        WebRequest request) {
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", new Date());
    body.put("status", HttpStatus.NOT_FOUND.value());
    body.put("error", "Not Found");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).substring(4));
    
    return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
}
```

---

## 🟡 Priorité MOYENNE (3h)

### 6. Optimiser les Requêtes avec JOIN FETCH (1h)

#### Problème
Hydratation manuelle des relations au lieu d'utiliser JOIN FETCH.

#### Fichier: `FormulaireMedecinRepository.java`

**Avant:**
```java
@Query("SELECT fm FROM FormulaireMedecin fm " +
        "JOIN FETCH fm.formulaire f " +
        "JOIN FETCH fm.chercheur " +
        "WHERE fm.medecin.email = :emailMedecin " +
        "AND fm.masquePourMedecin = false " +
        "ORDER BY fm.dateEnvoi DESC")
List<FormulaireMedecin> findByMedecinEmail(@Param("emailMedecin") String emailMedecin);
```

**Après:**
```java
@Query("SELECT DISTINCT fm FROM FormulaireMedecin fm " +
        "JOIN FETCH fm.formulaire f " +
        "LEFT JOIN FETCH f.etude " +
        "LEFT JOIN FETCH f.champs " +
        "JOIN FETCH fm.chercheur " +
        "WHERE fm.medecin.email = :emailMedecin " +
        "AND fm.masquePourMedecin = false " +
        "ORDER BY fm.dateEnvoi DESC")
List<FormulaireMedecin> findByMedecinEmail(@Param("emailMedecin") String emailMedecin);
```

#### Fichier: `FormulaireMedecinService.java`

**Avant:**
```java
@Transactional(readOnly = true)
public List<FormulaireMedecin> getFormulairesRecus(String emailMedecin) {
    List<FormulaireMedecin> formulairesRecus = formulaireMedecinRepository.findByMedecinEmail(emailMedecin);
    
    // Hydratation manuelle
    formulairesRecus.forEach(fm -> {
        if (fm.getFormulaire() != null) {
            if (fm.getFormulaire().getEtude() != null) {
                fm.getFormulaire().getEtude().getTitre();
            }
            if (fm.getFormulaire().getChamps() != null) {
                fm.getFormulaire().getChamps().size();
            }
        }
    });
    
    return formulairesRecus;
}
```

**Après:**
```java
@Transactional(readOnly = true)
public List<FormulaireMedecin> getFormulairesRecus(String emailMedecin) {
    // Plus besoin d'hydratation manuelle grâce au JOIN FETCH
    return formulaireMedecinRepository.findByMedecinEmail(emailMedecin);
}
```

---

### 7. Ajouter Validation des DTOs (2h)

Voir le fichier `QUICK_FIXES.md` section "Ajouter Validation des DTOs" pour les détails complets.

**Résumé:**
1. Ajouter `@NotBlank`, `@Size`, `@Email`, etc. dans tous les DTOs de requête
2. Ajouter `@Valid` dans les controllers
3. Ajouter le handler dans `GlobalExceptionHandler`

---

## 🟢 Priorité BASSE (Optionnel)

### 8. Uniformiser les Suffixes des DTOs (1h)

**Renommer:**
```java
UserDto → UserRequest
ChangePasswordDto → ChangePasswordRequest
```

**Avantages:**
- Cohérence dans le nommage
- Plus clair (Request vs Response)

**Inconvénient:**
- Beaucoup de fichiers à modifier
- Risque de casser des choses

**Recommandation:** À faire seulement si vous avez le temps.

---

### 9. Créer des Mappers Dédiés (1 jour)

**Créer:** `backend/src/main/java/com/pfe/backend/mapper/`

```java
@Component
public class FormulaireMapper {
    
    public FormulaireResponse toResponse(Formulaire formulaire) {
        // Logique de mapping
    }
    
    public Formulaire toEntity(FormulaireRequest request) {
        // Logique de mapping
    }
}
```

**Avantages:**
- Séparation de la logique de mapping
- Réutilisable
- Testable

**Inconvénient:**
- Beaucoup de code à écrire
- Peut être overkill pour un petit projet

---

## 📝 Checklist de Refactorisation

### Phase 1 - Nettoyage (30 min)
- [ ] Supprimer `FormulaireRepository.findByIdFormulaire()`
- [ ] Supprimer `FormulaireMedecinRepository.deleteByFormulaireIdFormulaire()`
- [ ] Déplacer `findMedecins()` vers `UtilisateurRepository`

### Phase 2 - Refactorisation (1h30)
- [ ] Refactoriser les méthodes de masquage
- [ ] Remplacer System.out.println par Logger
- [ ] Centraliser la gestion d'erreurs

### Phase 3 - Optimisation (3h)
- [ ] Optimiser les requêtes avec JOIN FETCH
- [ ] Ajouter validation des DTOs
- [ ] Tester toutes les fonctionnalités

### Phase 4 - Optionnel
- [ ] Uniformiser les suffixes des DTOs
- [ ] Créer des Mappers dédiés

---

## 🧪 Tests Après Refactorisation

**À tester manuellement:**
1. ✅ Création de formulaire
2. ✅ Modification de formulaire
3. ✅ Suppression de formulaire
4. ✅ Envoi de formulaire à un médecin
5. ✅ Remplissage de formulaire par un médecin
6. ✅ Masquage de formulaire (médecin et chercheur)
7. ✅ Récupération des formulaires reçus
8. ✅ Récupération des formulaires envoyés
9. ✅ Mise à jour du profil
10. ✅ Changement de mot de passe

**Commandes:**
```bash
# Compiler
./mvnw clean compile

# Tester
./mvnw test

# Lancer l'application
./mvnw spring-boot:run
```

---

## 🎯 Résultat Attendu

**Avant refactorisation:**
- Architecture: 92/100
- Code dupliqué: ~200 lignes
- Méthodes inutilisées: 2
- System.out.println: 4

**Après refactorisation:**
- Architecture: 96/100 ✅
- Code dupliqué: ~50 lignes ✅
- Méthodes inutilisées: 0 ✅
- System.out.println: 0 ✅

**Temps total:** 5-6 heures  
**Difficulté:** Moyenne  
**Risque:** Faible (si tests manuels effectués)

---

*Guide créé en Novembre 2024*
