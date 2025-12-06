# Migration: Ajout du champ Médecin aux Rendez-vous

## Modifications apportées

### 1. Base de données
- Ajout de la colonne `doctor_id` à la table `appointments`
- Le champ `reason` (motif) est maintenant obligatoire (NOT NULL)
- Ajout d'une clé étrangère vers la table `users` pour le médecin

### 2. Backend
- Mise à jour du contrôleur `appointment.controller.js`:
  - Ajout de `doctor_id` dans la création de rendez-vous
  - Ajout de `doctor_id` dans la modification de rendez-vous
  - Validation obligatoire pour `doctor_id` et `reason`
  - Récupération du nom du médecin dans les requêtes

### 3. Frontend
- Mise à jour de `Appointments.js`:
  - Ajout d'un champ de sélection "Médecin à voir" (obligatoire)
  - Affichage du médecin dans le tableau des rendez-vous
  - Chargement de la liste des médecins depuis les utilisateurs
  - Le motif est maintenant obligatoire dans le formulaire

## Instructions pour appliquer la migration

### Étape 1: Exécuter le script SQL

**Option A: Via phpMyAdmin**
1. Ouvrez phpMyAdmin dans votre navigateur
2. Sélectionnez la base de données `master_clinique`
3. Cliquez sur l'onglet "SQL"
4. Copiez et collez le contenu du fichier `backend/database/add_doctor_to_appointments.sql`
5. Cliquez sur "Exécuter"

**Option B: Via la ligne de commande MySQL**
```bash
mysql -u root -p master_clinique < backend/database/add_doctor_to_appointments.sql
```

### Étape 2: Vérifier la migration

Vérifiez que la colonne a été ajoutée:
```sql
DESCRIBE appointments;
```

Vous devriez voir:
- `doctor_id` INT UNSIGNED (après patient_id)
- `reason` VARCHAR(255) NOT NULL

### Étape 3: Redémarrer le serveur backend

Les serveurs devraient déjà être en mode développement et se recharger automatiquement.

Si ce n'est pas le cas:
```bash
cd backend
npm run dev
```

### Étape 4: Tester l'application

1. Allez dans **Rendez-vous**
2. Cliquez sur **Nouveau Rendez-vous**
3. Vérifiez que vous voyez:
   - Patient * (obligatoire)
   - Médecin à voir * (obligatoire)
   - Date * (obligatoire)
   - Heure * (obligatoire)
   - Motif * (obligatoire)
   - Notes (facultatif)
   - Envoyer un SMS (case à cocher)

4. Essayez de créer un rendez-vous sans remplir tous les champs obligatoires
   - Le formulaire devrait vous empêcher de soumettre

5. Créez un rendez-vous complet
   - Le rendez-vous devrait s'afficher avec le nom du médecin

## Migration des données existantes (si nécessaire)

Si vous avez déjà des rendez-vous dans la base de données sans médecin assigné:

```sql
-- Voir les rendez-vous sans médecin
SELECT * FROM appointments WHERE doctor_id IS NULL;

-- Assigner un médecin par défaut (remplacez 1 par l'ID d'un médecin valide)
UPDATE appointments
SET doctor_id = 1
WHERE doctor_id IS NULL;

-- Ou assigner des médecins de manière aléatoire
UPDATE appointments
SET doctor_id = (SELECT id FROM users WHERE role_name IN ('DOCTOR', 'ADMIN') ORDER BY RAND() LIMIT 1)
WHERE doctor_id IS NULL;
```

## En cas de problème

### Erreur: "Column 'doctor_id' cannot be null"
- Assurez-vous que vous sélectionnez un médecin dans le formulaire
- Vérifiez que la liste des médecins est bien chargée
- Vérifiez la console JavaScript pour les erreurs

### Erreur: "Column 'reason' cannot be null"
- Remplissez le champ "Motif" (maintenant obligatoire)

### La liste des médecins est vide
- Vérifiez que vous avez des utilisateurs avec le rôle DOCTOR, MEDECIN ou ADMIN dans la base de données
- Vérifiez la console pour les erreurs lors du chargement des données

### Migration SQL échoue
Si la migration échoue car la colonne existe déjà:
```sql
-- Supprimer la colonne si elle existe (ATTENTION: supprime les données)
ALTER TABLE appointments DROP FOREIGN KEY fk_appointment_doctor;
ALTER TABLE appointments DROP COLUMN doctor_id;

-- Puis réexécuter le script de migration
```

## Rollback (retour arrière)

Pour annuler cette migration:
```sql
-- Supprimer la contrainte et la colonne
ALTER TABLE appointments DROP FOREIGN KEY fk_appointment_doctor;
ALTER TABLE appointments DROP COLUMN doctor_id;

-- Remettre reason en facultatif
ALTER TABLE appointments MODIFY COLUMN reason VARCHAR(255);
```

**ATTENTION**: Le rollback supprimera toutes les assignations de médecins!

## Fichiers modifiés

### Backend
- `backend/database/add_doctor_to_appointments.sql` (NOUVEAU)
- `backend/src/controllers/appointment.controller.js`

### Frontend
- `frontend/src/pages/Appointments.js`

## Notes importantes

- Les rendez-vous créés via le formulaire nécessitent maintenant un médecin ET un motif
- Le SMS envoyé au patient ne mentionne pas encore le nom du médecin (peut être ajouté ultérieurement)
- Tous les utilisateurs avec le rôle ADMIN, DOCTOR ou MEDECIN apparaissent dans la liste des médecins
