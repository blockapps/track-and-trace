const co = require('co');

const { common } = require('blockapps-rest');
const { util, cwd } = common;

const constants = require(`${cwd}/constants`);

const assetsController = {
  getConstants: (req, res) => {
    util.response.status200(res, constants);
  },
}

module.exports = assetsController;
