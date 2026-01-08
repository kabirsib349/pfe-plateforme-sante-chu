# 🔐 Documentation du Chiffrement des Données

## Vue d'ensemble

Ce projet implémente un **chiffrement au repos** (encryption at rest) pour protéger les données sensibles stockées en base de données PostgreSQL.

---

## 🛡️ Algorithme utilisé

**AES-256-GCM** (Advanced Encryption Standard, mode Galois/Counter Mode)

### Pourquoi AES-256-GCM ?

- ✅ **Sécurité maximale** : AES-256 est le standard de chiffrement le plus sûr
- ✅ **Authentification intégrée** : GCM fournit l'authentification des données (détecte les modifications)
- ✅ **Performance** : Optimisé matériellement sur les processeurs modernes
- ✅ **Recommandé par le NIST** : Standard approuvé pour les données gouvernementales

### Caractéristiques techniques

- **Taille de clé** : 256 bits (32 bytes)
- **Vecteur d'initialisation (IV)** : 96 bits (12 bytes), généré aléatoirement pour chaque chiffrement
- **Tag d'authentification** : 128 bits
- **Mode** : GCM (Galois/Counter Mode)

---

## 📊 Données chiffrées

### Champs chiffrés automatiquement

| Table | Colonne | Raison |
|-------|---------|--------|
| `utilisateur` | `nom` | Données personnelles (RGPD) |
| `reponse_formulaire` | `valeur` | Données médicales sensibles |
| `reponse_formulaire` | `patient_identifier` | Identifiant patient (pseudonymisation) |

### Champs NON chiffrés

| Table | Colonne | Raison |
|-------|---------|--------|
| `utilisateur` | `email` | Nécessaire pour la connexion et les recherches |
| `utilisateur` | `mot_de_passe` | Déjà hashé avec BCrypt (irréversible) |
| `reponse_formulaire` | `patient_identifier_hash` | Hash SHA-256 pour les recherches |

---

## 🔧 Implémentation technique

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Spring Boot                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         StringCryptoConverter (JPA)                   │  │
│  │  - Chiffrement automatique avant INSERT/UPDATE       │  │
│  │  - Déchiffrement automatique après SELECT            │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AES-256-GCM Cipher                       │  │
│  │  - IV aléatoire pour chaque opération                │  │
│  │  - Thread-safe (nouveau Cipher par opération)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Base64 Encoding/Decoding                    │  │
│  │  - Stockage en TEXT dans PostgreSQL                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  - Données chiffrées stockées en Base64                     │
│  - Impossible de lire sans la clé de chiffrement            │
└─────────────────────────────────────────────────────────────┘
```

### Utilisation dans les entités

```java
@Entity
public class ReponseFormulaire {
    
    // Champ chiffré automatiquement
    @Convert(converter = StringCryptoConverter.class)
    @Column(name = "valeur", columnDefinition = "TEXT")
    private String valeur;
    
    // Champ chiffré + hash pour recherche
    @Convert(converter = StringCryptoConverter.class)
    @Column(name = "patient_identifier")
    private String patientIdentifier;
    
    @Column(name = "patient_identifier_hash")
    private String patientIdentifierHash; // SHA-256 hash
}
```

---

## 🔑 Gestion des clés

### Configuration

La clé de chiffrement est configurée dans `application.properties` :

```properties
app.encryption.key=${ENCRYPTION_KEY:MySecureEncryptionKey123456789}
```

### ⚠️ IMPORTANT : Sécurité de la clé

**EN DÉVELOPPEMENT :**
- Clé par défaut dans `application.properties` (acceptable)

**EN PRODUCTION :**
1. **JAMAIS** commiter la clé dans Git
2. Utiliser une **variable d'environnement** :
   ```bash
   export ENCRYPTION_KEY="VotreCleSuperSecrete123456789012"
   ```
3. Ou utiliser un **gestionnaire de secrets** :
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Google Cloud Secret Manager

### Génération d'une clé sécurisée

```bash
# Méthode 1 : OpenSSL
openssl rand -base64 32 | cut -c1-32

# Méthode 2 : Python
python -c "import secrets; print(secrets.token_urlsafe(24)[:32])"

# Méthode 3 : PowerShell (Windows)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Rotation des clés

