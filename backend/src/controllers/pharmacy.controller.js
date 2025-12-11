const db = require('../config/database');

// ==================== PRODUITS ====================

exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT pp.*,
              pc.name as category_name,
              mt.name as medication_type,
              st.name as storage_type,
              st.temperature_range,
              pt.name as packaging_type
       FROM pharmacy_products pp
       LEFT JOIN pharmacy_categories pc ON pp.category_id = pc.id
       LEFT JOIN medication_types mt ON pp.medication_type_id = mt.id
       LEFT JOIN storage_types st ON pp.storage_type_id = st.id
       LEFT JOIN packaging_types pt ON pp.packaging_type_id = pt.id
       ORDER BY pp.name ASC`
    );

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits.'
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT pp.*,
              pc.name as category_name,
              mt.name as medication_type,
              st.name as storage_type,
              st.temperature_range,
              pt.name as packaging_type
       FROM pharmacy_products pp
       LEFT JOIN pharmacy_categories pc ON pp.category_id = pc.id
       LEFT JOIN medication_types mt ON pp.medication_type_id = mt.id
       LEFT JOIN storage_types st ON pp.storage_type_id = st.id
       LEFT JOIN packaging_types pt ON pp.packaging_type_id = pt.id
       WHERE pp.id = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé.'
      });
    }

    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit.'
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      category_id, medication_type_id, storage_type_id, packaging_type_id,
      name, code, description, manufacturer, dosage, unit,
      unit_price, selling_price, quantity_in_stock, reorder_level,
      expiry_date, batch_number, requires_prescription
    } = req.body;

    if (!name || !code || !unit_price || !selling_price) {
      return res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont requis.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO pharmacy_products (
        category_id, medication_type_id, storage_type_id, packaging_type_id,
        name, code, description, manufacturer, dosage, unit,
        unit_price, selling_price, quantity_in_stock, reorder_level,
        expiry_date, batch_number, requires_prescription
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, medication_type_id, storage_type_id, packaging_type_id,
       name, code, description, manufacturer, dosage, unit,
       unit_price, selling_price, quantity_in_stock || 0, reorder_level || 10,
       expiry_date, batch_number, requires_prescription || false]
    );

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Un produit avec ce code existe déjà.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit.'
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      category_id, medication_type_id, storage_type_id, packaging_type_id,
      name, code, description, manufacturer, dosage, unit,
      unit_price, selling_price, quantity_in_stock, reorder_level,
      expiry_date, batch_number, is_active, requires_prescription
    } = req.body;

    await db.query(
      `UPDATE pharmacy_products SET
        category_id = ?, medication_type_id = ?, storage_type_id = ?, packaging_type_id = ?,
        name = ?, code = ?, description = ?, manufacturer = ?, dosage = ?, unit = ?,
        unit_price = ?, selling_price = ?, quantity_in_stock = ?, reorder_level = ?,
        expiry_date = ?, batch_number = ?, is_active = ?, requires_prescription = ?
       WHERE id = ?`,
      [category_id, medication_type_id, storage_type_id, packaging_type_id,
       name, code, description, manufacturer, dosage, unit,
       unit_price, selling_price, quantity_in_stock, reorder_level,
       expiry_date, batch_number, is_active, requires_prescription, req.params.id]
    );

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit.'
    });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT pp.*, pc.name as category_name
       FROM pharmacy_products pp
       LEFT JOIN pharmacy_categories pc ON pp.category_id = pc.id
       WHERE pp.quantity_in_stock <= pp.reorder_level AND pp.is_active = true
       ORDER BY pp.quantity_in_stock ASC`
    );

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits en rupture.'
    });
  }
};

exports.getExpiredProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT pp.*, pc.name as category_name
       FROM pharmacy_products pp
       LEFT JOIN pharmacy_categories pc ON pp.category_id = pc.id
       WHERE pp.expiry_date <= CURDATE() AND pp.is_active = true
       ORDER BY pp.expiry_date ASC`
    );

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get expired products error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits périmés.'
    });
  }
};

exports.getOutOfStockProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT pp.*, pc.name as category_name
       FROM pharmacy_products pp
       LEFT JOIN pharmacy_categories pc ON pp.category_id = pc.id
       WHERE pp.quantity_in_stock = 0 AND pp.is_active = true
       ORDER BY pp.name ASC`
    );

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get out of stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits en rupture de stock.'
    });
  }
};

