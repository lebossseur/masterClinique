const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active,
              r.id as role_id, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Utilisateur invalide.'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé.'
      });
    }

    if (!roles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit. Permissions insuffisantes.'
      });
    }

    next();
  };
};

module.exports = { auth, authorize };
