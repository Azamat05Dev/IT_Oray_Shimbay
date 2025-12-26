// Bookings routes
const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { authMiddleware } = require('../middleware/auth');

// Create booking
router.post('/', bookingsController.createBooking);

// Get booking by ID
router.get('/:id', bookingsController.getBookingById);

// Get user bookings (requires auth)
router.get('/user/my-bookings', authMiddleware, bookingsController.getUserBookings);

// Update booking status
router.patch('/:id/status', authMiddleware, bookingsController.updateBookingStatus);

// Process payment
router.post('/:id/payment', bookingsController.processPayment);

// Cancel booking
router.post('/:id/cancel', authMiddleware, bookingsController.cancelBooking);

module.exports = router;
