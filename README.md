# Universal Identity Verification Backend

Blockchain-Based Universal Identity Verification System using Ethereum Sepolia Testnet and MongoDB Atlas

## Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **Blockchain**: Ethereum Sepolia Testnet
- **Web3 Library**: Ethers.js v6
- **Password Security**: Bcrypt
- **Hashing**: SHA-256 for identity data

## Architecture

### Key Features
- **No MetaMask Required**: All blockchain interactions handled by backend wallet
- **No User Wallets Needed**: Users don't need crypto wallets
- **Secure Data Storage**: Personal data in MongoDB, only hash on blockchain
- **QR Code Security**: QR contains only `user_id` and `hash` (no personal data)
- **Universal Support**: Students, employees, drivers, hotel guests, etc.

### What's Stored Where
**MongoDB Atlas**:
- user_id
- username (hashed password)
- name, age
- id_type, id_number
- additional_attributes
- role (user/verifier)

**Ethereum Blockchain**:
- user_id
- SHA-256 hash of user data

**QR Code** (Static):
- user_id
- hash

**QR Code** (Dynamic - Time-Bound):
- user_id
- timestamp (Unix seconds)
- dynamic_hash = SHA256(original_hash + timestamp)

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create/update `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/identity_verification?retryWrites=true&w=majority
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

### 3. Seed Database with Demo Data
```bash
npm run seed
```

This creates:
- **3 demo users** (rahul, priya, amit)
- **2 demo verifiers** (admin, hod)

### 4. Start Server
```bash
npm start
```

## Demo Credentials

### Users (password: 1234)
- **rahul** - Student (CS2021_001)
- **priya** - Employee (EMP_2024_456)
- **amit** - Driver (DL_MH12_2020_789)

### Verifiers
- **admin** / admin123 (Full Access)
- **hod** / hod123 (Department Access)

## API Endpoints

### 1. POST /auth/login
Login for users and verifiers using bcrypt-hashed passwords.

**Request:**
```json
{
  "username": "rahul",
  "password": "1234"
}
```

**Response (User):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "role": "user",
    "user_id": "USER_001",
    "name": "Rahul Sharma"
  }
}
```

**Response (Verifier):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "role": "verifier",
    "verifier_id": "VERIFIER_001",
    "name": "Admin Verifier"
  }
}
```

### 2. GET /user/:user_id
Fetch user data (excludes password automatically)

**Response:**
```json
{
  "success": true,
  "message": "User data retrieved",
  "data": {
    "user_id": "USER_001",
    "username": "rahul",
    "name": "Rahul Sharma",
    "age": 21,
    "id_type": "Student ID",
    "id_number": "CS2021_001",
    "additional_attributes": {
      "department": "Computer Science",
      "stream": "Engineering",
      "year": "Third Year",
      "semester": "6"
    },
    "role": "user"
  }
}
```

### 3. POST /user/store-hash
Store user hash on blockchain. Automatically prevents duplicate storage.

**Request:**
```json
{
  "user_id": "USER_001"
}
```

**Response (New Hash):**
```json
{
  "success": true,
  "message": "Hash stored on blockchain",
  "data": {
    "user_id": "USER_001",
    "hash": "a1b2c3d4e5f6...",
    "transactionHash": "0x123abc...",
    "blockNumber": 12345678,
    "alreadyStored": false
  }
}
```

**Response (Already Stored):**
```json
{
  "success": true,
  "message": "Hash already exists on blockchain",
  "data": {
    "user_id": "USER_001",
    "hash": "a1b2c3d4e5f6...",
    "existingHash": "a1b2c3d4e5f6...",
    "alreadyStored": true,
    "message": "No new transaction created to save gas"
  }
}
```

### 4. POST /verify
Verify QR code data with 3-step validation process

**Request:**
```json
{
  "user_id": "USER_001",
  "scanned_hash": "a1b2c3d4e5f6..."
}
```

**Verification Process:**
1. **Step 1**: Compare `scanned_hash` with recomputed hash from DB
   - Detects: QR code tampering
2. **Step 2**: Fetch hash from blockchain
   - Detects: User not registered
3. **Step 3**: Compare recomputed hash with blockchain hash
   - Detects: Database tampering

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "verified": true,
    "reason": "All verification checks passed",
    "user_id": "USER_001",
    "userName": "Rahul Sharma",
    "recomputedHash": "a1b2c3d4e5f6...",
    "blockchainHash": "a1b2c3d4e5f6...",
    "scannedHash": "a1b2c3d4e5f6...",
    "details": "User identity verified successfully"
  }
}
```

