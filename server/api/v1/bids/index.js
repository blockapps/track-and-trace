const express = require('express');
const router = express.Router();
const controller = require('./bids.controller');

router.post('/', controller.createBid);
router.get('/', controller.list);
router.get('/:address', controller.get);
router.post('/:address/event', controller.handleEvent);

module.exports = router;
