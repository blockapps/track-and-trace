const express = require('express');
const router = express.Router();
const controller = require('./assets.controller');

router.get('/', controller.getAssets);
router.get('/:sku', controller.getAsset);
router.post('/', controller.createAsset);
router.post('/handleEvent', controller.handleAssetEvent);
router.post('/transferOwnership', controller.transferOwnership);


module.exports = router;
