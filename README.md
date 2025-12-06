# Master Clinique - Système de Gestion de Centre de Santé

Application complète de gestion de centre de santé développée avec React, Node.js, Express et MySQL.

## Fonctionnalités

### Modules principaux
- **Accueil** : Gestion des patients et rendez-vous
- **Caisse et Facturation** : Gestion des factures et paiements
- **Assurance** : Gestion des compagnies d'assurance et couvertures
- **Pharmacie** : Gestion des produits pharmaceutiques et stocks
- **Comptabilité** : Suivi des transactions et statistiques financières

### Système de rôles
- **ADMIN** : Accès complet à toutes les fonctionnalités
- **SUPERVISOR** : Accès à tous les modules sauf la gestion des utilisateurs
- **ACCUEIL** : Gestion des patients et rendez-vous
- **CAISSE** : Gestion de la facturation et paiements
- **ASSURANCE** : Gestion des assurances
- **PHARMACIE** : Gestion de la pharmacie

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v5.7 ou supérieur)
- npm ou yarn

## Installation

### 1. Cloner le repository
```bash
git clone <repository-url>
cd masterClinique
```

### 2. Configuration de la base de données

Créer la base de données MySQL :
```bash
mysql -u root -p < backend/database/schema.sql
```

### 3. Configuration du Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` dans le dossier `backend` :
```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=master_clinique
DB_PORT=3306

# JWT Configuration
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Configuration du Frontend

```bash
cd frontend
npm install
```

## Démarrage de l'application

### Démarrer le Backend
```bash
cd backend
npm run dev
```
Le backend sera accessible sur `http://localhost:5000`

### Démarrer le Frontend
```bash
cd frontend
npm start
```
Le frontend sera accessible sur `http://localhost:3000`

## Connexion par défaut

**Utilisateur** : admin
**Mot de passe** : admin123

Note : Le mot de passe admin par défaut doit être changé après la première connexion. Vous devrez le hasher correctement avec bcrypt :

```javascript
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hashedPassword = await bcrypt.hash(password, 10);
console.log(hashedPassword);
```

Puis mettre à jour dans le fichier `schema.sql`.

## Structure du projet

```
masterClinique/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration (database)
│   │   ├── controllers/    # Contrôleurs pour chaque module
│   │   ├── middleware/     # Middleware d'authentification
│   │   ├── models/         # Modèles de données
│   │   ├── routes/         # Routes API
│   │   ├── utils/          # Utilitaires
│   │   └── server.js       # Point d'entrée du serveur
│   ├── database/
│   │   └── schema.sql      # Schéma de la base de données
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/     # Composants réutilisables
    │   ├── pages/          # Pages de l'application
    │   ├── services/       # Services API
    │   ├── context/        # Context React (Auth)
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Obtenir l'utilisateur connecté
- `PUT /api/auth/change-password` - Changer le mot de passe

### Patients
- `GET /api/patients` - Liste des patients
- `GET /api/patients/search?query=` - Recherche de patients
- `GET /api/patients/:id` - Détails d'un patient
- `POST /api/patients` - Créer un patient
- `PUT /api/patients/:id` - Modifier un patient
- `DELETE /api/patients/:id` - Supprimer un patient

### Rendez-vous
- `GET /api/appointments` - Liste des rendez-vous
- `GET /api/appointments/today` - Rendez-vous du jour
- `POST /api/appointments` - Créer un rendez-vous
- `PUT /api/appointments/:id` - Modifier un rendez-vous

### Factures
- `GET /api/invoices` - Liste des factures
- `GET /api/invoices/:id` - Détails d'une facture
- `POST /api/invoices` - Créer une facture
- `POST /api/invoices/payments` - Enregistrer un paiement

### Assurance
- `GET /api/insurance/companies` - Liste des compagnies
- `POST /api/insurance/companies` - Créer une compagnie
- `POST /api/insurance/patient` - Ajouter assurance patient

### Pharmacie
- `GET /api/pharmacy/products` - Liste des produits
- `GET /api/pharmacy/products/low-stock` - Produits en rupture
- `POST /api/pharmacy/products` - Créer un produit
- `POST /api/pharmacy/sales` - Créer une vente

### Comptabilité
- `GET /api/accounting/transactions` - Liste des transactions
- `GET /api/accounting/dashboard` - Statistiques
- `GET /api/accounting/expenses` - Liste des dépenses

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

## Sécurité

- Authentification JWT
- Hashage des mots de passe avec bcrypt
- Autorisation basée sur les rôles
- Protection CORS
- Validation des données

## Technologies utilisées

### Backend
- Node.js
- Express.js
- MySQL2
- JWT pour l'authentification
- Bcrypt pour le hashage des mots de passe

### Frontend
- React 18
- React Router pour la navigation
- Axios pour les appels API
- React Icons
- CSS personnalisé

## Développement futur

- Ajout de graphiques et statistiques avancées
- Génération de rapports PDF
- Système de notifications
- Gestion des consultations médicales
- Système de backup automatique
- Export de données (Excel, CSV)
- Intégration SMS pour rappels de rendez-vous

## Support

Pour toute question ou problème, veuillez créer une issue sur le repository.

## Licence

MIT