**⚠️ ATTENTION** : Changer la clé de chiffrement rendra **toutes les données existantes illisibles** !

**Procédure de rotation :**
1. Créer une nouvelle clé
2. Déchiffrer toutes les données avec l'ancienne clé
3. Re-chiffrer avec la nouvelle clé
4. Mettre à jour la configuration
5. Archiver l'ancienne clé (conservée 1 an pour les backups)

---

## 🔍 Recherche sur données chiffrées

### Problème

Les données chiffrées ne peuvent pas être recherchées directement car :
- Chaque chiffrement produit un résultat différent (IV aléatoire)
- Impossible de faire des requêtes SQL `WHERE valeur = 'texte'`

### Solution : Hash pour recherche

Pour les identifiants patients, nous utilisons un **double système** :

1. **Champ chiffré** (`patient_identifier`) : Valeur réelle, chiffrée
2. **Champ hash** (`patient_identifier_hash`) : Hash SHA-256 pour recherche

```java
// Recherche par hash
String hash = hashPatientIdentifier("P-2024-001");
List<ReponseFormulaire> reponses = repository.findByPatientIdentifierHash(hash);

// Les identifiants sont déchiffrés automatiquement par JPA
String identifiant = reponses.get(0).getPatientIdentifier(); // "P-2024-001"
```

---

## 🧪 Tests

### Vérifier que le chiffrement fonctionne

1. **Insérer une donnée** :
   ```java
   ReponseFormulaire reponse = new ReponseFormulaire();
   reponse.setValeur("Diabète de type 2");
   repository.save(reponse);
   ```

2. **Vérifier en base de données** :
   ```sql
   SELECT valeur FROM reponse_formulaire WHERE id_reponse = 1;
   -- Résultat : "kJ8x3mP9... (texte chiffré en Base64)"
   ```

3. **Récupérer via JPA** :
   ```java
   ReponseFormulaire reponse = repository.findById(1L).get();
   System.out.println(reponse.getValeur()); // "Diabète de type 2" (déchiffré)
   ```

### Tests unitaires

```java
@Test
public void testChiffrementDechiffrement() {
    StringCryptoConverter converter = new StringCryptoConverter();
    converter.init();
    
    String original = "Données sensibles";
    String chiffre = converter.convertToDatabaseColumn(original);
    String dechiffre = converter.convertToEntityAttribute(chiffre);
    
    assertNotEquals(original, chiffre); // Vérifie que c'est chiffré
    assertEquals(original, dechiffre);   // Vérifie que le déchiffrement fonctionne
}
```

---

## 📋 Conformité RGPD

### Article 32 : Sécurité du traitement

✅ **Chiffrement des données à caractère personnel**
- Données médicales chiffrées (valeurs de réponses)
- Identifiants patients pseudonymisés et chiffrés
- Noms d'utilisateurs chiffrés

✅ **Capacité à garantir la confidentialité**
- Clé de chiffrement séparée de la base de données
- Accès aux données chiffrées impossible sans la clé

✅ **Capacité à restaurer la disponibilité**
- Backups chiffrés
- Procédure de rotation des clés documentée

---

## ⚠️ Limitations connues

1. **Performance** : Le chiffrement/déchiffrement ajoute une latence (~1-2ms par opération)
2. **Recherche limitée** : Impossible de faire des recherches LIKE sur données chiffrées
3. **Tri impossible** : Les données chiffrées ne peuvent pas être triées
4. **Taille augmentée** : Les données chiffrées prennent ~33% plus d'espace (Base64)

---

## 🚀 Améliorations futures

1. **Chiffrement au niveau PostgreSQL** : Extension `pgcrypto` pour chiffrement transparent
2. **Key Management Service (KMS)** : Intégration avec AWS KMS ou HashiCorp Vault
3. **Audit logging** : Journalisation des accès aux données chiffrées
4. **Chiffrement des backups** : `pg_dump` avec chiffrement GPG

---

## 📚 Références

- [NIST SP 800-38D](https://csrc.nist.gov/publications/detail/sp/800-38d/final) : Recommandations pour GCM
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [RGPD Article 32](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre4#Article32) : Sécurité du traitement

---

**Dernière mise à jour** : Décembre 2024
