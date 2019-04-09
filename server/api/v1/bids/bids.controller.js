import { rest } from 'blockapps-rest';

import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

import bidJs from '../../../dapp/bid/bid';
import { getEnums } from '../../../helpers/parse';

let BidEvent

(async () => {
  BidEvent = await getEnums(`${process.cwd()}/${config.dappPath}/bid/contracts/BidEvent.sol`);
})()

class BidsController {

  static async createBid(req, res, next) {
    const { accessToken, body } = req;
    const { address, owner, bidValue, regulatorEmail } = body;

    try {
      const getRegulatorKey = await rest.getKey(accessToken, { config, query: { username: regulatorEmail } });
      const bid = await bidJs.createBid(accessToken, address, owner, bidValue, getRegulatorKey);
      rest.response.status200(res, bid);
    } catch (e) {
      next(e)
    }
  }

  static async list(req, res, next) {
    const { accessToken } = req;

    try {
      const bids = await bidJs.getBids(accessToken);
      rest.response.status200(res, bids);
    } catch (e) {
      next(e)
    }
  }

  static async get(req, res, next) {
    const { accessToken, params } = req;
    const { address } = params;

    const searchParams = {
      address: [address]
    }

    try {
      // response will contain only addressed data. Remove [0] while quering for multiple addresses
      const bids = (await bidJs.getBids(accessToken, searchParams))[0];
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

    try {
      const bidContract = bidJs.bind(accessToken, chainId, { name: 'Bid', address: bidAddress, src: 'removed' });
      let bidState;

      switch (bidEvent) {
        // 1 refers to ACCEPT
        case BidEvent.ACCEPT:
          bidState = await bidContract.handleBidEvent(BidEvent.ACCEPT);
          break;
        // 2 refers to REJECT
        case BidEvent.REJECT:
          bidState = await bidContract.handleBidEvent(BidEvent.REJECT);
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
