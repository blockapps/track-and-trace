import { rest } from 'blockapps-rest';

import dappJs from '../../../dapp/dapp/dapp';
import bidJs from '../../../dapp/bid/bid';

import moment from 'moment';

class AssetsController {

  static async getAssets(req, res, next) {
    const { app, accessToken, query } = req;
    const args = { ...query };

    const deploy = app.get('deploy');

    try {
      const dapp = await dappJs.bind(accessToken, deploy.contract);
      const assets = await dapp.getAssets(args);
      rest.response.status200(res, assets);
    } catch (e) {
      next(e)
    }
  }

  static async getAsset(req, res, next) {
    const { app, accessToken } = req;
    const sku = req.params.sku;

    if (!sku) {
      rest.response.status400(res, 'Missing sku')
      return next();
    }

    const deploy = app.get('deploy');

    try {
      const dapp = await dappJs.bind(accessToken, deploy.contract);
      const asset = await dapp.getAsset(sku);
      const assetHistory = await dapp.getAssetHistory(sku)
      const bidHistory = await bidJs.getBidsHistory(accessToken, asset.address);

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
  }

  // TODO: throw errors correctly from dapp
  static async createAsset(req, res, next) {
    const { app, accessToken, body } = req;
    const args = { ...body.asset };

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
      const dapp = await dappJs.bind(accessToken, deploy.contract);
      const asset = await dapp.createAsset(args);
      rest.response.status200(res, asset);
    } catch (e) {
      next(e)
    }
  }

  static async handleAssetEvent(req, res, next) {
    const { app, accessToken, body, params } = req;
    const { assetEvent } = body;
    const { sku } = params;

    // Get sku and assetEvent
    const args = { sku, assetEvent: parseInt(assetEvent, 10) };

    const deploy = app.get('deploy');
    try {
      const dapp = await dappJs.bind(accessToken, deploy.contract);
      const newState = await dapp.handleAssetEvent(args);
      rest.response.status200(res, newState);
    } catch (e) {
      next(e)
    }
  }

  static async transferOwnership(req, res, next) {
    const { app, accessToken, body } = req;
    const { sku, owner } = body;

    // Get sku and assetEvent
    const args = { sku, owner };

    const deploy = app.get('deploy');

    try {
      const dapp = await dappJs.bind(accessToken, deploy.contract);
      const newState = await dapp.transferOwnership(args);
      rest.response.status200(res, newState);
    } catch (e) {
      next(e)
    }
  }
}

export default AssetsController;