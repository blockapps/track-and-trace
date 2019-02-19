const express = require('express');
const router = express.Router();
const controller = require('./assets.controller');

router.get('/', controller.getAssets);
router.post('/', controller.createAsset);
router.post('/handleEvent', controller.handleAssetEvent);

module.exports = router;
