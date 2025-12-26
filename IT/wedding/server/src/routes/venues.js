// Venues routes
const express = require('express');
const router = express.Router();
const venuesController = require('../controllers/venuesController');

// Get all venues
router.get('/', venuesController.getAllVenues);

// Get venue by ID or slug
router.get('/:idOrSlug', venuesController.getVenueById);

// Get venue availability (calendar)
router.get('/:id/availability', venuesController.getVenueAvailability);

// Get venue halls
router.get('/:id/halls', venuesController.getVenueHalls);

// Get venue menu
router.get('/:id/menu', venuesController.getVenueMenu);

// Get venue decorations
router.get('/:id/decorations', venuesController.getVenueDecorations);

module.exports = router;
