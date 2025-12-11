-- Exemples de médicaments pour tester le système de pharmacie
-- Date: 2025-12-08

-- Insertion de médicaments courants
INSERT INTO pharmacy_products
  (category_id, medication_type_id, storage_type_id, packaging_type_id,
   name, code, description, manufacturer, dosage, unit,
   unit_price, selling_price, quantity_in_stock, reorder_level,
   expiry_date, batch_number, requires_prescription, is_active)
VALUES
-- ANTALGIQUES (category_id = 1)pagine la liste des factures, ameliore le css des boutons du menu comptabilité et mets un filtre de date sur l'onglet achats et depenses 
(1, 1, 1, 3, 'Paracétamol', 'PARA-500', 'Antalgique et antipyrétique', 'Pharma SA', '500mg', 'comprimé', 50, 100, 500, 100, '2026-12-31', 'LOT2024-001', FALSE, TRUE),
(1, 1, 1, 3, 'Ibuprofène', 'IBU-400', 'Anti-inflammatoire et antalgique', 'MediPharma', '400mg', 'comprimé', 100, 200, 300, 50, '2026-06-30', 'LOT2024-002', FALSE, TRUE),
(1, 1, 1, 3, 'Aspirine', 'ASP-500', 'Antalgique antipyrétique', 'Bayer', '500mg', 'comprimé', 75, 150, 400, 80, '2027-03-15', 'LOT2024-003', FALSE, TRUE),
(1, 3, 1, 2, 'Paracétamol Sirop Enfant', 'PARA-SIR-120', 'Antalgique pour enfants', 'Pharma Kids', '120mg/5ml', 'ml', 800, 1500, 100, 20, '2026-09-30', 'LOT2024-004', FALSE, TRUE),

-- ANTIBIOTIQUES (category_id = 2)
(2, 1, 1, 3, 'Amoxicilline', 'AMOX-500', 'Antibiotique à large spectre', 'Antibio Plus', '500mg', 'comprimé', 200, 400, 200, 50, '2026-08-30', 'LOT2024-005', TRUE, TRUE),
(2, 2, 1, 3, 'Azithromycine', 'AZI-250', 'Macrolide antibactérien', 'MediPharma', '250mg', 'gélule', 300, 600, 150, 30, '2026-11-20', 'LOT2024-006', TRUE, TRUE),
(2, 1, 1, 3, 'Ciprofloxacine', 'CIPRO-500', 'Fluoroquinolone', 'Pharma SA', '500mg', 'comprimé', 350, 700, 100, 30, '2027-02-28', 'LOT2024-007', TRUE, TRUE),
(2, 3, 2, 2, 'Amoxicilline Suspension', 'AMOX-SUS-250', 'Antibiotique enfant', 'Antibio Kids', '250mg/5ml', 'ml', 1200, 2000, 80, 20, '2025-12-31', 'LOT2024-008', TRUE, TRUE),

-- ANTI-INFLAMMATOIRES (category_id = 3)
(3, 1, 1, 3, 'Diclofénac', 'DICLO-50', 'Anti-inflammatoire non stéroïdien', 'MediPharma', '50mg', 'comprimé', 150, 300, 250, 50, '2026-10-15', 'LOT2024-009', FALSE, TRUE),
(3, 4, 2, 6, 'Diclofénac Injectable', 'DICLO-INJ-75', 'AINS injectable', 'Pharma SA', '75mg/3ml', 'ampoule', 500, 1000, 100, 25, '2026-07-30', 'LOT2024-010', TRUE, TRUE),
(3, 6, 1, 5, 'Ibuprofène Gel', 'IBU-GEL-5', 'Anti-inflammatoire topique', 'TopPharma', '5%', 'tube', 800, 1500, 60, 15, '2027-01-31', 'LOT2024-011', FALSE, TRUE),

