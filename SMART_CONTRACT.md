# SMART CONTRACT SPECIFICATION

## Contract Requirements for Identity Verification System

Your Solidity smart contract must implement the following interface:

### Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityVerification {
    // Mapping to store user hashes: userId => hash
    mapping(string => string) private userHashes;
    
    // Event emitted when a hash is stored
    event HashStored(string userId, string hash, address indexed storer);
    
    // Store hash for a user
    function storeHash(string memory userId, string memory hash) public {
        userHashes[userId] = hash;
        emit HashStored(userId, hash, msg.sender);
    }
    
    // Retrieve hash for a user
    function getHash(string memory userId) public view returns (string memory) {
        return userHashes[userId];
    }
}
```

### ABI Required in Backend

The backend expects these two functions:

```javascript
const CONTRACT_ABI = [
  "function storeHash(string memory userId, string memory hash) public",
  "function getHash(string memory userId) public view returns (string memory)"
];
```

### Deployment Instructions

1. **Deploy to Sepolia Testnet**
   - Use Remix IDE or Hardhat
   - Network: Ethereum Sepolia
   - Get test ETH from Sepolia faucet

2. **After Deployment**
   - Copy contract address
   - Add to `.env` as `CONTRACT_ADDRESS`

3. **Backend Wallet**
   - Create/use Ethereum wallet
   - Fund with Sepolia ETH
   - Export private key
   - Add to `.env` as `PRIVATE_KEY`

### Important Notes

- The contract uses `string` type for both userId and hash
- Only the backend wallet will call `storeHash()` 
- The `getHash()` function is read-only (view)
- Users do NOT interact with blockchain directly
- Users do NOT need wallets or MetaMask
