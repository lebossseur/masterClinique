-- Script pour ajouter un statut aux consultations médicales
USE master_clinique;

-- Ajouter la colonne status à la table medical_consultations
ALTER TABLE medical_consultations
ADD COLUMN status ENUM('EN_ATTENTE', 'EN_COURS', 'TERMINEE') DEFAULT 'EN_ATTENTE' AFTER consultation_date;

-- Afficher la structure mise à jour
DESCRIBE medical_consultations;
