# Mise à Jour des Statistiques Financières - Tableau de Bord

## 🔧 Modifications Effectuées

### 1. **Enregistrement Automatique des Transactions de Comptabilité**

**Fichier modifié**: `backend/src/controllers/invoice.controller.js`

Désormais, chaque fois qu'un paiement de facture est enregistré, le système crée automatiquement une **transaction de comptabilité de type INCOME** dans la table `accounting_transactions`.

**Code ajouté** (lignes 420-435):
```javascript
// Créer une transaction de comptabilité pour ce paiement (REVENU)
const transactionNumber = `TRX-${Date.now()}`;
await db.query(
  `INSERT INTO accounting_transactions (
    transaction_number, transaction_date, transaction_type, category,
    amount, payment_method, reference_type, reference_id, description, created_by
  ) VALUES (?, CURDATE(), 'INCOME', 'PAYMENT', ?, ?, 'PAYMENT', ?, ?, ?)`,
  [
    transactionNumber,
    amount,
    payment_method,
    invoice_id,
    `Paiement facture ${invoice.invoice_number} - ${payment_number}`,
    req.user.id
  ]
);
```

**Impact**: Les revenus sont maintenant automatiquement enregistrés dans la comptabilité à chaque paiement.

---

### 2. **Amélioration du Calcul des Statistiques**

**Fichier modifié**: `backend/src/controllers/accounting.controller.js`

La fonction `getDashboardStats` a été complètement revue pour calculer correctement les statistiques financières.

#### **Changements principaux** :

**Avant** : Les revenus étaient calculés depuis `accounting_transactions` (qui était vide)
**Maintenant** : Les revenus sont calculés directement depuis la table `payments` (paiements effectivement reçus)

#### **Nouveaux calculs** :

1. **Revenus du jour/mois** :
   - Basés sur les paiements effectivement reçus (table `payments`)
   - Reflètent l'argent réellement encaissé

2. **Factures en attente** :
   - Calcul plus précis incluant le montant restant à payer
   - Prend en compte les factures partiellement payées
   - Formule : `patient_responsibility - total_paid`

3. **Nouvelles statistiques** :
   - Nombre de factures émises aujourd'hui
   - Montant total facturé aujourd'hui
   - Net quotidien et mensuel (revenus - dépenses)

#### **Exemple de requête améliorée** :

```sql
-- Factures en attente avec montant restant
SELECT
  COUNT(*) as count,
  SUM(i.patient_responsibility - COALESCE(p.total_paid, 0)) as total
FROM invoices i
LEFT JOIN (
  SELECT invoice_id, SUM(amount) as total_paid
  FROM payments
  GROUP BY invoice_id
) p ON i.id = p.invoice_id
WHERE i.status IN ('PENDING', 'PARTIAL')
```

---

### 3. **Script de Synchronisation**

**Fichier créé**: `backend/database/sync_payment_transactions.sql`

Ce script permet de synchroniser les **paiements existants** avec la table `accounting_transactions` pour les données historiques.

**Utilité** :
- Crée des transactions de comptabilité pour tous les paiements passés
- Évite les doublons grâce à une vérification
- Fournit un résumé de la synchronisation

**Exécution** :
```bash
mysql -u root -p master_clinique < backend/database/sync_payment_transactions.sql
```

Ou via phpMyAdmin :
1. Ouvrir phpMyAdmin
2. Sélectionner la base `master_clinique`
3. Onglet SQL
4. Coller le contenu du fichier
5. Exécuter

---

## 📊 Nouvelles Données Affichées sur le Tableau de Bord

### **Statistiques du Jour** :
- ✅ **Revenus** : Somme des paiements reçus aujourd'hui
- ✅ **Dépenses** : Somme des dépenses approuvées aujourd'hui
- ✅ **Net** : Revenus - Dépenses
- ✅ **Factures émises** : Nombre de factures créées aujourd'hui
- ✅ **Montant facturé** : Total facturé aujourd'hui

### **Statistiques du Mois** :
- ✅ **Revenus** : Somme des paiements reçus ce mois
- ✅ **Dépenses** : Somme des dépenses approuvées ce mois
- ✅ **Net** : Revenus - Dépenses

### **Factures en Attente** :
- ✅ **Nombre** : Factures non payées ou partiellement payées
- ✅ **Montant restant** : Somme des montants encore dus

---

## 🔍 Vérification de la Cohérence

Pour vérifier que tout fonctionne correctement :

```sql
-- Comparer les paiements et les transactions
SELECT 
  'Paiements reçus' as source,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM payments
WHERE payment_date = CURDATE()
UNION ALL
SELECT
  'Transactions INCOME' as source,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM accounting_transactions
WHERE transaction_type = 'INCOME' AND transaction_date = CURDATE();
```

Les deux totaux devraient être **identiques** pour les nouveaux paiements (après la mise à jour).

---

## ⚠️ Points Importants

1. **Paiements futurs** : Tous les nouveaux paiements créeront automatiquement une transaction de comptabilité
2. **Paiements historiques** : Exécutez le script de synchronisation une seule fois pour les données existantes
3. **Double exécution** : Ne pas exécuter le script de synchronisation plusieurs fois (risque de doublons)
4. **Performance** : Les calculs sont optimisés avec des index sur les dates

---

## 📝 Structure des Données

### Table `payments` :
- Enregistre chaque paiement reçu
- Lié à une facture via `invoice_id`
- Contient : montant, méthode de paiement, date, etc.

### Table `accounting_transactions` :
- Journal comptable de toutes les transactions (INCOME + EXPENSE)
- Pour les revenus : référence le paiement via `reference_type='PAYMENT'`
- Pour les dépenses : référence la dépense via `reference_type='EXPENSE'`

### Table `invoices` :
- Factures émises aux patients
- Statuts : PENDING, PARTIAL, PAID, CONTROLE, CANCELLED

---

## 🚀 Prochaines Améliorations Possibles

1. **Rapports détaillés** : Ajouter des graphiques d'évolution
2. **Export Excel/PDF** : Exporter les statistiques
3. **Comparaisons** : Comparer avec les mois précédents
4. **Alertes** : Notifications pour factures impayées depuis X jours
5. **Prévisions** : Prédictions de revenus basées sur l'historique
