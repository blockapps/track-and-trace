const express = require('express');
const router = express.Router();
const controller = require('./assets.controller');

router.get('/', controller.getAssets);
router.get('/:sku', controller.getAsset);
router.get('/:sku/history', controller.getHistory);
router.post('/', controller.createAsset);
router.post('/handleEvent', controller.handleAssetEvent);


module.exports = router;
