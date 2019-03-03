require('dotenv').config();
require('co-mocha');

const { common, rest6: rest } = require('blockapps-rest');
const { assert, config } = common;

const { getEmailIdFromToken, createStratoUser } = require(`${process.cwd()}/helpers/oauth`);
const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);
const assetManagerJs = require(`${process.cwd()}/${config.dappPath}/asset/assetManager`);
const assetFactory = require(`${process.cwd()}/${config.dappPath}/asset/asset.factory`);
const bidJs = require(`${process.cwd()}/${config.dappPath}/bid/bid`);

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const AssetError = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`).AssetError;
const AssetState = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`).AssetState;
const AssetEvent = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetEvent.sol`).AssetEvent;
const BidState = rest.getEnums(`${process.cwd()}/${config.dappPath}/bid/contracts/BidState.sol`).BidState;
const BidEvent = rest.getEnums(`${process.cwd()}/${config.dappPath}/bid/contracts/BidEvent.sol`).BidEvent;

describe('Bid Tests', function() {
  this.timeout(60*1000)

  const adminToken = process.env.ADMIN_TOKEN;
  const masterToken = process.env.MASTER_TOKEN;
  const manufacturerToken = process.env.DISTRIBUTOR_TOKEN;
  const distributorToken = process.env.MANUFACTURER_TOKEN;
  const retailerToken = process.env.RETAILER_TOKEN;
  const regulatorToken = process.env.REGULATOR_TOKEN;

  let assetManagerContract, manufacturerAssetManagerContract, distributorAssetManagerContract;

  // TODO: refactor all these test helpers functions into helper/test.js
  function* createUser(userToken) {
    const userEmail = getEmailIdFromToken(userToken);
    const createAccountResponse = yield createStratoUser(userToken, userEmail);
    assert.equal(createAccountResponse.status, 200, createAccountResponse.message);
    return { address: createAccountResponse.address, username: userEmail };
  }

  function* createAsset() {
    const assetArgs = assetFactory.getAssetArgs();
    const asset = yield manufacturerAssetManagerContract.createAsset(assetArgs);
    assert.equal(asset.sku, assetArgs.sku, 'sku');
    assert.equal(asset.assetState, AssetState.CREATED);
    return asset;
  }

  function bindAssetManagerContractToUser(user, contract) {
    let copy = Object.assign({}, contract);

    return assetManagerJs.bind(user, copy);
  }

  before(function* () {
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(masterToken, 'master token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');
    assert.isDefined(retailerToken, 'retailer token is not defined');

    manufacturerUser = yield createUser(manufacturerToken);
    distributorUser = yield createUser(distributorToken);
    regulatorUser = yield createUser(regulatorToken);

    const ttPermissionManager = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken);
    assetManagerContract = yield assetManagerJs.uploadContract(adminToken, ttPermissionManager);

    yield ttPermissionManager.grantManufacturerRole(manufacturerUser);
    yield ttPermissionManager.grantDistributorRole(distributorUser);

    manufacturerAssetManagerContract = bindAssetManagerContractToUser(manufacturerToken, assetManagerContract);
    distributorAssetManagerContract = bindAssetManagerContractToUser(distributorToken, assetManagerContract);
  });

  it('Distributor should not be able to open asset for bidding', function* () {
    const asset = yield createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }

    yield assert.shouldThrowRest(function* () {
      yield distributorAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    }, RestStatus.FORBIDDEN, AssetError.NULL);
  })

  it('Manufacturer should be able to open asset for bidding', function* () {
    const asset = yield createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);
  })

  // TODO: test that bid should only be created when asset is in the correct state

  it('Distributor should be able to create a bid', function* () {
    const asset = yield createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = yield bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    assert.isDefined(bid.chainId, "Chain id should be defined")
    assert.equal(bid.assetOwner, asset.owner, 'Asset owner should match')
    assert.equal(bid.initiator, distributorUser.address, 'Bidder address should be correct')
    assert.equal(bid.asset, asset.address, 'Asset address should be correct')
    assert.equal(bid.bidState, BidState.ENTERED, 'Bid state should be correct')
    assert.equal(bid.value, bidValue, 'Bid value should be correct')

    // manufacturer should be able to view this bid
    const mBids = yield bidJs.getBids(manufacturerToken)
    const mBid = mBids.find((b) => b.address === bid.address)
    assert.isDefined(mBid, "Manufacturer should be able to view the bid")

    // retailer should not be able to view this bid
    const rBids = yield bidJs.getBids(retailerToken)
    const rBid = rBids.find((b) => b.address === bid.address)
    assert.notExists(rBid,  "Retailer should not be able to view the bid")
  })

  it("Distributor should not be able to accept a bid", function* () {
    const asset = yield createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = yield bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    const bidContract = bidJs.bind(distributorToken, bid.chainId, {
      name: 'Bid',
      address: bid.address,
      src: 'removed'
    })

    yield assert.shouldThrowRest(function* () {
      yield bidContract.handleBidEvent(BidEvent.ACCEPT)
    }, RestStatus.FORBIDDEN);

  });

  it("Manufacturer be able to accept a bid", function* () {
    const asset = yield createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = yield bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    const bidContract = bidJs.bind(manufacturerToken, bid.chainId, {
      name: 'Bid',
      address: bid.address,
      src: 'removed'
    })
    const newBidState = yield bidContract.handleBidEvent(BidEvent.ACCEPT)
    assert.equal(newBidState, BidState.ACCEPTED, 'Bid should be in accepted state')
  });

  // TODO: check that an accepted bid with the correct props exists before transfering ownership

  it("Manufacturer should be able to change ownership", function* () {
    const asset = yield createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = yield bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    const bidContract = bidJs.bind(manufacturerToken, bid.chainId, {
      name: 'Bid',
      address: bid.address,
      src: 'removed'
    })
    const newBidState = yield bidContract.handleBidEvent(BidEvent.ACCEPT)
    assert.equal(newBidState, BidState.ACCEPTED, 'Bid should be in accepted state')

    transferOwnershipArgs = {
      sku: asset.sku,
      owner: distributorUser.address
    }

    const newAssetState =
      yield manufacturerAssetManagerContract.transferOwnership(transferOwnershipArgs);

    assert(newAssetState, AssetState.OWNER_UPDATED, 'State should match')
    // TODO: test new owner. Might have to write a get asset call.
  });


  it("Distributor should not be able to change ownership", function* () {
    const asset = yield createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = yield bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    const bidContract = bidJs.bind(manufacturerToken, bid.chainId, {
      name: 'Bid',
      address: bid.address,
      src: 'removed'
    })
    const newBidState = yield bidContract.handleBidEvent(BidEvent.ACCEPT)
    assert.equal(newBidState, BidState.ACCEPTED, 'Bid should be in accepted state')

    transferOwnershipArgs = {
      sku: asset.sku,
      owner: distributorUser.address
    }

    yield assert.shouldThrowRest(function* () {
      yield distributorAssetManagerContract.transferOwnership(transferOwnershipArgs);
    }, RestStatus.FORBIDDEN, AssetError.NULL);

    // TODO: test new owner. Might have to write a get asset call.
  });
})
