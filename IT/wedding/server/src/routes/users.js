// Users routes (admin)
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, usersController.getAllUsers);

// Get user by ID
router.get('/:id', authMiddleware, usersController.getUserById);

// Update user
router.patch('/:id', authMiddleware, usersController.updateUser);

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, usersController.deleteUser);

module.exports = router;
