const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');

router.post('/', bookingsController.createBooking);
router.get('/', bookingsController.getBookings);
router.delete('/:id', bookingsController.deleteBooking);

module.exports = router;