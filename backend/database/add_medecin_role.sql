-- Script pour ajouter le rôle MEDECIN
USE master_clinique;

-- Ajouter le rôle MEDECIN s'il n'existe pas déjà
INSERT INTO roles (name, description)
SELECT 'MEDECIN', 'Personnel médical / Médecins'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'MEDECIN');

-- Afficher tous les rôles
SELECT * FROM roles ORDER BY id;
