import { rest } from 'blockapps-rest';

import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

import bidJs from '../../../dapp/bid/bid';

class BidsController {

  static async createBid(req, res, next) {
    const { accessToken, body } = req;
    const { address, owner, bidValue, regulatorEmail } = body;
    const token = { token: accessToken };

    try {
      const getRegulatorKey = await rest.getKey(token, { config, query: { username: `${regulatorEmail}` } });
      const bid = await bidJs.createBid(token, address, owner, bidValue, getRegulatorKey);
      rest.response.status200(res, bid);
    } catch (e) {
      next(e)
    }
  }

  static async list(req, res, next) {
    const { accessToken } = req;
    const token = { token: accessToken };

    try {
      const bids = await bidJs.getBids(token);
      rest.response.status200(res, bids);
    } catch (e) {
      next(e)
    }
  }

  static async get(req, res, next) {
    const { accessToken, params } = req;
    const { address } = params;
    const token = { token: accessToken };

    const searchParams = {
      address: [address]
    }

    try {
      // response will contain only addressed data. Remove [0] while quering for multiple addresses
      const bids = (await bidJs.getBids(token, searchParams))[0];
      rest.response.status200(res, bids);
    } catch (e) {
      next(e)
    }
  }

  static async handleEvent(req, res, next) {
    const { accessToken, params, body } = req;
    // Bid address
    const { address: bidAddress } = params;
    const { chainId, bidEvent } = body;
    const token = { token: accessToken };

    try {
      const bidContract = bidJs.bind(token, chainId, { name: 'Bid', address: bidAddress, src: 'removed' });
      let bidState;

      switch (bidEvent) {
        // 1 refers to ACCEPT
        case 1:
          bidState = await bidContract.handleBidEvent(1);
          break;
        // 2 refers to REJECT
        case 2:
          bidState = await bidContract.handleBidEvent(2);
          break;
        default:
          bidState;
      }
      rest.response.status200(res, bidState);
    } catch (e) {
      next(e)
    }
  }

}

export default BidsController;
