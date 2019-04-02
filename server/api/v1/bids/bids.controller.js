import { rest } from 'blockapps-rest';

// TODO: refactor same code.
import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

const bidJs = require(`${process.cwd()}/${config.dappPath}/bid/bid`);
// const BidEvent = rest.getEnums(`${process.cwd()}/${config.dappPath}/bid/contracts/BidEvent.sol`).BidEvent;

const bidsController = {

  createBid: (req, res, next) => {
    const { accessToken, body } = req;
    const { address, owner, bidValue, regulatorEmail } = body;


    co(function* () {
      const getRegulatorKey = yield rest.getKey(accessToken, { username: regulatorEmail });
      const bid = yield bidJs.createBid(accessToken, address, owner, bidValue, getRegulatorKey.address);
      rest.response.status200(res, bid);
    })
      .catch(next);
  },

  list: (req, res, next) => {
    const { accessToken } = req;

    co(function* () {
      const bids = yield bidJs.getBids(accessToken);
      rest.response.status200(res, bids);
    })
      .catch(next);
  },

  get: (req, res, next) => {
    const { accessToken, params } = req;
    const { address } = params;

    const searchParams = {
      address: [address]
    }

    co(function* () {
      // response will contain only addressed data. Remove [0] while quering for multiple addresses
      const bids = (yield bidJs.getBids(accessToken, searchParams))[0];
      rest.response.status200(res, bids);
    })
      .catch(next);
  },

  handleEvent: (req, res, next) => {
    const { accessToken, params, body } = req;
    // Bid address
    const { address: bidAddress } = params;
    const { chainId, bidEvent } = body;

    co(function* () {
      const bidContract = bidJs.bind(accessToken, chainId, { name: 'Bid', address: bidAddress, src: 'removed' });
      let bidState;

      switch (bidEvent) {
        case BidEvent.ACCEPT:
          bidState = yield bidContract.handleBidEvent(BidEvent.ACCEPT);
          break;
        case BidEvent.REJECT:
          bidState = yield bidContract.handleBidEvent(BidEvent.REJECT);
          break;
        default:
          bidState;
      }
      rest.response.status200(res, bidState);
    })
      .catch(next);

  }
}

module.exports = bidsController;
