import { rest, util } from 'blockapps-rest';

const constants = require(`${util.cwd}/constants`);

const assetsController = {
  getConstants: (req, res) => {
    rest.response.status200(res, constants);
  },
}

module.exports = assetsController;
