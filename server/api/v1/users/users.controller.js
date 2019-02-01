const co = require('co');

const { common } = require('blockapps-rest');
const { config, util } = common;

const dappJs = require(`${process.cwd()}/${config.dappPath}/dapp/dapp`);

const userController = {
  me: (req, res, next) => {
    const { app, accessToken, decodedToken } = req;
    const deploy = app.get('deploy');
    const username = decodedToken['email'];

    co(function* () {
      const dapp = yield dappJs.bind(accessToken, deploy.contract);
      const user = yield dapp.getUser(username);
      util.response.status200(res, user);
    })
    .catch(next);
  },

  createUser(req, res, next) {
    const { app, accessToken, body } = req;
    const args = { ...body };

    const deploy = app.get('deploy');

    co(function* () {
      const dapp = yield dappJs.bind(accessToken, deploy.contract);
      const asset = yield dapp.createUser(args);
      util.response.status200(res, asset);
    })
    .catch(next);
  },
}

module.exports = userController;