import { rest } from "blockapps-rest";
import config from "../../../load.config";
import bidJs from "../../../dapp/bid/bid";
import { getEnums } from "../../../helpers/parse";
import dappJs from "../../../dapp/dapp/dapp";
import assetJs from "../../../dapp/asset/asset";
import RestStatus from "http-status-codes";

let BidEvent;

(async () => {
  BidEvent = await getEnums(
    `${process.cwd()}/${config.dappPath}/bid/contracts/BidEvent.sol`
  );
})();

class BidsController {
  static async createBid(req, res, next) {
    const { accessToken, body } = req;
    const { address, owner, bidValue, regulatorEmail } = body;

    try {
      const getRegulatorKey = await rest.getKey(accessToken, {
        config,
        query: { username: regulatorEmail }
      });
      const bid = await bidJs.createBid(
        accessToken,
        address,
        owner,
        bidValue,
        getRegulatorKey
      );
      rest.response.status200(res, bid);
    } catch (e) {
      next(e);
    }
  }

  static async list(req, res, next) {
    const { accessToken, query } = req;

    try {
      const bids = await bidJs.getBids(accessToken, query);
      rest.response.status200(res, bids);
    } catch (e) {
      next(e);
    }
  }

  static async get(req, res, next) {
    const { accessToken, params } = req;
    const { address } = params;

    const searchParams = {
      address: `eq.${address}`
    };

    try {
      // response will contain only addressed data. Remove [0] while quering for multiple addresses
      const bid = (await bidJs.getBids(accessToken, searchParams))[0];
      rest.response.status200(res, bid);
    } catch (e) {
      next(e);
    }
  }

  static async handleEvent(req, res, next) {
    const { app, accessToken, params, body } = req;
    // Bid address
    const { address } = params;
    const { chainId, bidEvent } = body;

    try {
      const bidContract = bidJs.bind(accessToken, chainId, {
        name: "Bid",
        address,
        src: "removed"
      });
      let bidState;

      switch (bidEvent) {
        // 1 refers to ACCEPT
        case BidEvent.ACCEPT:
          const bid = await bidContract.getBid();
          const asset = await assetJs.getAssetByAddress(accessToken, bid.asset);
          if (!asset) {
            throw new rest.RestError(
              RestStatus.BAD_REQUEST,
              "Missing asset. Cannot accept bid"
            );
          }

          bidState = await bidContract.handleBidEvent(BidEvent.ACCEPT);

          // change owner
          // This is done so that it appears that this is atomic.
          // Even though it actually isnt
          const args = { sku: asset.sku, owner: bid.initiator };
          const deploy = app.get("deploy");
          const dapp = await dappJs.bind(accessToken, deploy.contract);
          const newState = await dapp.transferOwnership(args);

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
      next(e);
    }
  }
}

export default BidsController;
