# Nouvelles Fonctionnalités de Configuration

## Onglets Implémentés

### 1. Centre de Santé

Cet onglet permet de gérer les informations du centre de santé :

**Champs disponibles :**
- Nom du centre (requis)
- Téléphone de contact (requis)
- Email (requis)
- Ville (requis)
- Adresse complète (requis)
- URL du logo (optionnel avec aperçu)

**Fonctionnalités :**
- Création/mise à jour des informations du centre
- Aperçu du logo en temps réel
- Validation des champs obligatoires

### 2. Médecins et Praticiens

Cet onglet permet de gérer le registre des médecins et praticiens :

**Champs disponibles :**
- Utilisateur associé (optionnel - lien avec un compte utilisateur)
- Spécialisation (requis)
- Numéro de licence
- Qualification
- Années d'expérience
- Tarif de consultation (FCFA)
- Téléphone
- Email
- Statut (actif/inactif)

**Fonctionnalités :**
- Création de nouveaux médecins/praticiens
- Modification des informations existantes
- Suppression (avec confirmation)
- Association optionnelle avec un compte utilisateur
- Affichage en tableau avec toutes les informations clés

## Installation

### Backend

Les tables nécessaires ont été créées via le script de migration :

```bash
cd backend
node run_health_center_migration.js
```

Ce script crée :
- Table `health_center` : informations du centre de santé
- Table `doctors` : registre des médecins et praticiens

### Frontend

Les composants sont déjà intégrés dans `Configuration.js` avec :
- Onglet "Centre de Santé" (icône hôpital)
- Onglet "Médecins/Praticiens" (icône médecin)

## API Endpoints

### Centre de Santé

- `GET /api/health-center` : Récupérer les informations du centre
- `PUT /api/health-center` : Mettre à jour les informations

### Médecins

- `GET /api/doctors` : Liste tous les médecins
- `GET /api/doctors/:id` : Détails d'un médecin
- `POST /api/doctors` : Créer un nouveau médecin
- `PUT /api/doctors/:id` : Modifier un médecin
- `DELETE /api/doctors/:id` : Supprimer un médecin

## Utilisation

1. Accéder à la page **Configuration**
2. Cliquer sur l'onglet **Centre de Santé** ou **Médecins/Praticiens**
3. Remplir/modifier les informations
4. Enregistrer les modifications

## Notes Techniques

- Authentification requise pour tous les endpoints
- Validation côté serveur et client
- Support de la liaison médecin-utilisateur via clé étrangère
- Timestamps automatiques (created_at, updated_at)