**Response (QR Tampered):**
```json
{
  "success": true,
  "message": "Verification failed",
  "data": {
    "verified": false,
    "reason": "QR code has been tampered with",
    "user_id": "USER_001",
    "userName": "Rahul Sharma",
    "details": "The hash in the QR code does not match the current user data"
  }
}
```

**Response (Not Registered):**
```json
{
  "success": true,
  "message": "Verification failed",
  "data": {
    "verified": false,
    "reason": "User not registered on blockchain",
    "user_id": "USER_001",
    "userName": "Rahul Sharma",
    "details": "User hash has not been stored on blockchain yet"
  }
}
```

**Response (Database Tampered):**
```json
{
  "success": true,
  "message": "Verification failed",
  "data": {
    "verified": false,
    "reason": "Database tampering detected",
    "user_id": "USER_001",
    "userName": "Rahul Sharma",
    "details": "Current user data does not match the blockchain record"
  }
}
```

### 5. POST /verify-timestamp
Time-bound dynamic QR verification with 60-second expiry. Prevents replay attacks.

**QR Code Format:**
```json
{
  "user_id": "USER_001",
  "timestamp": 1735148293,
  "dynamic_hash": "sha256(original_hash + ':' + timestamp)"
}
```

**Request:**
```json
{
  "user_id": "USER_001",
  "timestamp": 1735148293,
  "dynamic_hash": "a1b2c3d4e5f6..."
}
```

**Verification Process:**
1. **Step 1**: Validate required fields (user_id, timestamp, dynamic_hash)
2. **Step 2**: Check expiry (current_time - timestamp > 60 seconds)
   - Detects: Expired QR code
3. **Step 3**: Fetch original hash from blockchain
   - Detects: User not registered
4. **Step 4**: Recompute expected dynamic hash
   - `expectedDynamicHash = SHA256(original_hash + ':' + timestamp)`
