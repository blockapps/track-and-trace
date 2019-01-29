const express = require('express');
const router = express.Router();
const controller = require('./users.controller');

router.get('/me', controller.me);

module.exports = router;