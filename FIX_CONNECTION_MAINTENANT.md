# 🚨 ERREUR CONNECTION REFUSÉE - FIX IMMÉDIAT

## Le Problème
```
ERR_CONNECTION_REFUSED sur http://localhost:3000/api/auth/login
```

**→ Le backend n'est PAS démarré !**

---

## ✅ SOLUTION RAPIDE (5 minutes)

### 1️⃣ VÉRIFIER LE FICHIER .env

Ouvrez `backend\.env` et vérifiez qu'il contient:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=master_clinique
DB_PORT=3306
JWT_SECRET=un_secret_tres_long_et_securise
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

⚠️ **Changez `DB_PASSWORD` avec VOTRE mot de passe MySQL**

Si le fichier n'existe pas, créez-le avec ce contenu.

---

### 2️⃣ APPLIQUER LES CORRECTIONS DE LA BASE DE DONNÉES

Dans phpMyAdmin:
1. Sélectionnez la base `master_clinique`
2. Onglet **SQL**
3. Copiez-collez et exécutez:

```sql
USE master_clinique;

ALTER TABLE insurance_companies MODIFY COLUMN code VARCHAR(50) UNIQUE;

ALTER TABLE insurance_companies
CHANGE COLUMN default_coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;

ALTER TABLE patient_insurance
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0;

ALTER TABLE admissions
CHANGE COLUMN coverage_rate coverage_percentage DECIMAL(5,2) DEFAULT 0.00;
```

*(Ignorez les erreurs "column doesn't exist")*

---

### 3️⃣ DÉMARRER L'APPLICATION

**MÉTHODE A - Automatique (Recommandé):**

Double-cliquez sur le fichier `START_APP.bat` à la racine du projet.

→ Deux fenêtres vont s'ouvrir (Backend et Frontend). **Ne les fermez pas !**

**MÉTHODE B - Manuel:**

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

Attendez de voir: `Server is running on port 5000` ✅

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

Attendez de voir: `Compiled successfully!` ✅

---

### 4️⃣ TESTER

1. **Ouvrez http://localhost:5000 dans votre navigateur**

   ✅ Vous devriez voir:
   ```json
   {"message":"Master Clinique API is running"}
   ```

   ❌ Si erreur → Voir section "Le backend ne démarre pas" ci-dessous

2. **Ouvrez http://localhost:3000**

   ✅ Vous devriez voir la page de connexion

3. **Connectez-vous:**
   - Utilisateur: `admin`
   - Mot de passe: `admin123`

---

## 🔧 DÉPANNAGE

### Le backend ne démarre pas

**Erreur: "Cannot connect to database"**
- Vérifiez que MySQL est démarré (XAMPP/WAMP)
- Vérifiez `DB_PASSWORD` dans le fichier `.env`
- Testez: `mysql -u root -p -e "USE master_clinique;"`

**Erreur: "Cannot find module"**
```bash
cd backend
rm -rf node_modules
npm install
```

**Erreur: "Port 5000 already in use"**
```bash
# Trouver le processus
netstat -ano | findstr :5000

# Tuer le processus (remplacez PID par le numéro affiché)
taskkill /PID [PID] /F
```

### Le frontend affiche ERR_CONNECTION_REFUSED

→ Le backend n'est PAS démarré. Retournez à l'étape 3️⃣

### Les pages du menu sont vides (sauf Accueil)

→ Videz le cache du navigateur:
- Ctrl + Shift + Delete
- Cochez "Images et fichiers en cache"
- Effacer
- Rechargez (F5)

---

## 📋 CHECKLIST AVANT DE TESTER

- [ ] MySQL est démarré (vert dans XAMPP)
- [ ] Le fichier `backend\.env` existe avec le bon mot de passe
- [ ] Les migrations SQL ont été exécutées dans phpMyAdmin
- [ ] **Backend tourne** → `Server is running on port 5000` visible
- [ ] **Frontend tourne** → `Compiled successfully!` visible
- [ ] http://localhost:5000 fonctionne et affiche le message JSON

---

## 📞 Besoin d'aide?

Si ça ne fonctionne toujours pas, envoyez-moi:

1. **Le message exact du terminal backend** (toute la sortie)
2. **Les erreurs dans la console du navigateur** (F12 → Console → Copier tout)
3. **Ce que vous voyez sur http://localhost:5000**

---

## 📂 Fichiers Utiles Créés

- `START_APP.bat` → Démarre automatiquement tout
- `START_SERVERS.md` → Guide détaillé complet
- `SOLUTION_PHPMYADMIN.md` → Guide migrations SQL
- `backend\.env` → À vérifier/créer
