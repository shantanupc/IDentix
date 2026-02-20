const crypto = require('crypto');

// Generate SHA-256 hash from user data object
const generateHash = (userData) => {
  // Extract only the fields that should be hashed (exclude password and role)
  const dataToHash = {
    user_id: userData.user_id,
    name: userData.name,
    age: userData.age,
    id_type: userData.id_type,
    id_number: userData.id_number,
    additional_attributes: userData.additional_attributes || {}
  };

  // Convert to sorted JSON string for consistency (deterministic)
  const sortedKeys = Object.keys(dataToHash).sort();
  const sortedData = {};
  sortedKeys.forEach(key => {
    sortedData[key] = dataToHash[key];
  });

  const dataString = JSON.stringify(sortedData);

  // Generate SHA-256 hash
  const hash = crypto.createHash('sha256').update(dataString).digest('hex');

  return hash;
};

// Generate dynamic hash for time-bound QR verification
// dynamic_hash = SHA256(original_hash + ':' + timestamp)
const generateDynamicHash = (originalHash, timestamp) => {
  // Concatenate original hash with colon delimiter and timestamp (as strings)
  // Using colon delimiter prevents structural ambiguity during concatenation
  const dataToHash = String(originalHash) + ":" + String(timestamp);

  // Generate SHA-256 hash
  const dynamicHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

  return dynamicHash;
};

module.exports = { generateHash, generateDynamicHash };
