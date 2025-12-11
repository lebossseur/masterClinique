# Utilisateurs de Démonstration - Master Clinique

## Mot de passe par défaut
**Tous les utilisateurs ont le même mot de passe : `password123`**

⚠️ **IMPORTANT** : Changez ces mots de passe en production pour des raisons de sécurité !

---

## Liste des Utilisateurs

### 👨‍💼 ADMINISTRATEURS

| Username   | Email                          | Nom Complet      | Rôle       |
|------------|--------------------------------|------------------|------------|
| admin      | admin@masterclinique.com       | Admin Système    | ADMIN      |
| supervisor | supervisor@masterclinique.com  | Jean Superviseur | SUPERVISOR |

**Accès** : Accès complet à toutes les fonctionnalités du système

---

### 🏥 PERSONNEL D'ACCUEIL

| Username  | Email                        | Nom Complet      | Rôle    |
|-----------|------------------------------|------------------|---------|
| accueil1  | accueil1@masterclinique.com  | Marie Accueil    | ACCUEIL |
| accueil2  | accueil2@masterclinique.com  | Sophie Réception | ACCUEIL |

**Accès** : 
- Gestion des patients
- Gestion des rendez-vous
- Gestion des admissions

---

### 💰 PERSONNEL DE CAISSE

| Username | Email                      | Nom Complet         | Rôle   |
|----------|----------------------------|---------------------|--------|
| caisse1  | caisse1@masterclinique.com | Pierre Caisse       | CAISSE |
| caisse2  | caisse2@masterclinique.com | Aminata Comptabilité| CAISSE |

**Accès** : 
- Facturation
- Paiements
- Comptabilité
- Transactions financières

---

### 🏥 PERSONNEL ASSURANCE

| Username    | Email                          | Nom Complet      | Rôle      |
|-------------|--------------------------------|------------------|-----------|
| assurance1  | assurance1@masterclinique.com  | Jacques Assurance| ASSURANCE |

**Accès** : 
- Gestion des compagnies d'assurance
- Gestion des prises en charge
- Factures d'assurance

---

### 💊 PERSONNEL PHARMACIE

| Username    | Email                          | Nom Complet       | Rôle      |
|-------------|--------------------------------|-------------------|-----------|
| pharmacie1  | pharmacie1@masterclinique.com  | Fatou Pharmacie   | PHARMACIE |
| pharmacie2  | pharmacie2@masterclinique.com  | Ibrahim Pharmacien| PHARMACIE |

**Accès** : 
- Gestion des produits pharmaceutiques
- Gestion du stock
- Ventes de médicaments
- Entrées/Sorties de stock

---

## Comment utiliser ces comptes

1. **Connexion** : Utilisez le username et le mot de passe `password123`
2. **Test** : Ces comptes permettent de tester toutes les fonctionnalités selon les permissions de chaque rôle
3. **Production** : ⚠️ NE PAS utiliser ces comptes en production ! Créez de nouveaux comptes avec des mots de passe sécurisés

---

## Script d'installation

Pour créer ces utilisateurs dans votre base de données, exécutez le script :

```bash
mysql -u root -p master_clinique < backend/database/create_users.sql
```

Ou via phpMyAdmin :
1. Ouvrez phpMyAdmin
2. Sélectionnez la base de données `master_clinique`
3. Allez dans l'onglet "SQL"
4. Copiez-collez le contenu du fichier `create_users.sql`
5. Cliquez sur "Exécuter"

---

## Sécurité

🔒 **Recommandations de sécurité** :
- Changez TOUS les mots de passe avant la mise en production
- Utilisez des mots de passe forts (12+ caractères, majuscules, minuscules, chiffres, symboles)
- Activez l'authentification à deux facteurs (2FA) si disponible
- Supprimez les comptes de test non utilisés
- Effectuez des audits de sécurité réguliers