// ==================== ENTRÉES DE STOCK ====================

exports.getAllStockEntries = async (req, res) => {
  try {
    const [entries] = await db.query(
      `SELECT se.*,
              s.name as supplier_name,
              CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
              COUNT(sei.id) as items_count
       FROM stock_entries se
       LEFT JOIN suppliers s ON se.supplier_id = s.id
       LEFT JOIN users u ON se.created_by = u.id
       LEFT JOIN stock_entry_items sei ON se.id = sei.stock_entry_id
       GROUP BY se.id
       ORDER BY se.entry_date DESC, se.created_at DESC`
    );

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Get all stock entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entrées de stock.'
    });
  }
};

exports.getStockEntryById = async (req, res) => {
  try {
    const [entries] = await db.query(
      `SELECT se.*,
              s.name as supplier_name,
              s.phone as supplier_phone,
              CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM stock_entries se
       LEFT JOIN suppliers s ON se.supplier_id = s.id
       LEFT JOIN users u ON se.created_by = u.id
       WHERE se.id = ?`,
      [req.params.id]
    );

    if (entries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Entrée de stock non trouvée.'
      });
    }

    const [items] = await db.query(
      `SELECT sei.*, pp.name as product_name, pp.code as product_code
       FROM stock_entry_items sei
       JOIN pharmacy_products pp ON sei.product_id = pp.id
       WHERE sei.stock_entry_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...entries[0],
        items
      }
    });
  } catch (error) {
    console.error('Get stock entry by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'entrée de stock.'
    });
  }
};

exports.createStockEntry = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      entry_number, entry_type, supplier_id, entry_date,
      invoice_number, total_amount, notes, items
    } = req.body;

    if (!entry_number || !entry_type || !entry_date || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont requis.'
      });
    }

    // Créer l'entrée de stock
    const [result] = await connection.query(
      `INSERT INTO stock_entries (
        entry_number, entry_type, supplier_id, entry_date,
        invoice_number, total_amount, notes, created_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [entry_number, entry_type, supplier_id, entry_date,
       invoice_number, total_amount, notes, req.user.id]
    );

    const entryId = result.insertId;

    // Créer les items et mettre à jour les stocks
    for (const item of items) {
      await connection.query(
        `INSERT INTO stock_entry_items (
          stock_entry_id, product_id, quantity, unit_cost, total_cost,
          batch_number, expiry_date
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [entryId, item.product_id, item.quantity, item.unit_cost, item.total_cost,
         item.batch_number, item.expiry_date]
      );

      // Récupérer le stock actuel
      const [product] = await connection.query(
        'SELECT quantity_in_stock FROM pharmacy_products WHERE id = ?',
        [item.product_id]
      );

      const previousQuantity = product[0].quantity_in_stock;
      const newQuantity = previousQuantity + item.quantity;

      // Mettre à jour le stock
      await connection.query(
        'UPDATE pharmacy_products SET quantity_in_stock = ? WHERE id = ?',
        [newQuantity, item.product_id]
      );

      // Enregistrer le mouvement de stock
      await connection.query(
        `INSERT INTO stock_movements (
          product_id, movement_type, quantity, previous_quantity,
          new_quantity, reference_type, reference_id, created_by
         ) VALUES (?, 'IN', ?, ?, ?, 'ENTRY', ?, ?)`,
        [item.product_id, item.quantity, previousQuantity, newQuantity, entryId, req.user.id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Entrée de stock enregistrée avec succès.',
      data: { id: entryId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create stock entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de l\'entrée de stock.'
    });
  } finally {
    connection.release();
  }
};

// ==================== SORTIES DE STOCK ====================

exports.getAllStockExits = async (req, res) => {
  try {
    const [exits] = await db.query(
      `SELECT sex.*,
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
              COUNT(sexi.id) as items_count
       FROM stock_exits sex
       LEFT JOIN patients p ON sex.patient_id = p.id
       LEFT JOIN users u ON sex.created_by = u.id
       LEFT JOIN stock_exit_items sexi ON sex.id = sexi.stock_exit_id
       GROUP BY sex.id
       ORDER BY sex.exit_date DESC, sex.created_at DESC`
    );

    res.json({
      success: true,
      data: exits
    });
  } catch (error) {
    console.error('Get all stock exits error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sorties de stock.'
    });
  }
};

exports.getStockExitById = async (req, res) => {
  try {
    const [exits] = await db.query(
      `SELECT sex.*,
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              p.phone as patient_phone,
              CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM stock_exits sex
       LEFT JOIN patients p ON sex.patient_id = p.id
       LEFT JOIN users u ON sex.created_by = u.id
       WHERE sex.id = ?`,
      [req.params.id]
    );

    if (exits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sortie de stock non trouvée.'
      });
    }

    const [items] = await db.query(
      `SELECT sexi.*, pp.name as product_name, pp.code as product_code
       FROM stock_exit_items sexi
       JOIN pharmacy_products pp ON sexi.product_id = pp.id
       WHERE sexi.stock_exit_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...exits[0],
        items
      }
    });
  } catch (error) {
    console.error('Get stock exit by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la sortie de stock.'
    });
  }
};

