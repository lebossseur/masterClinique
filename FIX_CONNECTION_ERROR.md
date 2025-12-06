# Résolution de l'Erreur de Connexion

## Étape 1: Appliquer les migrations de la base de données

Les modifications que j'ai apportées nécessitent une mise à jour de la base de données.

### Option A: Migration complète (RECOMMANDÉ)
Exécutez ce script pour mettre à jour la base de données sans perdre de données:

```bash
mysql -u root -p master_clinique < backend\database\migration_standardize_coverage_columns.sql
```

Mot de passe MySQL: [votre mot de passe MySQL]

### Option B: Recréer la base de données (si Option A ne fonctionne pas)
**ATTENTION:** Cela supprimera toutes vos données existantes !

```bash
# 1. Supprimer et recréer la base de données
mysql -u root -p -e "DROP DATABASE IF EXISTS master_clinique; CREATE DATABASE master_clinique;"

# 2. Créer le schéma de base
mysql -u root -p < backend\database\schema.sql

# 3. Créer les tables de pricing et admissions
mysql -u root -p master_clinique < backend\create_pricing_tables.sql
mysql -u root -p master_clinique < backend\create_admissions_tables.sql
```

## Étape 2: Vérifier le fichier .env

Vérifiez que le fichier `backend\.env` existe et contient:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=master_clinique
DB_PORT=3306

# JWT Configuration
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Étape 3: Redémarrer les serveurs

### Backend:
```bash
cd backend
npm install
npm run dev
```

Attendez de voir: `✓ Server running on port 5000`

### Frontend (dans un nouveau terminal):
```bash
cd frontend
npm install
npm start
```

Attendez de voir: `Compiled successfully!`

## Étape 4: Tester la connexion

1. Ouvrez http://localhost:3000
2. Utilisez les identifiants par défaut:
   - **Utilisateur:** admin
   - **Mot de passe:** admin123

## Si l'erreur persiste:

### Erreur: "Cannot connect to database"
- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans le fichier .env
- Testez la connexion: `mysql -u root -p -e "USE master_clinique; SELECT COUNT(*) FROM users;"`

### Erreur: "Table doesn't exist"
- Exécutez les migrations (Étape 1)
- Vérifiez que toutes les tables sont créées: `mysql -u root -p -e "USE master_clinique; SHOW TABLES;"`

### Erreur: "Unknown column 'coverage_percentage'"
- Exécutez la migration: `mysql -u root -p master_clinique < backend\database\migration_standardize_coverage_columns.sql`

### Erreur dans le frontend (page blanche)
1. Ouvrez la console (F12)
2. Regardez l'onglet Console pour les erreurs
3. Vérifiez l'onglet Network pour voir si les requêtes API échouent

## Modifications apportées

J'ai corrigé les incohérences suivantes:
1. **Champ `code` optionnel**: Les compagnies d'assurance peuvent maintenant être créées sans code
2. **Standardisation des colonnes**: Tous les champs de taux de couverture utilisent maintenant `coverage_percentage`
3. **Corrections backend**: Mise à jour de tous les contrôleurs
4. **Corrections frontend**: Mise à jour de Patients.js, Home.js, et Invoices.js

## Besoin d'aide?

Si le problème persiste, envoyez-moi:
1. Le message d'erreur exact de la console du navigateur
2. Les dernières lignes des logs du serveur backend
3. Le résultat de: `mysql -u root -p -e "USE master_clinique; SHOW COLUMNS FROM insurance_companies;"`
