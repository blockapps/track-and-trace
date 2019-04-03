import express from 'express';
const router = express.Router();
import UserController from './users.controller';

router.get('/me', UserController.me);
router.post('/', UserController.createUser);

export default router;