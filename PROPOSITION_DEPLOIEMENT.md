# Dossier de Stratégie et d'Architecture de Déploiement
**Projet :** Plateforme de Collecte de Données de Santé  
**Client :** Centre Hospitalier Universitaire (CHU) d'Angers  
**Date :** 8 Janvier 2026  
**Version :** 2.0 (Technique Détaillée)

---

## 1. Synthèse Managériale (Executive Summary)

Ce document a pour but de définir l'architecture technique cible pour le déploiement de la plateforme de collecte de données de santé. Il répond aux exigences de sécurité **HDS (Hébergement de Données de Santé)** et aux contraintes opérationnelles du CHU.

Trois scénarios ont été étudiés. Sur la base des critères de sécurité, de maintenabilité et de coût, **nous recommandons fermement le Scénario 2 (Hébergement On-Premise Virtualisé)**, qui offre le meilleur compromis entre souveraineté des données et intégration au Système d'Information Hospitalier (SIH).

---

## 2. Analyse Stratégique des Scénarios

### Scénario 1 : Déploiement "Lourd" sur Postes Clients
*Installation de l'application complète sur chaque ordinateur physique.*
*   **Verdict :** ⛔ **NON RETENU**.
*   **Raison :** Impossible de garantir la sécurité des données éparpillées (vols de PC, absence de chiffrement centralisé). Maintenance irréaliste (mise à jour sur 500+ postes). Incompatible avec le travail collaboratif.

### Scénario 3 : Hébergement Cloud Public HDS
*Externalisation chez un hébergeur certifié (ex: AWS Health, OVH HDS).*
*   **Verdict :** ⚠️ **ALTERNATIVE POSSIBLE**.
*   **Raison :** Pertinent si la DSI souhaite externaliser la gestion matérielle. Cependant, cela introduit une complexité contractuelle (sous-traitance données de santé) et une dépendance critique au lien Internet du CHU. Coûts récurrents (OpEx) élevés.

### Scénario 2 : Hébergement On-Premise (RECOMMANDÉ)
*Centralisation sur l'infrastructure virtuelle existante du CHU.*
*   **Verdict :** ✅ **CIBLE PRIVILEXIÉE**.
*   **Raison :**
    *   **Sécurité :** Les données ne sortent pas du réseau du CHU.
    *   **Intégration :** Accès natif aux annuaires (LDAP) et dossiers patients (HL7/FHIR).
    *   **Coût :** Utilisation des ressources déjà amorties (VMware/Hyper-V).

---

## 3. Dossier d'Architecture Technique (DAT) - Scénario On-Premise

Cette section détaille l'architecture technique cible pour le scénario retenu.

### 3.1 Architecture Applicative et Conteneurisation
L'application repose sur une architecture micro-services conteneurisée via **Docker**, garantissant l'isolation et la portabilité.

| Service | Technologie | Image Docker Base | Port Interne | Rôle |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 15 | `node:18-alpine` | 3000 | Interface Utilisateur SPA |
| **Backend** | Spring Boot 3 | `eclipse-temurin:17-jre-alpine` | 8080 | API REST, Logique Métier |
| **Database** | PostgreSQL 15 | `postgres:15-alpine` | 5432 | Persistance des données (Chiffrée) |

### 3.2 Architecture Réseau et Sécurité
Le déploiement se fait sur une Machine Virtuelle (VM) Linux unique, segmentée par un **Reverse Proxy**.