exports.createStockExit = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      exit_number, exit_type, patient_id, exit_date,
      total_amount, reason, notes, items
    } = req.body;

    if (!exit_number || !exit_type || !exit_date || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont requis.'
      });
    }

    // Créer la sortie de stock
    const [result] = await connection.query(
      `INSERT INTO stock_exits (
        exit_number, exit_type, patient_id, exit_date,
        total_amount, reason, notes, created_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [exit_number, exit_type, patient_id, exit_date,
       total_amount, reason, notes, req.user.id]
    );

    const exitId = result.insertId;

    // Créer les items et mettre à jour les stocks
    for (const item of items) {
      await connection.query(
        `INSERT INTO stock_exit_items (
          stock_exit_id, product_id, quantity, unit_price, total_price,
          batch_number, expiry_date
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [exitId, item.product_id, item.quantity, item.unit_price || 0, item.total_price || 0,
         item.batch_number, item.expiry_date]
      );

      // Récupérer le stock actuel
      const [product] = await connection.query(
        'SELECT quantity_in_stock FROM pharmacy_products WHERE id = ?',
        [item.product_id]
      );

      const previousQuantity = product[0].quantity_in_stock;
      const newQuantity = previousQuantity - item.quantity;

      if (newQuantity < 0) {
        throw new Error(`Stock insuffisant pour le produit ID ${item.product_id}`);
      }

      // Mettre à jour le stock
      await connection.query(
        'UPDATE pharmacy_products SET quantity_in_stock = ? WHERE id = ?',
        [newQuantity, item.product_id]
      );

      // Enregistrer le mouvement de stock
      await connection.query(
        `INSERT INTO stock_movements (
          product_id, movement_type, quantity, previous_quantity,
          new_quantity, reference_type, reference_id, created_by
         ) VALUES (?, 'OUT', ?, ?, ?, 'EXIT', ?, ?)`,
        [item.product_id, item.quantity, previousQuantity, newQuantity, exitId, req.user.id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Sortie de stock enregistrée avec succès.',
      data: { id: exitId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create stock exit error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'enregistrement de la sortie de stock.'
    });
  } finally {
    connection.release();
  }
};

// ==================== MOUVEMENTS DE STOCK ====================

