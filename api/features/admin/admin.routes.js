const express = require('express');
const router = express.Router();
const Booking = require('../bookings/bookings.model');
const User = require('../users/userModel');
const auth = require('../../middleware/auth');

// Get all professionals
router.get('/professionals', auth, async (req, res) => {
  try {
    // This is a simplified example - in a real app, you'd have a professionals collection
    const professionals = [
      { _id: 'developmental-pediatrician', name: 'Developmental Pediatrician' },
      { _id: 'occupational-therapist', name: 'Occupational Therapist' },
      { _id: 'speech-language-pathologist', name: 'Speech & Language Pathologist' }
    ];
    
    res.json(professionals);
  } catch (error) {
    console.error('Error fetching professionals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a walk-in booking (no user account needed)
router.post('/walk-in-booking', auth, async (req, res) => {
  try {
    // Extract booking data from request body
    const {
      serviceType,
      branchLocation,
      guardianName,
      guardianRelation,
      otherRelationship,
      guardianEmail,
      guardianPhone,
      guardianAddress,
      childName,
      childBirthday,
      appointmentDate,
      selectedTime,
      selectedProfessional
    } = req.body;

    // Validate required fields
    if (!serviceType || !branchLocation || !guardianName || !guardianRelation || 
        !guardianEmail || !guardianPhone || !childName || !childBirthday || 
        !appointmentDate || !selectedTime || !selectedProfessional) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the selected time slot is available (respect online vs non-online)
    const baseQuery = {
      appointmentDate,
      selectedTime,
      status: { $ne: 'cancelled' },
      assessmentDeleted: { $ne: true }
    };

    // Admin can double-book non-online; only block if it's an Online Consultation conflict
    const existingBooking = await Booking.findOne(
      serviceType === 'Online Consultation'
        ? { ...baseQuery, serviceType: 'Online Consultation' }
        : null
    );

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // For online consultation, verify it's a Saturday
    if (serviceType === 'Online Consultation') {
      const bookingDate = new Date(appointmentDate);
      if (bookingDate.getDay() !== 6) { // 0 is Sunday, 6 is Saturday
        return res.status(400).json({ message: 'Online consultations are only available on Saturdays' });
      }
    }

    // Calculate child's age
    const birthDate = new Date(childBirthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    const monthAge = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
    const childAge = `${age} years, ${monthAge} months`;

    // Normalize guardian relation values to match schema
    // Allowed by schema: 'Mother','Father','Grandmother','Grandfather','Guardian','Other'
    let normalizedRelation = guardianRelation;
    if (guardianRelation === 'Legal Guardian') normalizedRelation = 'Guardian';
    if (guardianRelation === 'Grandparent') normalizedRelation = 'Guardian';

    // Create a new booking (user is required by schema)
    const newBooking = new Booking({
      user: req.userId,
      serviceType,
      branchLocation,
      guardianName,
      guardianRelation: normalizedRelation === 'Other' ? 'Other' : normalizedRelation,
      otherRelationship: normalizedRelation === 'Other' ? (otherRelationship || '') : '',
      guardianEmail,
      guardianPhone,
      guardianAddress,
      childName,
      childBirthday,
      childAge,
      appointmentDate: new Date(appointmentDate),
      selectedTime,
      selectedProfessional,
      status: 'scheduled',
      paymentStatus: 'pending'
    });

    // Save the booking
    await newBooking.save();

    // Return success response
    res.status(201).json({
      message: 'Walk-in booking created successfully',
      booking: newBooking
    });
  } catch (error) {
    console.error('Error creating walk-in booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 