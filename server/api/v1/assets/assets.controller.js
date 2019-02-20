const co = require('co');

const { common, rest6: rest } = require('blockapps-rest');
const { config, util } = common;

const dappJs = require(`${process.cwd()}/${config.dappPath}/dapp/dapp`);
const encodingHelpers = require(`../../../helpers/encoding`);
const AssetEvent = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetEvent.sol`).AssetEvent;
const bidJs = require(`${process.cwd()}/${config.dappPath}/bid/bid`);

const moment = require('moment');

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

  getAsset: (req, res,next) => {
    const { app, accessToken} = req;
    const sku = req.params.sku;

    if(!sku) {
      util.response.status400(res, 'Missing sku')
      return next();
    }

    const deploy = app.get('deploy');

    co(function* () {
      const dapp = yield dappJs.bind(accessToken, deploy.contract);
      const asset = yield dapp.getAsset(sku);
      const assetHistory = yield dapp.getAssetHistory(sku)
      const bidHistory = yield bidJs.getBidsHistory(accessToken, asset.address);

      const histories = [
        ...assetHistory.map(h => { return {...h, type: 'ASSET'}}),
        ...bidHistory.map(h => { return {...h, type: 'BID'}})
      ];

      asset.history = histories.sort( 
        (h1,h2) => moment(h1.block_timestamp).unix() - moment(h2.block_timestamp).unix() 
      )

      util.response.status200(res, asset);
    })
      .catch(next);
  },

  // TODO: throw errors correctly from dapp
  createAsset: (req, res, next) => {
    const { app, accessToken, body } = req;
    const args = { ...body.asset };

    if (
      !Array.isArray(args.keys)
      || !Array.isArray(args.values)
      || args.keys.length !== args.values.length
    ) {
      util.response.status400(res, 'Missing spec or bad spec format');
      return next();
    }

    const deploy = app.get('deploy');

    co(function* () {
      const dapp = yield dappJs.bind(accessToken, deploy.contract);
      const asset = yield dapp.createAsset(args);
      util.response.status200(res, asset);
    })
      .catch(next);
  },

  handleAssetEvent: (req, res, next) => {
    const { app, accessToken, body } = req;
    const { sku, assetEvent } = body;

    // Get sku and assetEvent
    const args = { sku, assetEvent: parseInt(assetEvent, 10) };

    const deploy = app.get('deploy');

    co(function* () {
      const dapp = yield dappJs.bind(accessToken, deploy.contract);
      const newState = yield dapp.handleAssetEvent(args);
      util.response.status200(res, newState);
    })
      .catch(next);
  }
}

module.exports = assetsController;
