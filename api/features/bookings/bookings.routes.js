const express = require('express');
const router = express.Router();
const bookingsController = require('./bookings.controller');
const { validateBooking } = require('./bookings.validation');
const auth = require('../../middleware/auth');

// Create a new booking (requires authentication)
router.post('/', auth, validateBooking, bookingsController.createBooking);

// Get all bookings (admin)
router.get('/', bookingsController.getAllBookings);

// Get bookings by branch
router.get('/branch/:branch', bookingsController.getBookingsByBranch);

// Get a single booking
router.get('/:id', bookingsController.getBookingById);

// Update booking status
router.patch('/:id/status', bookingsController.updateBookingStatus);

// Update payment status
router.patch('/:id/payment', bookingsController.updatePaymentStatus);

// Update booking details
router.put('/:id', bookingsController.updateBooking);

// Reschedule booking (admin only)
router.patch('/:id/reschedule', bookingsController.rescheduleBooking);

// Delete booking
router.delete('/:id', bookingsController.deleteBooking);

// Get available time slots for a date
router.get('/availability/:date', bookingsController.getAvailableTimeSlots);

module.exports = router; 