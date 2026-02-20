const { ethers } = require('ethers');
require('dotenv').config();

// Simple ABI for hash storage contract
// Assumes contract has: storeHash(string userId, string hash) and getHash(string userId) returns (string)
const CONTRACT_ABI = [
  "function storeHash(string memory userId, string memory hash) public",
  "function getHash(string memory userId) public view returns (string memory)"
];

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Store hash on blockchain
const storeHashOnBlockchain = async (userId, hash) => {
  try {
    const tx = await contract.storeHash(userId, hash);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    throw new Error(`Blockchain storage failed: ${error.message}`);
  }
};

// Retrieve hash from blockchain
const getHashFromBlockchain = async (userId) => {
  try {
    const hash = await contract.getHash(userId);
    return hash;
  } catch (error) {
    throw new Error(`Blockchain retrieval failed: ${error.message}`);
  }
};

module.exports = {
  storeHashOnBlockchain,
  getHashFromBlockchain
};
