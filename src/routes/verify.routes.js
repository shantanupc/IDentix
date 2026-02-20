const express = require('express');
const { verifyIdentity, verifyTimestamp } = require('../controllers/verify.controller');

const router = express.Router();

// POST /verify - Static hash verification
router.post('/', verifyIdentity);

// POST /verify-timestamp - Time-bound dynamic QR verification
router.post('/timestamp', verifyTimestamp);

module.exports = router;
