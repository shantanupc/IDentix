const bcrypt = require('bcrypt');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

// Login endpoint
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return errorResponse(res, 'Username and password are required');
    }
    
    // Find user by username (includes password for verification)
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    
    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    
    // Check if verifier or user
    if (user.role === 'verifier') {
      return successResponse(res, 'Login successful', {
        role: 'verifier',
        verifier_id: user.user_id,
        name: user.name
      });
    } else {
      return successResponse(res, 'Login successful', {
        role: 'user',
        user_id: user.user_id,
        name: user.name
      });
    }
    
  } catch (error) {
    return errorResponse(res, `Login failed: ${error.message}`, 500);
  }
};

module.exports = { login };
