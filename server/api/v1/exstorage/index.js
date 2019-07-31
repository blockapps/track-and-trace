import express from 'express';
const router = express.Router();
import ExstorageController from './exstorage.controller';

router.post('/', ExstorageController.upload);
router.get('/', ExstorageController.getAll);

export default router;
