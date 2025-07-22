const Booking = require('./bookings.model');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { appointmentDate, selectedTime, branchLocation } = req.body;
    
    // Validate that the time slot is not already booked
    const existingBooking = await Booking.findOne({
      appointmentDate: {
        $gte: new Date(appointmentDate),
        $lt: new Date(new Date(appointmentDate).getTime() + 24 * 60 * 60 * 1000)
      },
      selectedTime: selectedTime,
      branchLocation: branchLocation,
      status: { $ne: 'cancelled' } // Exclude cancelled bookings
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please select a different time.',
        conflictDetails: {
          date: appointmentDate,
          time: selectedTime,
          branch: branchLocation
        }
      });
    }
    
    const bookingData = {
      ...req.body,
      user: req.userId // Add user reference from auth middleware
    };
    
    const booking = new Booking(bookingData);
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    // Handle specific MongoDB duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please select a different time.'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get bookings by branch
exports.getBookingsByBranch = async (req, res) => {
  try {
    const { branch } = req.params;
    const bookings = await Booking.find({ branchLocation: branch }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.json({
      success: true,
      message: 'Booking status updated',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const updateData = {
      paymentStatus: req.body.paymentStatus,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference,
      paymentDate: req.body.paymentDate,
      paymentAmount: req.body.paymentAmount,
      accountName: req.body.accountName,
      updatedAt: Date.now()
    };
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.json({
      success: true,
      message: 'Payment status updated',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update booking details
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available time slots
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { date } = req.params;
    const { branch } = req.query;
    
    // Get all bookings for the specified date and branch
    const existingBookings = await Booking.find({
      appointmentDate: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      },
      branchLocation: branch,
      status: { $ne: 'cancelled' }
    });
    
    // Define all available time slots
    const allTimeSlots = [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];
    
    // Get booked time slots
    const bookedSlots = existingBookings.map(booking => booking.selectedTime);
    
    // Return available slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({
      success: true,
      date: date,
      branch: branch,
      availableSlots: availableSlots,
      bookedSlots: bookedSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 

// Reschedule booking
exports.rescheduleBooking = async (req, res) => {
  try {
    const { appointmentDate, selectedTime, adminNotes, reason } = req.body;
    const bookingId = req.params.id;

    // Validate required fields
    if (!appointmentDate || !selectedTime) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date and time are required'
      });
    }

    // Check if the new date is not in the past
    const newDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newDate < today) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date cannot be in the past'
      });
    }

    // Find the existing booking
    const existingBooking = await Booking.findById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the new time slot is available for the same branch
    const conflictingBookings = await Booking.find({
      appointmentDate: {
        $gte: new Date(appointmentDate),
        $lt: new Date(new Date(appointmentDate).getTime() + 24 * 60 * 60 * 1000)
      },
      branchLocation: existingBooking.branchLocation,
      selectedTime: selectedTime,
      status: { $ne: 'cancelled' },
      _id: { $ne: bookingId } // Exclude current booking
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'The selected time slot is already booked for this branch'
      });
    }

    // Store original appointment details for tracking
    const originalDate = existingBooking.appointmentDate;
    const originalTime = existingBooking.selectedTime;

    // Add to reschedule history
    const rescheduleEntry = {
      fromDate: originalDate,
      fromTime: originalTime,
      toDate: new Date(appointmentDate),
      toTime: selectedTime,
      rescheduledAt: new Date(),
      reason: reason || 'Admin rescheduled',
      rescheduledBy: 'admin'
    };

    // Update the booking with new schedule and add to history
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        appointmentDate: new Date(appointmentDate),
        selectedTime: selectedTime,
        adminNotes: adminNotes || existingBooking.adminNotes,
        status: 'scheduled', // Mark as scheduled after rescheduling
        $push: { rescheduleHistory: rescheduleEntry },
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: updatedBooking,
      rescheduleInfo: {
        fromDate: originalDate,
        fromTime: originalTime,
        toDate: new Date(appointmentDate),
        toTime: selectedTime,
        rescheduledAt: new Date(),
        reason: reason || 'Admin rescheduled',
        totalReschedules: updatedBooking.rescheduleHistory.length
      }
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 