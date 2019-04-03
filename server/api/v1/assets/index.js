import express from 'express';
const router = express.Router();
import AssetsController from './assets.controller';

router.get('/', AssetsController.getAssets);
router.get('/:sku', AssetsController.getAsset);
router.post('/', AssetsController.createAsset);
router.post('/handleEvent', AssetsController.handleAssetEvent);
router.post('/transferOwnership', AssetsController.transferOwnership);

export default router;
