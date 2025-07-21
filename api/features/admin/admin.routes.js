const express = require('express');
const router = express.Router();

// Simple admin authentication
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Check against environment variables or hardcoded values
  if (email === 'test@gmail.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Admin authenticated successfully',
      token: 'dummy-admin-token' // In production, use JWT
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

module.exports = router; 