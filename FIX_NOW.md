# CORRECTION IMMÉDIATE - Erreur #1060

## Le problème
Vous avez l'erreur "Nom du champ 'coverage_percentage' déjà utilisé" parce que la base de données a un conflit de colonnes.

## SOLUTION EN 2 ÉTAPES ⚡

### **Étape 1: Exécuter le script de correction**

Ouvrez MySQL et exécutez cette commande :

```bash
mysql -u root -p master_clinique < backend\database\fix_coverage_columns.sql
```

**OU** via phpMyAdmin :
1. Ouvrez phpMyAdmin
2. Sélectionnez la base de données `master_clinique`
3. Allez dans l'onglet **SQL**
4. Copiez-collez le contenu du fichier `backend\database\fix_coverage_columns.sql`
5. Cliquez sur **Exécuter**

### **Étape 2: Redémarrer les serveurs**

#### Backend :
```bash
cd backend
npm run dev
```

Attendez de voir : `✓ Server running on port 5000`

#### Frontend (nouveau terminal) :
```bash
cd frontend
npm start
```

Attendez de voir : `Compiled successfully!`

---

## Si vous voulez d'abord diagnostiquer (OPTIONNEL)

Pour voir l'état actuel de votre base de données :

```bash
mysql -u root -p master_clinique < backend\database\diagnose_database.sql
```

Cela vous montrera quelles colonnes existent actuellement dans chaque table.

---

## Que fait le script de correction ?

Le script `fix_coverage_columns.sql` :
- ✅ Détecte automatiquement quelles colonnes existent
- ✅ Supprime les doublons si nécessaire
- ✅ Renomme les anciennes colonnes (`coverage_rate` → `coverage_percentage`)
- ✅ Rend le champ `code` optionnel dans `insurance_companies`
- ✅ Ne génère AUCUNE erreur, quelle que soit la situation

---

## Après la correction

Testez la connexion :
1. Ouvrez http://localhost:3000
2. Connectez-vous avec :
   - **Utilisateur :** admin
   - **Mot de passe :** admin123

---

## Si ça ne fonctionne toujours pas

Envoyez-moi le résultat de ces 2 commandes :

```bash
# 1. Diagnostic
mysql -u root -p master_clinique < backend\database\diagnose_database.sql

# 2. Logs du backend
cd backend
npm run dev
```

Et aussi les erreurs dans la console du navigateur (F12 → Console).
