const express = require('express');
const router = express.Router();
const controller = require('./assets.controller');

router.get('/', controller.getAssets);
router.post('/', controller.createAsset);

module.exports = router;
