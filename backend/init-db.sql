-- Script d'initialisation de la base de données MedDataCollect
-- À exécuter après la création de la base de données

-- Insertion des rôles
INSERT INTO role (nom) VALUES ('medecin') ON CONFLICT (nom) DO NOTHING;
INSERT INTO role (nom) VALUES ('chercheur') ON CONFLICT (nom) DO NOTHING;

-- Insertion des utilisateurs de test
-- Mot de passe pour tous : test123 (encodé avec BCrypt)
-- Hash BCrypt de "test123" : $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO utilisateur (nom, email, mot_de_passe, date_creation, id_role)
SELECT 'Dr. Étude', 'etude@chu.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', CURRENT_TIMESTAMP, r.id_role
FROM role r WHERE r.nom = 'chercheur'
ON CONFLICT (email) DO NOTHING;

INSERT INTO utilisateur (nom, email, mot_de_passe, date_creation, id_role)
SELECT 'Dr. Admin', 'admin@chu.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', CURRENT_TIMESTAMP, r.id_role
FROM role r WHERE r.nom = 'medecin'
ON CONFLICT (email) DO NOTHING;

-- Vérification
SELECT u.nom, u.email, r.nom as role 
FROM utilisateur u 
JOIN role r ON u.id_role = r.id_role;
