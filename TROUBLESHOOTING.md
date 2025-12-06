# Guide de Dépannage - Pages Vides

## Problème: Les pages du menu ne s'affichent pas (sauf Accueil)

### Étape 1: Vérifier la console du navigateur
1. Ouvrez votre navigateur et appuyez sur **F12**
2. Allez dans l'onglet **Console**
3. Regardez s'il y a des erreurs en rouge
4. Notez le message d'erreur complet

### Étape 2: Redémarrer proprement l'application

#### Backend:
```bash
# Dans le terminal backend, arrêtez le serveur (Ctrl+C)
cd backend
npm install
npm run dev
```

#### Frontend:
```bash
# Dans un nouveau terminal, arrêtez le serveur (Ctrl+C)
cd frontend
# Nettoyer le cache
rd /s /q node_modules\.cache
npm install
npm start
```

### Étape 3: Vider le cache du navigateur
1. Appuyez sur **Ctrl + Shift + Delete**
2. Cochez "Images et fichiers en cache"
3. Cliquez sur "Effacer les données"
4. Rechargez la page (Ctrl + R ou F5)

### Étape 4: Vérifier que les deux serveurs sont démarrés
- Backend doit tourner sur http://localhost:5000
- Frontend doit tourner sur http://localhost:3000

### Erreurs courantes et solutions:

#### Erreur: "Cannot read property 'coverage_percentage' of undefined"
**Solution:** La base de données doit être migrée
```bash
cd backend
mysql -u root -p master_clinique < database/migration_standardize_coverage_columns.sql
```

#### Erreur: "Module not found" ou "Cannot resolve"
**Solution:** Réinstaller les dépendances
```bash
cd frontend
rd /s /q node_modules
npm install
```

#### Erreur: "Failed to fetch" dans la console
**Solution:** Le backend n'est pas démarré ou ne répond pas
- Vérifiez que le backend tourne sur le port 5000
- Vérifiez les logs du backend pour des erreurs

### Si le problème persiste:
Envoyez-moi le message d'erreur exact de la console du navigateur
