# Instructions de Démarrage - Master Clinique

## Prérequis
- ✅ Node.js installé
- ✅ MySQL installé et en cours d'exécution
- ✅ Dépendances backend installées
- ✅ Dépendances frontend installées

## Étape 1 : Configurer MySQL

### Option A : Ligne de commande MySQL
```bash
mysql -u root -p
```
Puis exécutez :
```sql
CREATE DATABASE IF NOT EXISTS master_clinique;
USE master_clinique;
SOURCE backend/database/schema.sql;
EXIT;
```

### Option B : Import direct
```bash
mysql -u root -p master_clinique < backend/database/schema.sql
```

Si vous n'avez pas de mot de passe MySQL, retirez le `-p`.

### Configurer le mot de passe MySQL
Si vous avez un mot de passe MySQL, modifiez `backend/.env` :
```env
DB_PASSWORD=votre_mot_de_passe_mysql
```

## Étape 2 : Démarrer le Backend

Ouvrez un terminal et exécutez :
```bash
cd backend
npm run dev
```

Le serveur backend démarrera sur `http://localhost:5000`

Vous devriez voir :
```
Server is running on port 5000
```

## Étape 3 : Démarrer le Frontend

Ouvrez un NOUVEAU terminal et exécutez :
```bash
cd frontend
npm start
```

Le serveur frontend démarrera sur `http://localhost:3000` et ouvrira automatiquement votre navigateur.

## Étape 4 : Se connecter

L'application s'ouvrira dans votre navigateur à `http://localhost:3000`

**Identifiants par défaut :**
- Utilisateur : `admin`
- Mot de passe : `admin123`

## Modules disponibles

Selon votre rôle, vous aurez accès à :

- **Tableau de bord** : Statistiques et aperçu général
- **Patients** : Gestion des patients
- **Rendez-vous** : Gestion des rendez-vous
- **Caisse et Facturation** : Factures et paiements (CAISSE, ADMIN, SUPERVISOR)
- **Assurance** : Gestion des assurances (ASSURANCE, ADMIN, SUPERVISOR)
- **Pharmacie** : Gestion de la pharmacie (PHARMACIE, ADMIN, SUPERVISOR)
- **Comptabilité** : Transactions financières (ADMIN, SUPERVISOR)
- **Utilisateurs** : Gestion des utilisateurs (ADMIN uniquement)

## Dépannage

### Erreur de connexion à la base de données
- Vérifiez que MySQL est en cours d'exécution
- Vérifiez les informations de connexion dans `backend/.env`
- Assurez-vous que la base de données `master_clinique` existe

### Erreur "Cannot connect to backend"
- Vérifiez que le backend est démarré sur le port 5000
- Vérifiez qu'il n'y a pas d'autre application utilisant le port 5000

### Erreur "Port 3000 is already in use"
- Un autre processus utilise le port 3000
- Fermez l'autre application ou utilisez un autre port

## Commandes utiles

### Backend
```bash
cd backend
npm run dev      # Démarrer en mode développement
npm start        # Démarrer en mode production
```

### Frontend
```bash
cd frontend
npm start        # Démarrer le serveur de développement
npm run build    # Créer un build de production
```

### Base de données
```bash
# Sauvegarder la base de données
mysqldump -u root -p master_clinique > backup.sql

# Restaurer la base de données
mysql -u root -p master_clinique < backup.sql
```

## Configuration des rôles

Pour créer de nouveaux utilisateurs, connectez-vous en tant qu'admin et allez dans **Utilisateurs**.

Les rôles disponibles :
1. **ADMIN** - Accès complet à tout
2. **SUPERVISOR** - Accès à tous les modules sauf gestion utilisateurs
3. **ACCUEIL** - Patients et rendez-vous
4. **CAISSE** - Facturation et paiements
5. **ASSURANCE** - Gestion des assurances
6. **PHARMACIE** - Gestion de la pharmacie

## Support

Pour toute question ou problème, consultez le README.md ou créez une issue sur le repository.
