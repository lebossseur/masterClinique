-- Script pour créer des utilisateurs de démonstration
-- Mot de passe par défaut pour tous : password123
-- ⚠️ ATTENTION : Changez ces mots de passe en production !

USE master_clinique;

-- Le hash bcrypt ci-dessous correspond au mot de passe "password123"
SET @password_hash = '$2a$10$v1ASbEY3icUbZzmOgR/T5OV1R.077DWLU.o9DJa.fYgPujID1QvpO';

-- Créer des utilisateurs pour chaque rôle
INSERT INTO users (username, email, password, first_name, last_name, role_id, is_active) VALUES
-- Administrateurs
('admin', 'admin@masterclinique.com', @password_hash, 'Admin', 'Système', 
  (SELECT id FROM roles WHERE name = 'ADMIN'), true),
('supervisor', 'supervisor@masterclinique.com', @password_hash, 'Jean', 'Superviseur', 
  (SELECT id FROM roles WHERE name = 'SUPERVISOR'), true),

-- Personnel d'accueil
('accueil1', 'accueil1@masterclinique.com', @password_hash, 'Marie', 'Accueil', 
  (SELECT id FROM roles WHERE name = 'ACCUEIL'), true),
('accueil2', 'accueil2@masterclinique.com', @password_hash, 'Sophie', 'Réception', 
  (SELECT id FROM roles WHERE name = 'ACCUEIL'), true),

-- Personnel de caisse
('caisse1', 'caisse1@masterclinique.com', @password_hash, 'Pierre', 'Caisse', 
  (SELECT id FROM roles WHERE name = 'CAISSE'), true),
('caisse2', 'caisse2@masterclinique.com', @password_hash, 'Aminata', 'Comptabilité', 
  (SELECT id FROM roles WHERE name = 'CAISSE'), true),

-- Personnel assurance
('assurance1', 'assurance1@masterclinique.com', @password_hash, 'Jacques', 'Assurance', 
  (SELECT id FROM roles WHERE name = 'ASSURANCE'), true),

-- Personnel pharmacie
('pharmacie1', 'pharmacie1@masterclinique.com', @password_hash, 'Fatou', 'Pharmacie', 
  (SELECT id FROM roles WHERE name = 'PHARMACIE'), true),
('pharmacie2', 'pharmacie2@masterclinique.com', @password_hash, 'Ibrahim', 'Pharmacien', 
  (SELECT id FROM roles WHERE name = 'PHARMACIE'), true);

-- Afficher les utilisateurs créés
SELECT 
  u.id, 
  u.username, 
  u.email, 
  CONCAT(u.first_name, ' ', u.last_name) as nom_complet,
  r.name as role, 
  CASE WHEN u.is_active = 1 THEN 'Actif' ELSE 'Inactif' END as statut
FROM users u 
JOIN roles r ON u.role_id = r.id
ORDER BY r.name, u.username;

-- Résumé
SELECT 
  r.name as Role,
  COUNT(u.id) as Nombre_utilisateurs
FROM roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.id, r.name
ORDER BY r.name;
