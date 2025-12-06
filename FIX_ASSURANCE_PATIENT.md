# 🔧 CORRECTION : Ajout d'Assurance Patient

## 🚨 PROBLÈMES DÉTECTÉS

D'après les logs du serveur, il y a **2 problèmes** :

1. ❌ **Base de données non migrée** : La colonne `coverage_percentage` n'existe pas dans la table `admissions`
2. ❌ **Le formulaire envoie l'ancien nom** : Le frontend envoie `coverage_rate` au lieu de `coverage_percentage`

---

## ✅ SOLUTION EN 3 ÉTAPES

### **ÉTAPE 1 : Appliquer les migrations SQL** 🔥 OBLIGATOIRE

#### Dans phpMyAdmin :

1. Ouvrez phpMyAdmin (http://localhost/phpmyadmin)
2. Sélectionnez la base de données **`master_clinique`**
3. Cliquez sur l'onglet **SQL**
4. Copiez-collez ce script et cliquez **Exécuter** :

```sql
USE master_clinique;

-- Table insurance_companies
ALTER TABLE insurance_companies MODIFY COLUMN code VARCHAR(50) UNIQUE;

ALTER TABLE insurance_companies
CHANGE COLUMN default_coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Table patient_insurance
ALTER TABLE patient_insurance
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0;

-- Table admissions (IMPORTANT pour corriger l'erreur)
ALTER TABLE admissions
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Si la table insurance_coverage_rates existe
ALTER TABLE insurance_coverage_rates
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) NOT NULL;

-- Vérification
SELECT '✅ Migration terminée!' AS status;
SHOW COLUMNS FROM insurance_companies WHERE Field IN ('code', 'coverage_percentage');
SHOW COLUMNS FROM patient_insurance WHERE Field = 'coverage_percentage';
SHOW COLUMNS FROM admissions WHERE Field = 'coverage_percentage';
```

**⚠️ IMPORTANT :** Ignorez les erreurs "column doesn't exist" - elles sont normales si certaines colonnes ont déjà été renommées.

---

### **ÉTAPE 2 : Vider le cache du navigateur**

Le navigateur utilise peut-être une version en cache de l'application.

1. Dans votre navigateur, appuyez sur **Ctrl + Shift + Delete**
2. Cochez **"Images et fichiers en cache"**
3. Cliquez sur **"Effacer les données"**
4. Rechargez la page complètement : **Ctrl + F5** (ou Ctrl + Shift + R)

---

### **ÉTAPE 3 : Redémarrer le frontend** (optionnel si ÉTAPE 2 ne suffit pas)

Si le problème persiste après avoir vidé le cache :

Dans le terminal où tourne le frontend :
1. Appuyez sur **Ctrl + C** pour arrêter
2. Relancez :
```bash
cd frontend
npm start
```

---

## 🧪 TEST

Après avoir fait les étapes ci-dessus :

1. Allez dans **Patients**
2. Cliquez sur un patient
3. Cliquez sur **"Ajouter une Assurance"**
4. Remplissez le formulaire :
   - **Compagnie d'assurance** : Sélectionnez une compagnie
   - **Numéro de police** : Entrez un numéro (ex: 123456)
   - **Taux de Couverture (%)** : Entrez un taux (ex: 80)
   - **Date de début** : Sélectionnez une date
5. Cliquez sur **"Ajouter"**

✅ **Vous devriez voir** : "Assurance ajoutée avec succès !"

---

## 📊 VÉRIFICATION DES COLONNES

Pour vérifier que les migrations ont bien été appliquées, exécutez dans phpMyAdmin :

```sql
-- Vérifier la table admissions
SHOW COLUMNS FROM admissions LIKE '%coverage%';

-- Doit afficher "coverage_percentage", PAS "coverage_rate"
```

---

## ❓ SI ÇA NE FONCTIONNE TOUJOURS PAS

### Erreur : "Unknown column 'coverage_percentage'"
→ Les migrations n'ont pas été appliquées. Retournez à l'ÉTAPE 1.

### Erreur : "Duplicate column name"
→ Certaines colonnes existent déjà. Exécutez uniquement les lignes qui correspondent à vos tables.

### Erreur : Le formulaire envoie toujours "coverage_rate"
→ Videz complètement le cache navigateur (Ctrl + Shift + Delete) et rechargez avec Ctrl + F5

### Erreur : "Patient ID... sont requis"
→ Vérifiez que tous les champs du formulaire sont bien remplis (notamment le taux de couverture)

---

## 📝 POUR INFO : Ce qui a été modifié

J'ai standardisé tous les noms de colonnes :
- ❌ `coverage_rate` (ancien)
- ❌ `default_coverage_rate` (ancien)
- ✅ `coverage_percentage` (nouveau, partout)

**Tables concernées :**
- `insurance_companies`
- `patient_insurance`
- `admissions`
- `insurance_coverage_rates` (si existe)

---

**Dites-moi quand vous aurez exécuté les migrations SQL !** 👍
