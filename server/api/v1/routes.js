const authHandler = require('../middleware/authHandler');
const router = require('express').Router();
const moment  = require('moment');
const package = require('../../package.json');

const authentication = require(`./authentication`);
const user = require(`./users`)

router.use(
  `/authentication`, 
  authentication
);

router.use(
  `/users`, 
  authHandler.authorizeRequest(),
  user
)

// set health handler
router.get(`/health`, (req, res) => {
  res.json({
    name: package.name,
    description: package.description,
    version: package.version,
    timestamp: moment().unix()
  })
});

module.exports = router;

