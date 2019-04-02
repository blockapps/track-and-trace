import express from 'express';
const router = express.Router();
import controller from './constants.controller';

router.get('', controller.getConstants);

module.exports = router;
