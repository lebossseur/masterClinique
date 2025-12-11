-- Script pour synchroniser les paiements existants avec les transactions de comptabilité
-- Ce script crée des transactions de comptabilité pour tous les paiements qui n'en ont pas encore

USE master_clinique;

-- Créer des transactions de comptabilité pour les paiements existants
-- qui n'ont pas encore de transaction correspondante
INSERT INTO accounting_transactions (
  transaction_number,
  transaction_date,
  transaction_type,
  category,
  amount,
  payment_method,
  reference_type,
  reference_id,
  description,
  created_by
)
SELECT
  CONCAT('TRX-SYNC-', p.id) as transaction_number,
  p.payment_date as transaction_date,
  'INCOME' as transaction_type,
  'PAYMENT' as category,
  p.amount,
  p.payment_method,
  'PAYMENT' as reference_type,
  p.invoice_id as reference_id,
  CONCAT('Paiement facture - ', p.payment_number, ' (synchronisation)') as description,
  p.received_by as created_by
FROM payments p
WHERE NOT EXISTS (
  SELECT 1
  FROM accounting_transactions at
  WHERE at.reference_type = 'PAYMENT'
  AND at.reference_id = p.invoice_id
  AND at.transaction_date = p.payment_date
  AND at.amount = p.amount
);

-- Afficher le résumé
SELECT
  COUNT(*) as total_transactions_creees,
  SUM(amount) as montant_total_synchronise
FROM accounting_transactions
WHERE transaction_number LIKE 'TRX-SYNC-%';

-- Vérifier la cohérence
SELECT 
  'Paiements' as source,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM payments
UNION ALL
SELECT
  'Transactions INCOME' as source,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM accounting_transactions
WHERE transaction_type = 'INCOME';
