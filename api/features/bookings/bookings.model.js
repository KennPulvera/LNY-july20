const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Guardian Information
  guardianName: {
    type: String,
    required: true,
    trim: true
  },
  guardianEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  guardianPhone: {
    type: String,
    required: true,
    trim: true
  },
  guardianRelation: {
    type: String,
    required: true,
    enum: ['Mother', 'Father', 'Grandmother', 'Grandfather', 'Guardian', 'Other']
  },
  otherRelationship: {
    type: String,
    trim: true
  },
  guardianAddress: {
    type: String,
    trim: true
  },
  
  // Child Information
  childName: {
    type: String,
    required: true,
    trim: true
  },
  childBirthday: {
    type: Date,
    required: true
  },
  childAge: String,
  
  // Branch and Appointment Information
  branchLocation: {
    type: String,
    required: true,
    enum: ['blumentritt', 'delrosario']
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  selectedTime: {
    type: String,
    required: true
  },
  selectedProfessional: {
    type: String,
    trim: true
  },
  
  // Service Information
  serviceType: {
    type: String,
    default: 'Initial Assessment'
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'pending-verification', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    default: 2000
  },
  paymentMethod: String,
  paymentReference: String,
  paymentDate: Date,
  accountName: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Admin Notes
  adminNotes: String,
  
  // Reschedule tracking - array to store multiple reschedule history
  rescheduleHistory: [{
    fromDate: Date,
    fromTime: String,
    toDate: Date,
    toTime: String,
    rescheduledAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    rescheduledBy: String // Could be 'admin' or 'user'
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to prevent double booking for the same time slot
// This ensures no two active bookings can exist for the same date, time, and branch
bookingSchema.index(
  { 
    appointmentDate: 1, 
    selectedTime: 1, 
    branchLocation: 1 
  },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $ne: 'cancelled' } 
    },
    name: 'prevent_double_booking'
  }
);

// Virtual for formatted date
bookingSchema.virtual('formattedAppointmentDate').get(function() {
  return this.appointmentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 