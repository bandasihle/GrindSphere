const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth.routes');
const serviceRoutes = require('./services.routes');
const bookingRoutes = require('./bookings.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/api/services', serviceRoutes);
router.use('/api/bookings', bookingRoutes);

module.exports = router;