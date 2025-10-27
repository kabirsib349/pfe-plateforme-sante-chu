-- ===============================
-- Création de la base
-- ===============================
CREATE DATABASE meddatacollect;
\c meddatacollect;

-- ===============================
-- Table Role
-- ===============================
CREATE TABLE Role (
    id_role SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE
);

-- ===============================
-- Table Utilisateur
-- ===============================
CREATE TABLE Utilisateur (
    id_utilisateur SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP,
    id_role INT REFERENCES Role(id_role) ON DELETE SET NULL
);

-- ===============================
-- Table Etude
-- ===============================
CREATE TABLE Etude (
    id_etude SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    domaine VARCHAR(100),
    date_debut DATE,
    date_fin DATE,
    statut VARCHAR(20) CHECK (statut IN ('planifiée', 'en_cours', 'terminée', 'archivée')),
    id_utilisateur INT REFERENCES Utilisateur(id_utilisateur) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- Table Formulaire
-- ===============================
CREATE TABLE Formulaire (
    id_formulaire SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP,
    statut VARCHAR(20) CHECK (statut IN ('brouillon', 'publié', 'archivé')),
    id_chercheur INT REFERENCES Utilisateur(id_utilisateur) ON DELETE SET NULL,
    id_etude INT REFERENCES Etude(id_etude) ON DELETE CASCADE
);

-- ===============================
-- Table Champ
-- ===============================
CREATE TABLE Champ (
    id_champ SERIAL PRIMARY KEY,
    id_formulaire INT REFERENCES Formulaire(id_formulaire) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(30) CHECK (type IN ('texte', 'nombre', 'choix_multiple', 'date')),
    obligatoire BOOLEAN DEFAULT FALSE,
    valeur_min FLOAT,
    valeur_max FLOAT,
    id_liste_valeur INT NULL
);

-- ===============================
-- Table ListeValeur
-- ===============================
CREATE TABLE ListeValeur (
    id_liste_valeur SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT
);

-- ===============================
-- Table OptionValeur
-- ===============================
CREATE TABLE OptionValeur (
    id_option_valeur SERIAL PRIMARY KEY,
    id_liste_valeur INT REFERENCES ListeValeur(id_liste_valeur) ON DELETE CASCADE,
    valeur VARCHAR(100),
    libelle VARCHAR(255)
);

-- ===============================
-- Table Reponse
-- ===============================
CREATE TABLE Reponse (
    id_reponse SERIAL PRIMARY KEY,
    id_soumission INT,
    id_champ INT REFERENCES Champ(id_champ) ON DELETE CASCADE,
    id_utilisateur INT REFERENCES Utilisateur(id_utilisateur) ON DELETE SET NULL,
    valeur TEXT
);

-- ===============================
-- Table Message
-- ===============================
CREATE TABLE Message (
    id_message SERIAL PRIMARY KEY,
    id_expediteur INT REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE,
    id_destinataire INT REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lu BOOLEAN DEFAULT FALSE
);

-- ===============================
-- Table Sauvegarde
-- ===============================
CREATE TABLE Sauvegarde (
    id_sauvegarde SERIAL PRIMARY KEY,
    id_utilisateur INT REFERENCES Utilisateur(id_utilisateur) ON DELETE SET NULL,
    date_sauvegarde TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chemin VARCHAR(255),
    taille FLOAT,
    statut VARCHAR(20) CHECK (statut IN ('succès', 'échec'))
);

-- ===============================
-- Table Log
-- ===============================
CREATE TABLE Log (
    id_log SERIAL PRIMARY KEY,
    id_utilisateur INT REFERENCES Utilisateur(id_utilisateur) ON DELETE SET NULL,
    action VARCHAR(255),
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45),
    succes BOOLEAN
);

-- ===============================
-- Contraintes supplémentaires
-- ===============================
ALTER TABLE Champ
    ADD CONSTRAINT fk_liste_valeur FOREIGN KEY (id_liste_valeur)
    REFERENCES ListeValeur(id_liste_valeur) ON DELETE SET NULL;
