const db = require('../config/database');

exports.getHealthCenter = async (req, res) => {
  try {
    const [centers] = await db.query('SELECT * FROM health_center LIMIT 1');

    if (centers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune information de centre de santé trouvée.'
      });
    }

    res.json({
      success: true,
      data: centers[0]
    });
  } catch (error) {
    console.error('Get health center error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations du centre.'
    });
  }
};

exports.updateHealthCenter = async (req, res) => {
  try {
    const { name, contact, email, address, city, logo_url } = req.body;

    // Vérifier s'il existe déjà un enregistrement
    const [existing] = await db.query('SELECT id FROM health_center LIMIT 1');

    if (existing.length === 0) {
      // Créer
      await db.query(
        `INSERT INTO health_center (name, contact, email, address, city, logo_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, contact, email, address, city, logo_url]
      );
    } else {
      // Mettre à jour
      await db.query(
        `UPDATE health_center
         SET name = ?, contact = ?, email = ?, address = ?, city = ?, logo_url = ?
         WHERE id = ?`,
        [name, contact, email, address, city, logo_url, existing[0].id]
      );
    }

    res.json({
      success: true,
      message: 'Informations du centre mises à jour avec succès.'
    });
  } catch (error) {
    console.error('Update health center error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des informations.'
    });
  }
};
