const bcrypt = require('bcryptjs');
const db = require('../config/database');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un nom d\'utilisateur et un mot de passe.'
      });
    }

    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.password, u.first_name, u.last_name, u.is_active,
              r.id as role_id, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = ? OR u.email = ?`,
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Nom d\'utilisateur ou mot de passe incorrect.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Nom d\'utilisateur ou mot de passe incorrect.'
      });
    }

    const token = generateToken(user.id);

    delete user.password;

    res.json({
      success: true,
      message: 'Connexion réussie.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion.'
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name,
              r.id as role_id, r.name as role_name, r.description as role_description
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations utilisateur.'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir l\'ancien et le nouveau mot de passe.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères.'
      });
    }

    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe.'
    });
  }
};
