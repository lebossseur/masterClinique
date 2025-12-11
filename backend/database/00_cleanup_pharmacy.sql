-- Script de nettoyage complet pour réinitialiser le module Pharmacie
-- Date: 2025-12-08
-- À exécuter AVANT pharmacy_enhanced.sql

-- Désactiver les vérifications de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer toutes les tables du module pharmacie dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS stock_exit_items;
DROP TABLE IF EXISTS stock_exits;
DROP TABLE IF EXISTS stock_entry_items;
DROP TABLE IF EXISTS stock_entries;
DROP TABLE IF EXISTS pharmacy_sales_items;
DROP TABLE IF EXISTS pharmacy_sales;
DROP TABLE IF EXISTS pharmacy_products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS packaging_types;
DROP TABLE IF EXISTS storage_types;
DROP TABLE IF EXISTS medication_types;
DROP TABLE IF EXISTS pharmacy_categories;

-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- Message de confirmation
SELECT 'Toutes les tables de pharmacie ont été supprimées avec succès!' AS Status;
