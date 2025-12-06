const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active,
              u.created_at, r.name as role_name, r.description as role_description
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs.'
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active,
              u.created_at, u.updated_at, r.id as role_id, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [req.params.id]
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
    console.error('Get user by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur.'
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role, role_id } = req.body;

    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis.'
      });
    }

    // Si role est fourni (nom du rôle), chercher le role_id
    let finalRoleId = role_id;
    if (role && !role_id) {
      const [roles] = await db.query('SELECT id FROM roles WHERE name = ?', [role]);
      if (roles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Rôle invalide.'
        });
      }
      finalRoleId = roles[0].id;
    }

    if (!finalRoleId) {
      return res.status(400).json({
        success: false,
        message: 'Le rôle est requis.'
      });
    }

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Nom d\'utilisateur ou email déjà existant.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (username, email, password, first_name, last_name, role_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, first_name, last_name, finalRoleId]
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur.'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role, role_id, is_active } = req.body;

    // Si role est fourni (nom du rôle), chercher le role_id
    let finalRoleId = role_id;
    if (role && !role_id) {
      const [roles] = await db.query('SELECT id FROM roles WHERE name = ?', [role]);
      if (roles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Rôle invalide.'
        });
      }
      finalRoleId = roles[0].id;
    }

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, req.params.id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Nom d\'utilisateur ou email déjà existant.'
      });
    }

    // Si un mot de passe est fourni, le mettre à jour aussi
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE users SET username = ?, email = ?, password = ?, first_name = ?, last_name = ?,
         role_id = ?, is_active = ? WHERE id = ?`,
        [username, email, hashedPassword, first_name, last_name, finalRoleId, is_active !== false, req.params.id]
      );
    } else {
      // Pas de mise à jour du mot de passe
      await db.query(
        `UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?,
         role_id = ?, is_active = ? WHERE id = ?`,
        [username, email, first_name, last_name, finalRoleId, is_active !== false, req.params.id]
      );
    }

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur.'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur.'
    });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const [roles] = await db.query('SELECT name FROM roles ORDER BY name');

    // Retourner un tableau de noms de rôles (strings uniquement)
    const roleNames = roles.map(role => role.name);

    res.json({
      success: true,
      data: roleNames
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rôles.'
    });
  }
};
