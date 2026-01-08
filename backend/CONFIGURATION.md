# ⚙️ Configuration du Backend

## 🔐 Variables d'Environnement

Le backend utilise des variables d'environnement pour les secrets et la configuration.

### Configuration Locale (Développement)

1. **Copier le fichier d'exemple**:
```bash
cp .env.example .env
```

2. **Modifier `.env` avec vos valeurs**:
```bash
# Database Configuration
DB_PASSWORD=votre_mot_de_passe_postgres

# JWT Configuration
JWT_SECRET_KEY=$(openssl rand -base64 64)

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

3. **Le fichier `.env` est ignoré par Git** (ne sera jamais commité)

### Configuration Production

**Option 1: Variables d'environnement système**
```bash
export DB_PASSWORD=your_secure_password
export JWT_SECRET_KEY=your_random_jwt_key
export CORS_ALLOWED_ORIGINS=https://votre-domaine.com
```

**Option 2: Fichier .env en production**
```bash
# Créer .env sur le serveur
DB_PASSWORD=production_password
JWT_SECRET_KEY=production_jwt_key
CORS_ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com
```

### Générer une Clé JWT Sécurisée

```bash
# Linux/Mac
openssl rand -base64 64

# Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🚀 Lancer l'Application

### Développement
```bash
# Avec Maven
./mvnw spring-boot:run

# Avec Java
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Production
```bash
# Définir les variables d'environnement
export DB_PASSWORD=...
export JWT_SECRET_KEY=...
export CORS_ALLOWED_ORIGINS=...

# Lancer l'application
java -jar backend.jar
```

---

## 📝 Configuration Disponible

| Variable | Description | Défaut | Requis |
|----------|-------------|--------|--------|
| `DB_PASSWORD` | Mot de passe PostgreSQL | - | ✅ Oui |
| `JWT_SECRET_KEY` | Clé secrète JWT (256 bits min) | - | ✅ Oui |
| `CORS_ALLOWED_ORIGINS` | Origins autorisées (séparées par virgule) | `http://localhost:3000` | ⚠️ Recommandé |

---

## ⚠️ Sécurité

### ❌ NE JAMAIS
- Commiter le fichier `.env`
- Partager vos secrets
- Utiliser les mêmes secrets en dev et prod
- Utiliser des secrets faibles

### ✅ TOUJOURS
- Utiliser des variables d'environnement
- Générer des clés aléatoires fortes
- Changer les secrets régulièrement
- Utiliser des secrets différents par environnement

---

*Configuration mise à jour - Novembre 2024*
