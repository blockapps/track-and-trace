import { rest } from 'blockapps-rest';

// TODO: refactor same code.
import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

import bidJs from '../../../dapp/bid/bid';
// TODO: use in constructor and init global variable
// const BidEvent = rest.getEnums(`${process.cwd()}/${config.dappPath}/bid/contracts/BidEvent.sol`).BidEvent;

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
      // TODO: check that it is working properly
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
        case 1:
          bidState = await bidContract.handleBidEvent(1);
          break;
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
