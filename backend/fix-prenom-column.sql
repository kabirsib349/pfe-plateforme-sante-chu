-- Script pour supprimer la colonne prenom de la table utilisateur
-- À exécuter dans PostgreSQL

-- Se connecter à la base de données
-- \c meddatacollect

-- Supprimer la colonne prenom si elle existe
ALTER TABLE utilisateur DROP COLUMN IF EXISTS prenom;

-- Vérifier la structure de la table
\d utilisateur
