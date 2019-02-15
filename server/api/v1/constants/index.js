const express = require('express');
const router = express.Router();
const controller = require('./constants.controller');

router.get('', controller.getConstants);

module.exports = router;
