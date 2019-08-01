import express from 'express';
const router = express.Router();
import ExstorageController from './exstorage.controller';

router.post('/', ExstorageController.upload);
router.get('/:contractAddress', ExstorageController.download);
router.get('/', ExstorageController.verify);

export default router;
