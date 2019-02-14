const co = require('co');

const { common } = require('blockapps-rest');
const { config, util } = common;

const bidJs = require(`${process.cwd()}/${config.dappPath}/bid/bid`);

const bidsController = {

  createBid: (req, res, next) => {
    const { accessToken, body } = req;
    const { address, owner, bidValue } = body;

    co(function* () {
      const bid = yield bidJs.createBid(accessToken, address, owner, bidValue);
      util.response.status200(res, bid);
    })
      .catch(next);
  },

  list: (req, res, next) => {
    const { accessToken } = req;

    co(function* () {
      const bids = yield bidJs.getBids(accessToken);
      util.response.status200(res, bids);
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
      util.response.status200(res, bids);
    })
      .catch(next);
  },

  handleEvent: (req, res, next) => {
    const { accessToken, params, body } = req;
    // Bid address
    const { address } = params;
    const { chainId, bidEvent } = body;

    co(function* () {
      // TODO: what about chainID and contract.
      const bidContract = bidJs.bind(accessToken, chainId, { name: 'Bid', address: address, src: 'removed' });
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
      util.response.status200(res, bidState);
    })
      .catch(next);

  }
}

module.exports = bidsController;