*   **OS Serveur :** Linux Debian 12 (Bookworm) ou Red Hat Enterprise Linux 9.
*   **Reverse Proxy :** Nginx (Gateway unique d'entrée).
*   **Sécurité :**
    *   Seul le port 443 (HTTPS) est exposé aux utilisateurs.
    *   La base de données n'est **jamais** exposée sur le réseau (limitée à `localhost` via Docker Network).
    *   Communication inter-conteneurs via un réseau privé Docker (`bridge`).

### 3.3 Matrice de Flux Réseau (Firewalling)
La DSI doit ouvrir les flux suivants sur les pare-feux internes :

| Source | Destination | Protocole | Port | Description | Criticitè |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **LAN Médecins** | Serveur App | TCP | 443 | Accès HTTPS Utilisateurs | Critique |
| **LAN Admin** | Serveur App | TCP | 22 | Accès SSH (Administration) | Haute |
| **Serveur App** | NTP Interne | UDP | 123 | Synchronisation Temps | Moyenne |
| **Serveur App** | DNS Interne | UDP | 53 | Résolution de noms | Critique |
| **Serveur App** | SMTP CHU | TCP | 25/587 | Envoi Emails Notifications | Moyenne |
| **Serveur App** | Docker Hub | TCP | 443 | Pull Images (si accès internet) | Install |

### 3.4 Dimensionnement Ressources (Sizing)

| Ressource | Recommandé | Minimum Vital | Justification |
| :--- | :--- | :--- | :--- |
| **vCPU** | 4 vCores | 2 vCores | Traitement des exports CSV et chiffr. Java |
| **RAM** | 16 Go | 8 Go | JVM Heap (4Go) + PG Shared Buffers |
| **Disque** | 100 Go SSD | 50 Go | OS (20Go) + Data (50Go) + Logs/Backups |

---

## 4. Manuel d'Installation et d'Exploitation (MIE)

Cette section fournit les procédures techniques pour les administrateurs système du CHU.

### 4.1 Prérequis Système
Sur la VM Linux fraîchement installée :
```bash
# 1. Mise à jour système
sudo apt-get update && sudo apt-get upgrade -y

# 2. Installation Docker & Docker Compose
sudo apt-get install -y docker.io docker-compose-plugin curl gnupg2

# 3. Création utilisateur dédié (sécurité)
sudo useradd -m -s /bin/bash sante_admin
sudo usermod -aG docker sante_admin
```

### 4.2 Installation de l'Application

**1. Arborescence des Fichiers**
Créer le dossier `/opt/plateforme-sante/` et y copier les fichiers fournis :
*   `docker-compose.yml`
*   `.env` (Variables d'environnement : Mots de passe BDD, Clés JWT)
*   `nginx/nginx.conf`
*   `init.sql`

**2. Configuration Nginx (Reverse Proxy)**
Fichier `/opt/plateforme-sante/nginx/nginx.conf` :
```nginx
events {}
http {
    server {
        listen 443 ssl http2;
        server_name plateforme-sante.chu-angers.fr;

        ssl_certificate /etc/ssl/certs/chu-cert.pem;
        ssl_certificate_key /etc/ssl/private/chu-key.pem;

        # Frontend
        location / {
            proxy_pass http://frontend:3000;
            proxy_set_header Host $host;
        }

        # Backend API
        location /api {
            proxy_pass http://backend:8080;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

**3. Démarrage du Service**
```bash
cd /opt/plateforme-sante/
# Démarrage en mode détaché
docker compose up -d

# Vérification des logs
docker compose logs -f
```

### 4.3 Plan de Sauvegarde (Backup Policy)

Les données de santé doivent être sauvegardées quotidiennement.

**Script de Sauvegarde Automatisé (`/usr/local/bin/backup-sante.sh`) :**
```bash
#!/bin/bash
BACKUP_DIR="/mnt/nas_sauvegardes/sante"
DATE=$(date +%Y%m%d_%H%M)
FILENAME="backup_sante_$DATE.sql.gz"

# 1. Dump de la base PostgreSQL (via conteneur)
docker exec sante-db pg_dumpall -U postgres | gzip > "$BACKUP_DIR/$FILENAME"

# 2. Rétention : Supprimer les backups de plus de 30 jours
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

# 3. Log
echo "Sauvegarde $FILENAME effectuée le $DATE" >> /var/log/backup-sante.log
```
*Ajouter ce script dans la crontab root : `0 2 * * * /usr/local/bin/backup-sante.sh` (Tous les jours à 2h00).*

### 4.4 Plan de Reprise d'Activité (PRA / Rollback)

**En cas de crash majeur ou corruption de données :**
1.  **Arrêt du service :** `docker compose down`
2.  **Restauration BDD :**
    *   Relancer la base vide : `docker compose up -d database`
    *   Restaurer le dump : `zcat backup_sante_LAST.sql.gz | docker exec -i sante-db psql -U postgres`
3.  **Relance complète :** `docker compose up -d`

**En cas de bug applicatif (Rollback Version) :**
Modifier le `docker-compose.yml` pour pointer vers le tag précédent de l'image (ex: `image: backend:v1.0.1` -> `v1.0.0`) et relancer `docker compose up -d`.

---

## 5. Annexes
*   Fichiers de configuration types (`docker-compose.yml`).
*   Liste des codes erreurs API.
*   Guide de dépannage rapide (Troubleshooting).
