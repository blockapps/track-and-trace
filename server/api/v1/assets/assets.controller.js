const co = require('co');

const { common } = require('blockapps-rest');
const { config, util } = common;

const dappJs = require(`${process.cwd()}/${config.dappPath}/dapp/dapp`);
const encodingHelpers = require(`../../../helpers/encoding`);


const assetsController = {
  getAssets: (req, res, next) => {
    const { app, accessToken, query } = req;
    const args = { ...query };

    const deploy = app.get('deploy');

    co(function* () {
      const dapp = yield dappJs.bind(accessToken, deploy.contract);
      const assets = yield dapp.getAssets(args);
      util.response.status200(res, assets);
    })
    .catch(next);
  },

  // TODO: throw errors correctly from dapp
  createAsset: (req, res, next) => {
    const { app, accessToken, body } = req;
    const args = { ...body.asset };

    if(
      !Array.isArray(args.keys) 
      || !Array.isArray(args.values)
      || args.keys.length !== args.values.length 
    ) {
      util.response.status400('Missing spec or bad spec format');
      next();
    }

    const deploy = app.get('deploy');

    co(function* () {
      const dapp = yield dappJs.bind(accessToken, deploy.contract);
      const asset = yield dapp.createAsset(args);
      util.response.status200(res, asset);
    })
    .catch(next);
  }
}

module.exports = assetsController;
