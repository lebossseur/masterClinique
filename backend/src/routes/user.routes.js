const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('ADMIN', 'SUPERVISOR'), userController.getAllUsers);
router.get('/roles', auth, authorize('ADMIN'), userController.getAllRoles);
router.get('/:id', auth, authorize('ADMIN', 'SUPERVISOR'), userController.getUserById);
router.post('/', auth, authorize('ADMIN'), userController.createUser);
router.put('/:id', auth, authorize('ADMIN'), userController.updateUser);
router.delete('/:id', auth, authorize('ADMIN'), userController.deleteUser);

module.exports = router;
