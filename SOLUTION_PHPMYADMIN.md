# ✅ SOLUTION via phpMyAdmin (RECOMMANDÉ)

Vous avez une erreur de permissions MySQL. La solution la plus simple est d'utiliser phpMyAdmin.

---

## 🎯 MÉTHODE RAPIDE (Option A - Recommandée)

### Étape 1: Ouvrir phpMyAdmin
1. Démarrez XAMPP/WAMP
2. Ouvrez phpMyAdmin (http://localhost/phpmyadmin)
3. Cliquez sur la base de données **`master_clinique`** dans le menu de gauche

### Étape 2: Cliquez sur l'onglet **SQL** en haut

### Étape 3: Copiez-collez CE SCRIPT et cliquez Exécuter

```sql
USE master_clinique;

-- Rendre le code optionnel
ALTER TABLE insurance_companies MODIFY COLUMN code VARCHAR(50) UNIQUE;

-- Renommer les colonnes (ignorez les erreurs si colonnes n'existent pas)
ALTER TABLE insurance_companies
CHANGE COLUMN default_coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

ALTER TABLE patient_insurance
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0;

ALTER TABLE admissions
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Vérification
SHOW COLUMNS FROM insurance_companies WHERE Field IN ('code', 'coverage_percentage');
```

### ⚠️ IMPORTANT
- **Si vous voyez des erreurs "column doesn't exist"** → C'est NORMAL, ignorez-les
- **Si vous voyez "Duplicate column name"** → Lisez la section "Option B" ci-dessous

### Étape 4: Redémarrer les serveurs

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

---

## 🔧 MÉTHODE MANUELLE (Option B - Si Option A a des erreurs)

Si le script rapide a des erreurs, suivez ces étapes une par une:

### 1️⃣ Vérifier l'état de la table insurance_companies

Dans l'onglet SQL de phpMyAdmin, exécutez:
```sql
SHOW COLUMNS FROM insurance_companies;
```

**Regardez le résultat:**

#### CAS A: Vous voyez `coverage_percentage` ✅
→ Passez directement à l'étape 2️⃣

#### CAS B: Vous voyez `default_coverage_rate` uniquement
→ Exécutez:
```sql
ALTER TABLE insurance_companies
CHANGE COLUMN default_coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;
```

#### CAS C: Vous voyez LES DEUX colonnes
→ Exécutez:
```sql
ALTER TABLE insurance_companies DROP COLUMN default_coverage_rate;
```

### 2️⃣ Rendre le code optionnel
```sql
ALTER TABLE insurance_companies MODIFY COLUMN code VARCHAR(50) UNIQUE;
```

### 3️⃣ Corriger patient_insurance

Vérifiez d'abord:
```sql
SHOW COLUMNS FROM patient_insurance LIKE '%coverage%';
```

Si vous voyez `coverage_rate`, exécutez:
```sql
ALTER TABLE patient_insurance
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0;
```

### 4️⃣ Corriger admissions

Vérifiez:
```sql
SHOW COLUMNS FROM admissions LIKE '%coverage%';
```

Si vous voyez `coverage_rate`, exécutez:
```sql
ALTER TABLE admissions
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;
```

### 5️⃣ Vérification finale
```sql
SELECT 'insurance_companies' AS table_name;
SHOW COLUMNS FROM insurance_companies WHERE Field IN ('code', 'coverage_percentage');

SELECT 'patient_insurance' AS table_name;
SHOW COLUMNS FROM patient_insurance WHERE Field = 'coverage_percentage';

SELECT 'admissions' AS table_name;
SHOW COLUMNS FROM admissions WHERE Field = 'coverage_percentage';
```

**Vous devriez voir:**
- ✅ `code` → Null: YES
- ✅ `coverage_percentage` dans toutes les tables

---

## 🚀 APRÈS LA CORRECTION

1. **Redémarrez Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Redémarrez Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Testez la connexion:**
   - Ouvrez http://localhost:3000
   - Utilisateur: `admin`
   - Mot de passe: `admin123`

---

## ❓ Si vous avez encore des problèmes

Envoyez-moi une capture d'écran ou le texte de:

1. Le résultat de cette commande dans phpMyAdmin:
```sql
SHOW COLUMNS FROM insurance_companies;
```

2. Les erreurs dans la console du navigateur (F12 → Console)

3. Les logs du serveur backend
