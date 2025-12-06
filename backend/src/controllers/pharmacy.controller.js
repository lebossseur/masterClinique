const db = require('../config/database');

exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT pp.*, pc.name as category_name
       FROM pharmacy_products pp
       LEFT JOIN pharmacy_categories pc ON pp.category_id = pc.id
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
      `SELECT pp.*, pc.name as category_name
       FROM pharmacy_products pp
       LEFT JOIN pharmacy_categories pc ON pp.category_id = pc.id
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
      category_id, name, code, description, manufacturer, dosage, unit,
      unit_price, selling_price, quantity_in_stock, reorder_level,
      expiry_date, requires_prescription
    } = req.body;

    if (!name || !code || !unit_price || !selling_price) {
      return res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont requis.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO pharmacy_products (category_id, name, code, description, manufacturer,
       dosage, unit, unit_price, selling_price, quantity_in_stock, reorder_level,
       expiry_date, requires_prescription)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name, code, description, manufacturer, dosage, unit,
       unit_price, selling_price, quantity_in_stock, reorder_level,
       expiry_date, requires_prescription]
    );

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit.'
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      category_id, name, code, description, manufacturer, dosage, unit,
      unit_price, selling_price, quantity_in_stock, reorder_level,
      expiry_date, is_active, requires_prescription
    } = req.body;

    await db.query(
      `UPDATE pharmacy_products SET category_id = ?, name = ?, code = ?, description = ?,
       manufacturer = ?, dosage = ?, unit = ?, unit_price = ?, selling_price = ?,
       quantity_in_stock = ?, reorder_level = ?, expiry_date = ?, is_active = ?,
       requires_prescription = ? WHERE id = ?`,
      [category_id, name, code, description, manufacturer, dosage, unit,
       unit_price, selling_price, quantity_in_stock, reorder_level,
       expiry_date, is_active, requires_prescription, req.params.id]
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

exports.createSale = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      sale_number, patient_id, sale_date, sale_time, subtotal,
      tax_amount, discount_amount, total_amount, payment_method,
      notes, items
    } = req.body;

    if (!sale_number || !sale_date || !total_amount || !payment_method || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont requis.'
      });
    }

    const [result] = await connection.query(
      `INSERT INTO pharmacy_sales (sale_number, patient_id, sale_date, sale_time,
       subtotal, tax_amount, discount_amount, total_amount, payment_method, notes, sold_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sale_number, patient_id, sale_date, sale_time, subtotal, tax_amount,
       discount_amount, total_amount, payment_method, notes, req.user.id]
    );

    const saleId = result.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO pharmacy_sale_items (sale_id, product_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [saleId, item.product_id, item.quantity, item.unit_price, item.total_price]
      );

      const [product] = await connection.query(
        'SELECT quantity_in_stock FROM pharmacy_products WHERE id = ?',
        [item.product_id]
      );

      const previousQuantity = product[0].quantity_in_stock;
      const newQuantity = previousQuantity - item.quantity;

      await connection.query(
        'UPDATE pharmacy_products SET quantity_in_stock = ? WHERE id = ?',
        [newQuantity, item.product_id]
      );

      await connection.query(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_quantity,
         new_quantity, reference_type, reference_id, created_by)
         VALUES (?, 'OUT', ?, ?, ?, 'SALE', ?, ?)`,
        [item.product_id, item.quantity, previousQuantity, newQuantity, saleId, req.user.id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Vente enregistrée avec succès.',
      data: { id: saleId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la vente.'
    });
  } finally {
    connection.release();
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const [sales] = await db.query(
      `SELECT ps.*,
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as sold_by_name
       FROM pharmacy_sales ps
       LEFT JOIN patients p ON ps.patient_id = p.id
       LEFT JOIN users u ON ps.sold_by = u.id
       ORDER BY ps.created_at DESC`
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
