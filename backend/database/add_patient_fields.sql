-- Script pour ajouter de nouveaux champs à la table patients
USE master_clinique;

-- Ajouter le champ numero_piece_identite
ALTER TABLE patients
ADD COLUMN numero_piece_identite VARCHAR(100) AFTER emergency_phone;

-- Ajouter le champ type_piece_identite
ALTER TABLE patients
ADD COLUMN type_piece_identite ENUM('CNI', 'PASSPORT', 'PERMIS_CONDUIRE', 'AUTRE') AFTER numero_piece_identite;

-- Ajouter le champ profession
ALTER TABLE patients
ADD COLUMN profession VARCHAR(100) AFTER type_piece_identite;

-- Ajouter le champ nationalite
ALTER TABLE patients
ADD COLUMN nationalite VARCHAR(100) AFTER profession;

-- Ajouter le champ lieu_naissance
ALTER TABLE patients
ADD COLUMN lieu_naissance VARCHAR(150) AFTER nationalite;

-- Ajouter le champ situation_matrimoniale
ALTER TABLE patients
ADD COLUMN situation_matrimoniale ENUM('CELIBATAIRE', 'MARIE(E)', 'DIVORCE(E)', 'VEUF(VE)', 'AUTRE') AFTER lieu_naissance;

SELECT 'Colonnes ajoutées avec succès!' AS message;