-- ANTIPALUDÉENS (category_id = 4)
(4, 1, 1, 3, 'Artéméther/Luméfantrine', 'COARTEM-20-120', 'Traitement paludisme', 'Novartis', '20/120mg', 'comprimé', 800, 1500, 200, 50, '2026-12-31', 'LOT2024-012', FALSE, TRUE),
(4, 1, 1, 3, 'Quinine', 'QUIN-300', 'Antipaludique', 'Pharma SA', '300mg', 'comprimé', 250, 500, 300, 60, '2027-06-30', 'LOT2024-013', FALSE, TRUE),
(4, 4, 2, 6, 'Artésunate Injectable', 'ARTE-INJ-60', 'Paludisme grave', 'MediPharma', '60mg', 'ampoule', 1500, 3000, 80, 20, '2026-05-31', 'LOT2024-014', TRUE, TRUE),

-- ANTIHYPERTENSEURS (category_id = 5)
(5, 1, 1, 3, 'Amlodipine', 'AMLO-5', 'Inhibiteur calcique', 'CardioMed', '5mg', 'comprimé', 100, 200, 400, 80, '2027-03-31', 'LOT2024-015', TRUE, TRUE),
(5, 1, 1, 3, 'Enalapril', 'ENA-10', 'IEC antihypertenseur', 'Pharma SA', '10mg', 'comprimé', 150, 300, 350, 70, '2026-11-30', 'LOT2024-016', TRUE, TRUE),
(5, 1, 1, 3, 'Hydrochlorothiazide', 'HYDRO-25', 'Diurétique thiazidique', 'MediPharma', '25mg', 'comprimé', 80, 150, 500, 100, '2027-04-30', 'LOT2024-017', TRUE, TRUE),

-- ANTIDIABÉTIQUES (category_id = 6)
(6, 1, 1, 3, 'Metformine', 'METF-500', 'Antidiabétique oral', 'DiabetCare', '500mg', 'comprimé', 120, 250, 600, 100, '2027-02-28', 'LOT2024-018', TRUE, TRUE),
(6, 1, 1, 3, 'Glibenclamide', 'GLIB-5', 'Hypoglycémiant oral', 'Pharma SA', '5mg', 'comprimé', 100, 200, 400, 80, '2026-12-31', 'LOT2024-019', TRUE, TRUE),
(6, 4, 2, 7, 'Insuline NPH', 'INSU-NPH-100', 'Insuline intermédiaire', 'Novo Nordisk', '100UI/ml', 'flacon', 3000, 5000, 50, 15, '2026-08-31', 'LOT2024-020', TRUE, TRUE),

-- VITAMINES (category_id = 7)
(7, 1, 1, 3, 'Vitamine C', 'VIT-C-500', 'Acide ascorbique', 'VitaHealth', '500mg', 'comprimé', 50, 100, 800, 150, '2027-12-31', 'LOT2024-021', FALSE, TRUE),
(7, 2, 1, 3, 'Multivitamines', 'MULTI-VIT', 'Complexe vitaminique', 'HealthPlus', 'Multi', 'gélule', 200, 400, 500, 100, '2027-06-30', 'LOT2024-022', FALSE, TRUE),
(7, 3, 1, 2, 'Vitamine D3 Gouttes', 'VIT-D3-400', 'Cholécalciférol', 'Pharma Kids', '400UI/goutte', 'ml', 1000, 2000, 100, 25, '2026-10-31', 'LOT2024-023', FALSE, TRUE),
(7, 1, 1, 3, 'Fer + Acide Folique', 'FER-FOL-60', 'Supplément fer', 'PreNatal', '60mg+400μg', 'comprimé', 150, 300, 400, 80, '2027-05-31', 'LOT2024-024', FALSE, TRUE),

