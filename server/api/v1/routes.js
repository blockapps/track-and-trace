const authHandler = require('../middleware/authHandler');
const router = require('express').Router();
const moment = require('moment');
import packages from '../../package.json';

const authentication = require(`./authentication`);
const user = require(`./users`)
const assets = require(`./assets`);
const bids = require(`./bids`);
const constants = require(`./constants`);

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

// set health handler
router.get(`/health`, (req, res) => {
  res.json({
    name: packages.name,
    description: packages.description,
    version: packages.version,
    timestamp: moment().unix()
  })
});

module.exports = router;

