# 🚀 DÉMARRAGE DES SERVEURS - Guide Complet

## ❌ ERREUR ACTUELLE
```
POST http://localhost:3000/api/auth/login net::ERR_CONNECTION_REFUSED
```

**Cause:** Le backend n'est PAS démarré ou ne répond pas sur le port 5000.

---

## ✅ SOLUTION COMPLÈTE

### ÉTAPE 1: Vérifier/Créer le fichier .env du backend

1. Allez dans le dossier `backend`
2. Vérifiez si le fichier `.env` existe
3. Si OUI, vérifiez qu'il contient ces lignes:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=master_clinique
DB_PORT=3306

# JWT Configuration
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

4. Si NON, créez le fichier `.env` avec ce contenu (⚠️ **Remplacez `DB_PASSWORD` par votre mot de passe MySQL**)

---

### ÉTAPE 2: Démarrer MySQL

**XAMPP:**
- Ouvrez le panneau de contrôle XAMPP
- Cliquez sur "Start" à côté de MySQL
- Attendez qu'il devienne vert

**WAMP:**
- Démarrez WAMP
- Attendez que l'icône devienne verte

**Vérification:**
```bash
mysql -u root -p -e "SHOW DATABASES;"
```
Vous devriez voir `master_clinique` dans la liste.

---

### ÉTAPE 3: Démarrer le BACKEND

Ouvrez un terminal (PowerShell ou CMD) et exécutez:

```bash
cd C:\Users\joseph\Documents\GitHub\masterClinique\backend
npm install
npm run dev
```

**✅ VOUS DEVEZ VOIR:**
```
Server is running on port 5000
```

**❌ SI VOUS VOYEZ UNE ERREUR:**

#### Erreur: "Cannot find module"
```bash
npm install
```

#### Erreur: "ECONNREFUSED" ou "connect to database"
- Vérifiez que MySQL est démarré
- Vérifiez le fichier `.env` (DB_USER, DB_PASSWORD, DB_NAME)
- Testez: `mysql -u root -p -e "USE master_clinique;"`

#### Erreur: "Table doesn't exist"
Exécutez les migrations dans phpMyAdmin (voir SOLUTION_PHPMYADMIN.md)

#### Erreur: "Port 5000 already in use"
```bash
# Windows - trouver et tuer le processus
netstat -ano | findstr :5000
taskkill /PID [le_numero_PID] /F
```

---

### ÉTAPE 4: Démarrer le FRONTEND

**Ouvrez un NOUVEAU terminal** (laissez le backend tourner) et exécutez:

```bash
cd C:\Users\joseph\Documents\GitHub\masterClinique\frontend
npm install
npm start
```

**✅ VOUS DEVEZ VOIR:**
```
Compiled successfully!
Local:            http://localhost:3000
```

Le navigateur devrait s'ouvrir automatiquement sur http://localhost:3000

---

### ÉTAPE 5: Tester la connexion

1. **Vérifiez que les deux serveurs tournent:**
   - Terminal 1: Backend sur port 5000 ✅
   - Terminal 2: Frontend sur port 3000 ✅

2. **Testez le backend directement:**
   Ouvrez http://localhost:5000 dans votre navigateur

   **Vous devriez voir:**
   ```json
   {"message":"Master Clinique API is running"}
   ```

3. **Testez le frontend:**
   Allez sur http://localhost:3000

   **Vous devriez voir:** La page de connexion

4. **Connectez-vous:**
   - Utilisateur: `admin`
   - Mot de passe: `admin123`

---

## 🔍 DIAGNOSTIC RAPIDE

### Le backend ne démarre pas?

```bash
cd backend
node src/server.js
```
Regardez le message d'erreur exact.

### Le frontend ne trouve pas le backend?

1. **Vérifiez que le backend tourne:**
   Allez sur http://localhost:5000

2. **Vérifiez le proxy dans frontend/package.json:**
   ```json
   "proxy": "http://localhost:5000"
   ```

3. **Ouvrez la console du navigateur (F12):**
   Onglet Network → Regardez si les requêtes vers `/api/*` sont bien envoyées

---

## 📝 CHECKLIST FINALE

Avant de tester:
- [ ] MySQL est démarré (vert dans XAMPP/WAMP)
- [ ] Le fichier `backend\.env` existe et est configuré
- [ ] La base de données `master_clinique` existe
- [ ] Les migrations SQL ont été exécutées (voir SOLUTION_PHPMYADMIN.md)
- [ ] Le backend tourne sur le port 5000
- [ ] Le frontend tourne sur le port 3000
- [ ] http://localhost:5000 retourne `{"message":"Master Clinique API is running"}`

---

## ❓ Encore des problèmes?

Envoyez-moi:
1. Le message d'erreur COMPLET du terminal backend
2. Le message d'erreur de la console du navigateur (F12 → Console)
3. Le résultat de: `http://localhost:5000` dans votre navigateur
