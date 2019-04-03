import { rest } from 'blockapps-rest';

// TODO: refactor same code.
import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

import dappJs from '../../../dapp/dapp/dapp';
import bidJs from '../../../dapp/bid/bid';

const moment = require('moment');

const assetsController = {
  getAssets: async (req, res, next) => {
    const { app, accessToken, query } = req;
    const args = { ...query };
    // TODO: create token utils
    const token = { token: accessToken };

    const deploy = app.get('deploy');

    try {
      const dapp = await dappJs.bind(token, deploy.contract);
      const assets = await dapp.getAssets(args);
      rest.response.status200(res, assets);
    } catch (e) {
      next(e)
    }
  },

  getAsset: async (req, res, next) => {
    const { app, accessToken } = req;
    const sku = req.params.sku;
    const token = { token: accessToken };

    if (!sku) {
      rest.response.status400(res, 'Missing sku')
      return next();
    }

    const deploy = app.get('deploy');

    try {
      const dapp = await dappJs.bind(token, deploy.contract);
      const asset = await dapp.getAsset(sku);
      const assetHistory = await dapp.getAssetHistory(sku)
      const bidHistory = await bidJs.getBidsHistory(token, asset.address);

      const histories = [
        ...assetHistory.map(h => { return { ...h, type: 'ASSET' } }),
        ...bidHistory.map(h => { return { ...h, type: 'BID' } })
      ];

      asset.history = histories.sort(
        (h1, h2) => moment(h1.block_timestamp).unix() - moment(h2.block_timestamp).unix()
      )

      rest.response.status200(res, asset);
    } catch (e) {
      next(e)
    }
  },

  // TODO: throw errors correctly from dapp
  createAsset: async (req, res, next) => {
    const { app, accessToken, body } = req;
    const args = { ...body.asset };
    const token = { token: accessToken };

    if (
      !Array.isArray(args.keys)
      || !Array.isArray(args.values)
      || args.keys.length !== args.values.length
    ) {
      rest.response.status400(res, 'Missing spec or bad spec format');
      return next();
    }

    try {
      const deploy = app.get('deploy');
      const dapp = await dappJs.bind(token, deploy.contract);
      const asset = await dapp.createAsset(args);
      rest.response.status200(res, asset);
    } catch (e) {
      next(e)
    }
  },

  handleAssetEvent: async (req, res, next) => {
    const { app, accessToken, body } = req;
    const { sku, assetEvent } = body;
    const token = { token: accessToken };

    // Get sku and assetEvent
    const args = { sku, assetEvent: parseInt(assetEvent, 10) };

    const deploy = app.get('deploy');
    try {
      const dapp = await dappJs.bind(token, deploy.contract);
      const newState = await dapp.handleAssetEvent(args);
      rest.response.status200(res, newState);
    } catch (e) {
      next(e)
    }
  },

  transferOwnership: async (req, res, next) => {
    const { app, accessToken, body } = req;
    const { sku, owner } = body;
    const token = { token: accessToken };

    // Get sku and assetEvent
    const args = { sku, owner };

    const deploy = app.get('deploy');

    try {
      const dapp = await dappJs.bind(token, deploy.contract);
      const newState = await dapp.transferOwnership(args);
      rest.response.status200(res, newState);
    } catch (e) {
      next(e)
    }
  }
}

module.exports = assetsController;
