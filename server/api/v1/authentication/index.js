const express = require('express');
const router = express.Router();
const controller = require('./authentication.controller');
const authHandler = require('../../middleware/authHandler');
const asyncHandler = require('../../middleware/asyncHandler');
/**
 * route for oauth flow
 */
router.get('/callback', asyncHandler(controller.callback));
router.get('/logout', authHandler.authorizeRequest(), controller.logout);

module.exports = router;
