import express from 'express';
const router = express.Router();
import AuthenticationController from './authentication.controller';
import authHandler from '../../middleware/authHandler';
import asyncHandler from '../../middleware/asyncHandler';

/**
 * route for oauth flow
 */
router.get('/callback', asyncHandler(AuthenticationController.callback));
router.get('/logout', authHandler.authorizeRequest(), AuthenticationController.logout);

export default router;
