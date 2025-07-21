const { body, validationResult } = require('express-validator');

exports.validateBooking = [
  // Guardian validation
  body('guardianName')
    .trim()
    .notEmpty().withMessage('Guardian name is required')
    .isLength({ min: 2 }).withMessage('Guardian name must be at least 2 characters'),
  
  body('guardianEmail')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('guardianPhone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^09[0-9]{9}$/).withMessage('Phone number must be in format 09XXXXXXXXX'),
  
  body('guardianRelation')
    .notEmpty().withMessage('Relationship to child is required')
    .isIn(['Mother', 'Father', 'Grandmother', 'Grandfather', 'Guardian', 'Other'])
    .withMessage('Invalid relationship type'),
  
  // Child validation
  body('childName')
    .trim()
    .notEmpty().withMessage('Child name is required')
    .isLength({ min: 2 }).withMessage('Child name must be at least 2 characters'),
  
  body('childBirthday')
    .notEmpty().withMessage('Child birthday is required')
    .isISO8601().withMessage('Invalid date format'),
  
  // Branch and appointment validation
  body('branchLocation')
    .notEmpty().withMessage('Branch location is required')
    .isIn(['blumentritt', 'delrosario']).withMessage('Invalid branch location'),
  
  body('appointmentDate')
    .notEmpty().withMessage('Appointment date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  
  body('selectedTime')
    .notEmpty().withMessage('Appointment time is required')
    .isIn(['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'])
    .withMessage('Invalid time slot'),
  
  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
]; 