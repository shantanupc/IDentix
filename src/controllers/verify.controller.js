const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const { generateHash, generateDynamicHash } = require('../services/hash.service');
const { getHashFromBlockchain } = require('../services/blockchain.service');

// Verify QR code data (static hash verification)
const verifyIdentity = async (req, res) => {
  try {
    const { user_id, scanned_hash } = req.body;

    if (!user_id || !scanned_hash) {
      return errorResponse(res, 'User ID and scanned hash are required');
    }

    // Find user in database
    const user = await User.findOne({ user_id });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Recompute hash from current data
    const recomputedHash = generateHash(user.toObject());

    // Step 1: Compare scanned hash with recomputed hash (QR tampering check)
    if (scanned_hash !== recomputedHash) {
      return successResponse(res, 'Verification failed', {
        verified: false,
        reason: 'QR code has been tampered with',
        user_id,
        userName: user.name,
        recomputedHash,
        scannedHash: scanned_hash,
        details: 'The hash in the QR code does not match the current user data'
      });
    }

    // Step 2: Fetch hash from blockchain
    let blockchainHash;
    try {
      blockchainHash = await getHashFromBlockchain(user_id);
    } catch (error) {
      return successResponse(res, 'Verification failed', {
        verified: false,
        reason: 'User data not found on blockchain',
        user_id,
        userName: user.name,
        details: 'No hash has been stored on blockchain for this user'
      });
    }

    // Check if blockchain hash is empty
    if (!blockchainHash || blockchainHash === '' || blockchainHash === '0x') {
      return successResponse(res, 'Verification failed', {
        verified: false,
        reason: 'User not registered on blockchain',
        user_id,
        userName: user.name,
        details: 'User hash has not been stored on blockchain yet'
      });
    }

    // Step 3: Compare recomputed hash with blockchain hash (database tampering check)
    if (recomputedHash !== blockchainHash) {
      return successResponse(res, 'Verification failed', {
        verified: false,
        reason: 'Database tampering detected',
        user_id,
        userName: user.name,
        recomputedHash,
        blockchainHash,
        details: 'Current user data does not match the blockchain record'
      });
    }

    // All checks passed - verification successful
    return successResponse(res, 'Verification successful', {
      verified: true,
      reason: 'All verification checks passed',
      user_id,
      userName: user.name,
      recomputedHash,
      blockchainHash,
      scannedHash: scanned_hash,
      details: 'User identity verified successfully'
    });

  } catch (error) {
    return errorResponse(res, `Verification failed: ${error.message}`, 500);
  }
};

// Verify timestamp-based dynamic QR code (time-bound verification)
const verifyTimestamp = async (req, res) => {
  try {
    const { user_id, timestamp, dynamic_hash } = req.body;

    // Step 1: Validate request body
    if (!user_id || !timestamp || !dynamic_hash) {
      return errorResponse(res, 'user_id, timestamp, and dynamic_hash are required');
    }

    // Find user in database
    const user = await User.findOne({ user_id });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Step 2: Expiry check (60 seconds validity)
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
    const timeDifference = currentTime - timestamp;

    if (timeDifference > 60) {
      return successResponse(res, 'Verification failed', {
        verified: false,
        reason: 'QR code expired',
        user_id,
        userName: user.name,
        timestamp,
        currentTime,
        timeDifference,
        details: 'QR code has exceeded 60-second validity period'
      });
    }

    // Step 3: Fetch original hash from blockchain
    let originalHash;
    try {
      originalHash = await getHashFromBlockchain(user_id);
    } catch (error) {
      return successResponse(res, 'Verification failed', {
        verified: false,
        reason: 'User data not found on blockchain',
        user_id,
        userName: user.name,
        details: 'No hash has been stored on blockchain for this user'
      });
    }

    // Check if blockchain hash is empty
    if (!originalHash || originalHash === '' || originalHash === '0x') {
      return successResponse(res, 'Verification failed', {
        verified: false,
        reason: 'User not registered on blockchain',
        user_id,
        userName: user.name,
        details: 'User hash has not been stored on blockchain yet'
      });
    }

    // Step 4: Recompute expected dynamic hash
    // dynamic_hash = SHA256(original_hash + ':' + timestamp)
    const expectedDynamicHash = generateDynamicHash(originalHash, timestamp);

    // Step 5: Compare dynamic hashes
    if (expectedDynamicHash !== dynamic_hash) {
      return successResponse(res, 'Verification failed', {
        verified: false,
        reason: 'QR code has been tampered with',
        user_id,
        userName: user.name,
        timestamp,
        details: 'The dynamic hash in the QR code does not match the expected value'
      });
    }

    // All checks passed - time-bound verification successful
    return successResponse(res, 'Verification successful', {
      verified: true,
      reason: 'Time-bound identity verification successful',
      user_id,
      userName: user.name,
      timestamp,
      currentTime,
      timeRemaining: 60 - timeDifference,
      details: 'Dynamic QR code verified successfully within validity period'
    });

  } catch (error) {
    return errorResponse(res, `Verification failed: ${error.message}`, 500);
  }
};

module.exports = { verifyIdentity, verifyTimestamp };
