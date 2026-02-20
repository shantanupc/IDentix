const express = require('express');
const { getUser, storeHash } = require('../controllers/user.controller');

const router = express.Router();

// GET /user/:user_id
router.get('/:user_id', getUser);

// POST /user/store-hash
router.post('/store-hash', storeHash);

module.exports = router;
