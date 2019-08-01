import express from 'express';
const router = express.Router();

import moment from 'moment';
import authHandler from '../middleware/authHandler';
import packages from '../../package.json';

import authentication from './authentication';
import user from './users';
import assets from './assets';
import bids from './bids';
import constants from './constants';
import exstorage from './exstorage';

router.use(
  `/authentication`,
  authentication
);

router.use(
  `/users`,
  authHandler.authorizeRequest(),
  user
)

router.use(
  `/assets`,
  authHandler.authorizeRequest(),
  assets
);

router.use(
  `/bids`,
  authHandler.authorizeRequest(),
  bids
);

router.use(
  `/constants`,
  constants
);

router.use(
    `/exstorage`,
    authHandler.authorizeRequest(),
    exstorage
);


// set health handler
router.get(`/health`, (req, res) => {
  res.json({
    name: packages.name,
    description: packages.description,
    version: packages.version,
    timestamp: moment().unix()
  })
});

export default router;

