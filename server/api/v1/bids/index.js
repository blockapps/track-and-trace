import express from 'express';
const router = express.Router();
import BidsController from './bids.controller';

router.post('/', BidsController.createBid);
router.get('/', BidsController.list);
router.get('/:address', BidsController.get);
router.post('/:address/event', BidsController.handleEvent);

export default router;
