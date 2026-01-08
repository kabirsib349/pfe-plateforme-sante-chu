-- Migration: Ajouter le champ patient_identifier à la table reponse_formulaire
-- Date: 2024-11-15
-- Description: Permet au médecin de remplir le même formulaire pour plusieurs patients

-- Ajouter la colonne patient_identifier
ALTER TABLE reponse_formulaire 
ADD COLUMN patient_identifier VARCHAR(255);

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX idx_reponse_patient ON reponse_formulaire(id_formulaire_medecin, patient_identifier);

-- Ajouter une contrainte d'unicité pour éviter les doublons de réponses pour un même patient/champ
-- (Un patient ne peut avoir qu'une seule réponse par champ)
ALTER TABLE reponse_formulaire 
ADD CONSTRAINT unique_patient_champ 
UNIQUE (id_formulaire_medecin, patient_identifier, id_champ);

-- Note: Les données existantes auront patient_identifier = NULL
-- Elles seront considérées comme des réponses "legacy" sans patient associé
