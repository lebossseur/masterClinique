-- Script pour ajouter les champs first_name et last_name à la table doctors
-- Cela permet de créer des médecins sans les lier obligatoirement à un utilisateur

ALTER TABLE doctors
ADD COLUMN first_name VARCHAR(100) AFTER user_id,
ADD COLUMN last_name VARCHAR(100) AFTER first_name;

-- Mise à jour des enregistrements existants:
-- Copier les noms depuis les utilisateurs liés si user_id existe
UPDATE doctors d
INNER JOIN users u ON d.user_id = u.id
SET d.first_name = u.first_name,
    d.last_name = u.last_name
WHERE d.user_id IS NOT NULL;