-- ANTISEPTIQUES (category_id = 8)
(8, 7, 1, 2, 'Bétadine Solution', 'BETA-SOL-10', 'Antiseptique polyvidone iodée', 'Betadine', '10%', 'ml', 2000, 3500, 80, 20, '2027-08-31', 'LOT2024-025', FALSE, TRUE),
(8, 7, 1, 2, 'Alcool à 70°', 'ALC-70', 'Désinfectant', 'MediSupply', '70%', 'ml', 500, 1000, 200, 50, '2028-12-31', 'LOT2024-026', FALSE, TRUE),
(8, 7, 1, 5, 'Gel Hydroalcoolique', 'GEL-HYDRO', 'Désinfectant mains', 'CleanHands', '75%', 'ml', 800, 1500, 150, 40, '2027-10-31', 'LOT2024-027', FALSE, TRUE),
(8, 6, 1, 5, 'Pommade Antibiotique', 'POM-ANTI', 'Néomycine + Bacitracine', 'TopPharma', '3.5mg/500UI', 'tube', 600, 1200, 100, 25, '2026-09-30', 'LOT2024-028', FALSE, TRUE),

-- AUTRES MÉDICAMENTS COURANTS
(1, 7, 1, 2, 'Sérum Physiologique', 'SER-PHYS', 'Solution saline isotonique', 'MediSupply', '0.9%', 'ml', 300, 500, 300, 60, '2028-12-31', 'LOT2024-029', FALSE, TRUE),
(3, 9, 1, 2, 'Spray Nasal Décongestionnant', 'SPRAY-NEZ', 'Oxymétazoline', 'RhinoCare', '0.05%', 'ml', 800, 1500, 80, 20, '2026-07-31', 'LOT2024-030', FALSE, TRUE),
(1, 8, 1, 2, 'Gouttes Auriculaires', 'GOUT-ORE', 'Antipyocyaniques', 'EarCare', 'Multi', 'ml', 700, 1400, 60, 15, '2026-11-30', 'LOT2024-031', FALSE, TRUE),
(3, 1, 1, 3, 'Prednisolone', 'PRED-5', 'Corticoïde anti-inflammatoire', 'Pharma SA', '5mg', 'comprimé', 200, 400, 200, 40, '2027-01-31', 'LOT2024-032', TRUE, TRUE),
(2, 1, 1, 3, 'Métronidazole', 'METRO-250', 'Antibactérien antiparasitaire', 'MediPharma', '250mg', 'comprimé', 150, 300, 300, 60, '2026-12-31', 'LOT2024-033', FALSE, TRUE),
(1, 1, 1, 3, 'Tramadol', 'TRAM-50', 'Antalgique opioïde', 'PainRelief', '50mg', 'comprimé', 300, 600, 150, 30, '2026-10-31', 'LOT2024-034', TRUE, TRUE);

-- Insertion de quelques fournisseurs exemples
INSERT INTO suppliers (name, contact_person, phone, email, address, notes, is_active) VALUES
('Pharma Distribution SARL', 'Jean Kouassi', '+225 07 12 34 56 78', 'contact@pharmadist.ci', 'Zone Industrielle, Abidjan', 'Fournisseur principal médicaments génériques', TRUE),
('MediImport International', 'Marie Diallo', '+225 05 98 76 54 32', 'info@mediimport.com', 'Boulevard de la République, Abidjan', 'Importateur spécialisé antibiotiques', TRUE),
('GrossoPharma', 'Amadou Traoré', '+225 01 23 45 67 89', 'ventes@grossopharma.ci', 'Plateau, Abidjan', 'Grossiste médicaments et dispositifs médicaux', TRUE),
('BioPharma Supply', 'Fatou Camara', '+225 07 88 99 00 11', 'contact@biopharma.ci', 'Cocody, Abidjan', 'Spécialiste produits biologiques et vaccins', TRUE),
('Centrale d\'Achat Médical', 'Dr. Kouadio', '+225 05 44 55 66 77', 'achat@centralemed.ci', 'Marcory, Abidjan', 'Centrale d\'achat publique', TRUE);
