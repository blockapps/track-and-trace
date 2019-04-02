import { rest, util } from 'blockapps-rest';

const constants = require(`${util.cwd}/constants`);

const constantsController = {
  getConstants: async (req, res) => {
    rest.response.status200(res, await constants.getConstants());
  },
}

module.exports = constantsController;
