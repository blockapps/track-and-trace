import { assert } from "blockapps-rest";
import RestStatus from "http-status-codes";
import config from "../../../load.config";
import dotenv from "dotenv";

const loadEnv = dotenv.config();
assert.isUndefined(loadEnv.error);

import oauthHelper from "../../../helpers/oauth";
import ttPermissionManagerJs from "../../ttPermission/ttPermissionManager";
import assetManagerJs from "../../asset/assetManager";
import { factory } from "../../asset/asset.factory";
import bidJs from "../../bid/bid";
import { getEnums } from "../../../helpers/parse";

describe("Bid Tests", function() {
  this.timeout(config.timeout);

  const adminCredentials = { token: process.env.ADMIN_TOKEN };
  const masterCredentials = { token: process.env.MASTER_TOKEN };
  const manufacturerCredentials = { token: process.env.DISTRIBUTOR_TOKEN };
  const distributorCredentials = { token: process.env.MANUFACTURER_TOKEN };
  const retailerCredentials = { token: process.env.RETAILER_TOKEN };
  const regulatorCredentials = { token: process.env.REGULATOR_TOKEN };

  let assetManagerContract,
    manufacturerAssetManagerContract,
    distributorAssetManagerContract;
  let adminUser,
    masterUser,
    manufacturerUser,
    distributorUser,
    regulatorUser,
    retailerUser;
  let AssetError, AssetState, AssetEvent, BidState, BidEvent;

  // TODO: refactor all these test helpers functions into helper/test.js
  async function createUser(userToken) {
    const userEmail = oauthHelper.getEmailIdFromToken(userToken.token);
    const createAccountResponse = await oauthHelper.createStratoUser(
      userToken,
      userEmail
    );
    assert.equal(
      createAccountResponse.status,
      RestStatus.OK,
      createAccountResponse.message
    );
    return { address: createAccountResponse.user.address, username: userEmail };
  }

  async function createAsset() {
    const assetArgs = factory.getAssetArgs();
    const asset = await manufacturerAssetManagerContract.createAsset(assetArgs);
    assert.equal(asset.sku, assetArgs.sku, "sku");
    assert.equal(asset.assetState, AssetState.CREATED);
    return asset;
  }

  function bindAssetManagerContractToUser(user, contract) {
    let copy = Object.assign({}, contract);

    return assetManagerJs.bind(user, copy);
  }

  before(async function() {
    assert.isDefined(adminCredentials.token, "admin token is not defined");
    assert.isDefined(masterCredentials.token, "master token is not defined");
    assert.isDefined(
      manufacturerCredentials.token,
      "manufacturer token is not defined"
    );
    assert.isDefined(
      distributorCredentials.token,
      "distributor token is not defined"
    );
    assert.isDefined(
      retailerCredentials.token,
      "retailer token is not defined"
    );
    assert.isDefined(
      regulatorCredentials.token,
      "retailer token is not defined"
    );

    // get assetError Enums
    AssetError = await getEnums(
      `${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`
    );

    // get assetState Enums
    AssetState = await getEnums(
      `${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`
    );

    // get assetEvent Enums
    AssetEvent = await getEnums(
      `${process.cwd()}/${config.dappPath}/asset/contracts/AssetEvent.sol`
    );

    // get BidState Enums
    BidState = await getEnums(
      `${process.cwd()}/${config.dappPath}/bid/contracts/BidState.sol`
    );

    // get BidEvent Enums
    BidEvent = await getEnums(
      `${process.cwd()}/${config.dappPath}/bid/contracts/BidEvent.sol`
    );

    adminUser = await createUser(adminCredentials);
    masterUser = await createUser(masterCredentials);
    manufacturerUser = await createUser(manufacturerCredentials);
    distributorUser = await createUser(distributorCredentials);
    regulatorUser = await createUser(regulatorCredentials);
    retailerUser = await createUser(retailerCredentials);

    const ttPermissionManager = await ttPermissionManagerJs.uploadContract(
      adminCredentials,
      masterCredentials
    );
    assetManagerContract = await assetManagerJs.uploadContract(
      adminCredentials,
      ttPermissionManager
    );

    await ttPermissionManager.grantManufacturerRole(manufacturerUser);
    await ttPermissionManager.grantDistributorRole(distributorUser);

    manufacturerAssetManagerContract = bindAssetManagerContractToUser(
      manufacturerCredentials,
      assetManagerContract
    );
    distributorAssetManagerContract = bindAssetManagerContractToUser(
      distributorCredentials,
      assetManagerContract
    );
  });

  it("Distributor should not be able to open asset for bidding", async function() {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    };

    await assert.restStatus(
      async function() {
        await distributorAssetManagerContract.handleAssetEvent(
          handleAssetEventArgs
        );
      },
      RestStatus.FORBIDDEN,
      /"handleAssetEvent"/,
      AssetError.NULL
    );
  });

  it("Manufacturer should be able to open asset for bidding", async function() {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    };
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(
      handleAssetEventArgs
    );
    assert.equal(newState, AssetState.BIDS_REQUESTED);
  });

  // TODO: test that bid should only be created when asset is in the correct state
  it("Distributor should be able to create a bid", async function() {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    };
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(
      handleAssetEventArgs
    );
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(
      distributorCredentials,
      asset.address,
      asset.owner,
      bidValue,
      regulatorUser.address
    );

    assert.isDefined(bid.chainId, "Chain id should be defined");
    assert.equal(bid.assetOwner, asset.owner, "Asset owner should match");
    assert.equal(
      bid.initiator,
      distributorUser.address,
      "Bidder address should be correct"
    );
    assert.equal(bid.asset, asset.address, "Asset address should be correct");
    assert.equal(bid.bidState, BidState.ENTERED, "Bid state should be correct");
    assert.equal(bid.value, bidValue, "Bid value should be correct");

    // manufacturer should be able to view this bid
    const mBids = await bidJs.getBids(manufacturerCredentials, {
      asset: `eq.${asset.address}`
    });
    const mBid = mBids.find(b => b.address === bid.address);
    assert.isDefined(mBid, "Manufacturer should be able to view the bid");

    // retailer should not be able to view this bid
    const rBids = await bidJs.getBids(retailerCredentials);
    const rBid = rBids.find(b => b.address === bid.address);
    assert.notExists(rBid, "Retailer should not be able to view the bid");
  });

  it("Distributor should not be able to accept a bid", async function() {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    };
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(
      handleAssetEventArgs
    );
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(
      distributorCredentials,
      asset.address,
      asset.owner,
      bidValue,
      regulatorUser.address
    );

    const bidContract = bidJs.bind(distributorCredentials, bid.chainId, {
      name: "Bid",
      address: bid.address,
      src: "removed"
    });

    await assert.restStatus(async function() {
      await bidContract.handleBidEvent(BidEvent.ACCEPT);
    }, RestStatus.FORBIDDEN);
  });

  it("Manufacturer be able to accept a bid", async function() {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    };
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(
      handleAssetEventArgs
    );
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(
      distributorCredentials,
      asset.address,
      asset.owner,
      bidValue,
      regulatorUser.address
    );

    const bidContract = bidJs.bind(manufacturerCredentials, bid.chainId, {
      name: "Bid",
      address: bid.address,
      src: "removed"
    });
    const newBidState = await bidContract.handleBidEvent(BidEvent.ACCEPT);
    assert.equal(
      newBidState,
      BidState.ACCEPTED,
      "Bid should be in accepted state"
    );
  });

  // TODO: check that an accepted bid with the correct props exists before transfering ownership
  it("Manufacturer should be able to change ownership", async function() {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    };
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(
      handleAssetEventArgs
    );
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(
      distributorCredentials,
      asset.address,
      asset.owner,
      bidValue,
      regulatorUser.address
    );

    const bidContract = bidJs.bind(manufacturerCredentials, bid.chainId, {
      name: "Bid",
      address: bid.address,
      src: "removed"
    });
    const newBidState = await bidContract.handleBidEvent(BidEvent.ACCEPT);
    assert.equal(
      newBidState,
      BidState.ACCEPTED,
      "Bid should be in accepted state"
    );

    let transferOwnershipArgs = {
      sku: asset.sku,
      owner: distributorUser.address
    };

    const newAssetState = await manufacturerAssetManagerContract.transferOwnership(
      transferOwnershipArgs
    );

    assert(newAssetState, AssetState.OWNER_UPDATED, "State should match");
    // TODO: test new owner. Might have to write a get asset call.
  });

  it("Distributor should not be able to change ownership", async function() {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    };
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(
      handleAssetEventArgs
    );
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(
      distributorCredentials,
      asset.address,
      asset.owner,
      bidValue,
      regulatorUser.address
    );

    const bidContract = bidJs.bind(manufacturerCredentials, bid.chainId, {
      name: "Bid",
      address: bid.address,
      src: "removed"
    });
    const newBidState = await bidContract.handleBidEvent(BidEvent.ACCEPT);
    assert.equal(
      newBidState,
      BidState.ACCEPTED,
      "Bid should be in accepted state"
    );

    let transferOwnershipArgs = {
      sku: asset.sku,
      owner: distributorUser.address
    };

    await assert.restStatus(
      async function() {
        await distributorAssetManagerContract.transferOwnership(
          transferOwnershipArgs
        );
      },
      RestStatus.FORBIDDEN,
      /"transferOwnership"/,
      AssetError.NULL
    );
    // TODO: test new owner. Might have to write a get asset call.
  });
});
