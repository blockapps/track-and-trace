
const { common } = require('blockapps-rest');
const { config, util } = common;

const userController = {
  me: (req, res, next) => {
    // TODO: query user contract and return details from chain
    util.response.status200(res, req.decodedToken);
  }
}

module.exports = userController;