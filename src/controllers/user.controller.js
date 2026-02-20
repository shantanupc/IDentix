const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const { generateHash } = require('../services/hash.service');
const { storeHashOnBlockchain, getHashFromBlockchain } = require('../services/blockchain.service');

// Get user data by user_id
const getUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return errorResponse(res, 'User ID is required');
    }
    
    // Find user in database
    const user = await User.findOne({ user_id });
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Password is automatically excluded by User model toJSON method
    return successResponse(res, 'User data retrieved', user);
    
  } catch (error) {
    return errorResponse(res, `Failed to retrieve user: ${error.message}`, 500);
  }
};

// Store hash on blockchain
const storeHash = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return errorResponse(res, 'User ID is required');
    }
    
    // Find user in database
    const user = await User.findOne({ user_id });
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Generate hash from user data
    const hash = generateHash(user.toObject());
    
    // Check if hash already exists on blockchain
    try {
      const existingHash = await getHashFromBlockchain(user_id);
      
      // If hash exists and is not empty, return existing
      if (existingHash && existingHash !== '' && existingHash !== '0x') {
        return successResponse(res, 'Hash already exists on blockchain', {
          user_id,
          hash,
          existingHash,
          alreadyStored: true,
          message: 'No new transaction created to save gas'
        });
      }
    } catch (error) {
      // Hash doesn't exist yet, continue to store
      console.log('Hash not found on blockchain, proceeding to store');
    }
    
    // Store on blockchain
    const blockchainResult = await storeHashOnBlockchain(user_id, hash);
    
    return successResponse(res, 'Hash stored on blockchain', {
      user_id,
      hash,
      transactionHash: blockchainResult.transactionHash,
      blockNumber: blockchainResult.blockNumber,
      alreadyStored: false
    });
    
  } catch (error) {
    return errorResponse(res, `Failed to store hash: ${error.message}`, 500);
  }
};

module.exports = { getUser, storeHash };