5. **Step 5**: Compare dynamic hashes
   - Detects: QR tampering

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "verified": true,
    "reason": "Time-bound identity verification successful",
    "user_id": "USER_001",
    "userName": "Rahul Sharma",
    "timestamp": 1735148293,
    "currentTime": 1735148295,
    "timeRemaining": 58,
    "details": "Dynamic QR code verified successfully within validity period"
  }
}
```

**Response (Expired):**
```json
{
  "success": true,
  "message": "Verification failed",
  "data": {
    "verified": false,
    "reason": "QR code expired",
    "user_id": "USER_001",
    "userName": "Rahul Sharma",
    "timestamp": 1735148200,
    "currentTime": 1735148293,
    "timeDifference": 93,
    "details": "QR code has exceeded 60-second validity period"
  }
}
```

**Response (Tampered):**
```json
{
  "success": true,
  "message": "Verification failed",
  "data": {
    "verified": false,
    "reason": "QR code has been tampered with",
    "user_id": "USER_001",
    "userName": "Rahul Sharma",
    "timestamp": 1735148293,
    "details": "The dynamic hash in the QR code does not match the expected value"
  }
}
```

### 6. GET /health
Health check endpoint

## Security Features

1. **Password Hashing**: All passwords stored as bcrypt hashes
2. **No Password Exposure**: User model automatically excludes password from responses
3. **Blockchain Gas Optimization**: Checks existing hash before storing
4. **3-Step Verification**: Detects QR tampering, registration status, and database tampering separately
5. **Time-Bound Dynamic QR**: 60-second expiry prevents replay attacks
6. **Backend-Only Blockchain**: Users don't need wallets or MetaMask
7. **Secure QR Codes**: Static and dynamic options, no personal data exposed

## Hash Generation Logic

### Static Hash (Blockchain Storage)
Generated deterministically from:
```javascript
{
  user_id,
  name,
  age,
  id_type,
  id_number,
  additional_attributes
}
```

**Excluded from hash:**
- password
- role
- timestamps

**Keys are sorted** before hashing to ensure deterministic output.

### Dynamic Hash (Time-Bound QR)
Generated for each QR code:
```javascript
dynamic_hash = SHA256(original_hash + ':' + timestamp)
```

Where:
- `original_hash` = blockchain-stored hash
- `:` = colon delimiter (prevents structural ambiguity)
- `timestamp` = Unix timestamp in seconds

**Note:** Dynamic hash uses colon (`:`) delimiter to prevent structural ambiguity during concatenation.
- `timestamp` = Unix timestamp in seconds
- Concatenated as strings before hashing

**Expiry:** 60 seconds from timestamp

## Smart Contract Requirements

Your Solidity contract must have:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityVerification {
    mapping(string => string) private userHashes;
    
    function storeHash(string memory userId, string memory hash) public {
        userHashes[userId] = hash;
    }
    
    function getHash(string memory userId) public view returns (string memory) {
        return userHashes[userId];
    }
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── auth.routes.js       # Login routes
│   │   ├── user.routes.js       # User CRUD routes
│   │   └── verify.routes.js     # Verification routes
│   ├── controllers/
│   │   ├── auth.controller.js   # Login logic
│   │   ├── user.controller.js   # User operations
│   │   └── verify.controller.js # Verification logic
│   ├── services/
│   │   ├── hash.service.js      # SHA-256 hashing
│   │   └── blockchain.service.js # Ethers.js integration
│   ├── middleware/
│   │   └── validation.js        # Input validation
│   ├── utils/
│   │   └── response.js          # Response helpers
│   └── server.js                # Express server
├── seed.js                      # Database seeding script
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Deployment

### Railway Deployment
1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard:
   - `MONGODB_URI`
   - `RPC_URL`
   - `PRIVATE_KEY`
   - `CONTRACT_ADDRESS`
4. Run seed command once: `npm run seed`
5. Deploy

### MongoDB Atlas Setup
1. Create cluster at mongodb.com
2. Add database user
3. Whitelist Railway IP or use 0.0.0.0/0
4. Copy connection string to `MONGODB_URI`

### Infura Setup
1. Create project at infura.io
2. Select Sepolia network
3. Copy RPC URL

### Wallet Setup
1. Create Ethereum wallet
2. Get Sepolia ETH from faucet
3. Export private key (keep secure!)
4. Add to `PRIVATE_KEY` env variable

## Testing Flow

1. **Login as User**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rahul","password":"1234"}'
```

2. **Get User Data**
```bash
curl http://localhost:3000/user/USER_001
```

3. **Store Hash on Blockchain**
```bash
curl -X POST http://localhost:3000/user/store-hash \
  -H "Content-Type: application/json" \
  -d '{"user_id":"USER_001"}'
```

4. **Verify Identity (Static QR)**
```bash
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{"user_id":"USER_001","scanned_hash":"<hash_from_step_3>"}'
```

5. **Verify Identity (Dynamic QR - Time-Bound)**
```bash
# Generate dynamic hash first: SHA256(blockchain_hash + timestamp)
curl -X POST http://localhost:3000/verify-timestamp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"USER_001",
    "timestamp":1735148293,
    "dynamic_hash":"<dynamic_hash>"
  }'
```

---

**Backend ready for Railway deployment with MongoDB Atlas integration.**
