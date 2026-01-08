-- Script pour vérifier et corriger la structure de la table message

-- Vérifier la structure actuelle
\d message

-- Si les colonnes ont les mauvais noms, les renommer :
-- ALTER TABLE message RENAME COLUMN id_expediteur TO expediteur_id;
-- ALTER TABLE message RENAME COLUMN id_destinataire TO destinataire_id;
