const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { validateRegister, validateLogin, validateProfileUpdate } = require('./userValidation');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('./userController');

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected routes
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, validateProfileUpdate, updateUserProfile);

module.exports = router; 