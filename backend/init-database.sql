-- Script d'initialisation de la base de données MedDataCollect
-- À exécuter manuellement dans PostgreSQL

-- 1. Créer la base de données si elle n'existe pas
-- CREATE DATABASE meddatacollect;

-- 2. Se connecter à la base de données
-- \c meddatacollect

-- 3. Insérer les rôles
INSERT INTO role (nom) VALUES ('medecin') ON CONFLICT (nom) DO NOTHING;
INSERT INTO role (nom) VALUES ('chercheur') ON CONFLICT (nom) DO NOTHING;

-- 4. Insérer des utilisateurs de test
-- Mot de passe pour tous : Test123456!@ (respecte les critères ANSI : 12+ caractères, majuscule, minuscule, chiffre, caractère spécial)
-- Hash BCrypt de "Test123456!@" : $2a$10$8zK5YqW9yH3xN2mL4pR6vOZGxJ7tQ1wE5sA9cF8dB6hK3nM2lP0uS

-- Utilisateur chercheur
INSERT INTO utilisateur (nom, email, mot_de_passe, date_creation, id_role)
SELECT 'Dr. Étude', 'etude@chu.fr', '$2a$10$8zK5YqW9yH3xN2mL4pR6vOZGxJ7tQ1wE5sA9cF8dB6hK3nM2lP0uS', CURRENT_TIMESTAMP, r.id_role
FROM role r WHERE r.nom = 'chercheur'
ON CONFLICT (email) DO UPDATE SET mot_de_passe = EXCLUDED.mot_de_passe;

-- Utilisateur médecin
INSERT INTO utilisateur (nom, email, mot_de_passe, date_creation, id_role)
SELECT 'Dr. Admin', 'admin@chu.fr', '$2a$10$8zK5YqW9yH3xN2mL4pR6vOZGxJ7tQ1wE5sA9cF8dB6hK3nM2lP0uS', CURRENT_TIMESTAMP, r.id_role
FROM role r WHERE r.nom = 'medecin'
ON CONFLICT (email) DO UPDATE SET mot_de_passe = EXCLUDED.mot_de_passe;

-- 5. Vérifier les données
SELECT u.id_utilisateur, u.nom, u.email, r.nom as role 
FROM utilisateur u 
JOIN role r ON u.id_role = r.id_role;