exports.getStockMovements = async (req, res) => {
  try {
    const { product_id, start_date, end_date } = req.query;

    let query = `
      SELECT sm.*,
             pp.name as product_name,
             pp.code as product_code,
             CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM stock_movements sm
      JOIN pharmacy_products pp ON sm.product_id = pp.id
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (product_id) {
      query += ' AND sm.product_id = ?';
      params.push(product_id);
    }

    if (start_date) {
      query += ' AND DATE(sm.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(sm.created_at) <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY sm.created_at DESC LIMIT 1000';

    const [movements] = await db.query(query, params);

    res.json({
      success: true,
      data: movements
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des mouvements de stock.'
    });
  }
};

// ==================== FOURNISSEURS ====================

exports.getAllSuppliers = async (req, res) => {
  try {
    const [suppliers] = await db.query(
      'SELECT * FROM suppliers ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Get all suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fournisseurs.'
    });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du fournisseur est requis.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO suppliers (name, contact_person, phone, email, address, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, contact_person, phone, email, address, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Fournisseur créé avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du fournisseur.'
    });
  }
};

// ==================== DONNÉES DE RÉFÉRENCE ====================

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM pharmacy_categories ORDER BY name ASC');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des catégories.' });
  }
};

exports.getMedicationTypes = async (req, res) => {
  try {
    const [types] = await db.query('SELECT * FROM medication_types ORDER BY name ASC');
    res.json({ success: true, data: types });
  } catch (error) {
    console.error('Get medication types error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des types de médicaments.' });
  }
};

exports.getStorageTypes = async (req, res) => {
  try {
    const [types] = await db.query('SELECT * FROM storage_types ORDER BY name ASC');
    res.json({ success: true, data: types });
  } catch (error) {
    console.error('Get storage types error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des types de conservation.' });
  }
};

exports.getPackagingTypes = async (req, res) => {
  try {
    const [types] = await db.query('SELECT * FROM packaging_types ORDER BY name ASC');
    res.json({ success: true, data: types });
  } catch (error) {
    console.error('Get packaging types error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des types d\'emballage.' });
  }
};

// ==================== VENTES (compatibilité) ====================

exports.getAllSales = async (req, res) => {
  try {
    const [sales] = await db.query(
      `SELECT sex.*,
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as sold_by_name
       FROM stock_exits sex
       LEFT JOIN patients p ON sex.patient_id = p.id
       LEFT JOIN users u ON sex.created_by = u.id
       WHERE sex.exit_type = 'SALE'
       ORDER BY sex.created_at DESC`
    );

    res.json({
      success: true,
      data: sales
    });
  } catch (error) {
    console.error('Get all sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ventes.'
    });
  }
};

exports.createSale = async (req, res) => {
  // Rediriger vers createStockExit avec exit_type = 'SALE'
  req.body.exit_type = 'SALE';
  return exports.createStockExit(req, res);
};

// ==================== RAPPORTS DE VENTES ====================

exports.getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Validation des dates
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et de fin sont requises.'
      });
    }

    // Récupérer toutes les ventes avec leurs items
    const [sales] = await db.query(
      `SELECT
        sex.id,
        sex.exit_number,
        sex.exit_date,
        sex.total_amount,
        sex.reason,
        sex.notes,
        sex.created_at,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.id as patient_id,
        CONCAT(u.first_name, ' ', u.last_name) as sold_by_name,
        u.id as sold_by_id
       FROM stock_exits sex
       LEFT JOIN patients p ON sex.patient_id = p.id
       LEFT JOIN users u ON sex.created_by = u.id
       WHERE sex.exit_type = 'SALE'
       AND sex.exit_date BETWEEN ? AND ?
       ORDER BY sex.exit_date DESC, sex.created_at DESC`,
      [start_date, end_date]
    );

    // Pour chaque vente, récupérer les items
    for (let sale of sales) {
      const [items] = await db.query(
        `SELECT
          sei.id,
          sei.quantity,
          sei.unit_price,
          sei.total_price,
          sei.batch_number,
          sei.expiry_date,
          pp.id as product_id,
          pp.name as product_name,
          pp.code as product_code,
          pp.dosage,
          pp.unit,
          pc.name as category_name
         FROM stock_exit_items sei
         JOIN pharmacy_products pp ON sei.product_id = pp.id
         LEFT JOIN pharmacy_categories pc ON pp.category_id = pc.id
         WHERE sei.stock_exit_id = ?`,
        [sale.id]
      );
      sale.items = items;
    }

    // Calculer les statistiques
    const totalVentes = sales.length;
    const montantTotal = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

    // Grouper par produit pour voir les produits les plus vendus
    const productStats = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            product_id: item.product_id,
            product_name: item.product_name,
            product_code: item.product_code,
            category_name: item.category_name,
            total_quantity: 0,
            total_amount: 0,
            sales_count: 0
          };
        }
        productStats[item.product_id].total_quantity += item.quantity;
        productStats[item.product_id].total_amount += parseFloat(item.total_price);
        productStats[item.product_id].sales_count += 1;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10);

    // Grouper par date pour voir les ventes par jour
    const salesByDate = {};
    sales.forEach(sale => {
      const date = sale.exit_date;
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date: date,
          sales_count: 0,
          total_amount: 0
        };
      }
      salesByDate[date].sales_count += 1;
      salesByDate[date].total_amount += parseFloat(sale.total_amount);
    });

    const dailySales = Object.values(salesByDate).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        sales: sales,
        statistics: {
          total_sales: totalVentes,
          total_amount: montantTotal,
          average_sale: totalVentes > 0 ? montantTotal / totalVentes : 0,
          period: {
            start_date,
            end_date
          }
        },
        top_products: topProducts,
        daily_sales: dailySales
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport de ventes.'
    });
  }
};
