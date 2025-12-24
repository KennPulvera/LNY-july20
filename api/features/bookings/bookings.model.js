const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // User Reference (optional - for guest bookings)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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
    enum: [
      'naga-blumentritt',
      'naga-delrosario',
      'legazpi',
      'daet',
      'guinobatan',
      'polangui',
      'daraga',
      'tabaco',
      'sorsogon',
      'iriga',
      'catanduanes',
      'masbate',
      'irosin',
      // Legacy values for backward compatibility
      'blumentritt',
      'delrosario'
    ]
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

// Enforce uniqueness differently for online vs non-online services
// 1) Branch-based services (non-online): index per branch/date/time (not unique to allow admin double-booking)
bookingSchema.index(
  {
    appointmentDate: 1,
    selectedTime: 1,
    branchLocation: 1
  },
  {
    partialFilterExpression: {
      status: { $ne: 'cancelled' },
      serviceType: { $ne: 'Online Consultation' }
    },
    name: 'idx_branch_time_non_online'
  }
);

// 2) Online Consultation: unique globally per date/time (ignore branch)
bookingSchema.index(
  {
    appointmentDate: 1,
    selectedTime: 1,
    serviceType: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: { $ne: 'cancelled' },
      serviceType: 'Online Consultation'
    },
    name: 'unique_online_time_global'
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