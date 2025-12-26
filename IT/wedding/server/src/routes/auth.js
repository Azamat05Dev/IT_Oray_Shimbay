// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Send OTP code
router.post('/send-code', authController.sendCode);

// Verify OTP code & login/register
router.post('/verify-code', authController.verifyCode);

// Get current user
router.get('/me', authController.getCurrentUser);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
