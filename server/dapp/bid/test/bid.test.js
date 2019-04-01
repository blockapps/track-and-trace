import { fsUtil, parser } from 'blockapps-rest';
import { assert } from 'chai';
import RestStatus from 'http-status-codes';

import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

import oauthHelper from '../../../helpers/oauth';
import ttPermissionManagerJs from '../../ttPermission/ttPermissionManager';
import assetManagerJs from '../../asset/assetManager';
import assetFactory from '../../asset/asset.factory';
import bidJs from '../../bid/bid';
import { assertRestStatus } from '../../../helpers/assertRestStatus';

describe('Bid Tests', function () {
  this.timeout(config.timeout)

  const adminToken = { token: process.env.ADMIN_TOKEN };
  const masterToken = { token: process.env.MASTER_TOKEN };
  const manufacturerToken = { token: process.env.DISTRIBUTOR_TOKEN };
  const distributorToken = { token: process.env.MANUFACTURER_TOKEN };
  const retailerToken = { token: process.env.RETAILER_TOKEN };
  const regulatorToken = { token: process.env.REGULATOR_TOKEN };

  let assetManagerContract, manufacturerAssetManagerContract, distributorAssetManagerContract;
  let manufacturerUser, distributorUser, regulatorUser;
  let AssetError, AssetState, AssetEvent, BidState, BidEvent

  // TODO: refactor all these test helpers functions into helper/test.js
  async function createUser(userToken) {
    const userEmail = oauthHelper.getEmailIdFromToken(userToken.token);
    const createAccountResponse = await oauthHelper.createStratoUser(userToken, userEmail);
    assert.equal(createAccountResponse.status, 200, createAccountResponse.message);
    return { address: createAccountResponse.user.address, username: userEmail };
  }

  async function createAsset() {
    const assetArgs = assetFactory.getAssetArgs();
    const asset = await manufacturerAssetManagerContract.createAsset(assetArgs);
    assert.equal(asset.sku, assetArgs.sku, 'sku');
    assert.equal(asset.assetState, AssetState.CREATED);
    return asset;
  }

  function bindAssetManagerContractToUser(user, contract) {
    let copy = Object.assign({}, contract);

    return assetManagerJs.bind(user, copy);
  }

  before(async function () {
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(masterToken, 'master token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');
    assert.isDefined(retailerToken, 'retailer token is not defined');
    assert.isDefined(regulatorToken, 'retailer token is not defined');

    // get assertError Enums
    const assetErrorSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`)
    AssetError = await parser.parseEnum(assetErrorSource);

    // get assetState Enums
    const assetStateSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`)
    AssetState = await parser.parseEnum(assetStateSource);

    // get AssetEvent Enums
    const assetEventSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetEvent.sol`)
    AssetEvent = await parser.parseEnum(assetEventSource);

    // get BidState Enums
    const bidStateSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/bid/contracts/BidState.sol`)
    BidState = await parser.parseEnum(bidStateSource);

    // get BidEvent Enums
    const bidEventSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/bid/contracts/BidEvent.sol`)
    BidEvent = await parser.parseEnum(bidEventSource);

    manufacturerUser = await createUser(manufacturerToken);
    distributorUser = await createUser(distributorToken);
    regulatorUser = await createUser(regulatorToken);

    const ttPermissionManager = await ttPermissionManagerJs.uploadContract(adminToken, masterToken);
    assetManagerContract = await assetManagerJs.uploadContract(adminToken, ttPermissionManager);

    await ttPermissionManager.grantManufacturerRole(manufacturerUser);
    await ttPermissionManager.grantDistributorRole(distributorUser);

    manufacturerAssetManagerContract = bindAssetManagerContractToUser(manufacturerToken, assetManagerContract);
    distributorAssetManagerContract = bindAssetManagerContractToUser(distributorToken, assetManagerContract);
  });

  it('Distributor should not be able to open asset for bidding', async function () {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }

    await assertRestStatus(async function () {
      await distributorAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    }, RestStatus.FORBIDDEN, AssetError.NULL)
  })

  it('Manufacturer should be able to open asset for bidding', async function () {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);
  })

  // TODO: test that bid should only be created when asset is in the correct state
  it('Distributor should be able to create a bid', async function () {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    assert.isDefined(bid.chainId, "Chain id should be defined")
    assert.equal(bid.assetOwner, asset.owner, 'Asset owner should match')
    assert.equal(bid.initiator, distributorUser.address, 'Bidder address should be correct')
    assert.equal(bid.asset, asset.address, 'Asset address should be correct')
    assert.equal(bid.bidState, BidState.ENTERED, 'Bid state should be correct')
    assert.equal(bid.value, bidValue, 'Bid value should be correct')

    // manufacturer should be able to view this bid
    const mBids = await bidJs.getBids(manufacturerToken)
    const mBid = mBids.find((b) => b.address === bid.address)
    assert.isDefined(mBid, "Manufacturer should be able to view the bid")

    // retailer should not be able to view this bid
    const rBids = await bidJs.getBids(retailerToken)
    const rBid = rBids.find((b) => b.address === bid.address)
    assert.notExists(rBid, "Retailer should not be able to view the bid")
  })

  it("Distributor should not be able to accept a bid", async function () {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    const bidContract = bidJs.bind(distributorToken, bid.chainId, {
      name: 'Bid',
      address: bid.address,
      src: 'removed'
    })

    await assertRestStatus(async function () {
      await bidContract.handleBidEvent(BidEvent.ACCEPT)
    }, RestStatus.FORBIDDEN)
  });

  it("Manufacturer be able to accept a bid", async function () {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    const bidContract = bidJs.bind(manufacturerToken, bid.chainId, {
      name: 'Bid',
      address: bid.address,
      src: 'removed'
    })
    const newBidState = await bidContract.handleBidEvent(BidEvent.ACCEPT)
    assert.equal(newBidState, BidState.ACCEPTED, 'Bid should be in accepted state')
  });

  // TODO: check that an accepted bid with the correct props exists before transfering ownership
  it("Manufacturer should be able to change ownership", async function () {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    const bidContract = bidJs.bind(manufacturerToken, bid.chainId, {
      name: 'Bid',
      address: bid.address,
      src: 'removed'
    })
    const newBidState = await bidContract.handleBidEvent(BidEvent.ACCEPT)
    assert.equal(newBidState, BidState.ACCEPTED, 'Bid should be in accepted state')

    let transferOwnershipArgs = {
      sku: asset.sku,
      owner: distributorUser.address
    }

    const newAssetState = await manufacturerAssetManagerContract.transferOwnership(transferOwnershipArgs);

    assert(newAssetState, AssetState.OWNER_UPDATED, 'State should match')
    // TODO: test new owner. Might have to write a get asset call.
  });

  it("Distributor should not be able to change ownership", async function () {
    const asset = await createAsset();

    const handleAssetEventArgs = {
      sku: asset.sku,
      assetEvent: AssetEvent.REQUEST_BIDS
    }
    const newState = await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    assert.equal(newState, AssetState.BIDS_REQUESTED);

    const bidValue = 100;
    const bid = await bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue, regulatorUser.address);

    const bidContract = bidJs.bind(manufacturerToken, bid.chainId, {
      name: 'Bid',
      address: bid.address,
      src: 'removed'
    })
    const newBidState = await bidContract.handleBidEvent(BidEvent.ACCEPT)
    assert.equal(newBidState, BidState.ACCEPTED, 'Bid should be in accepted state')

    let transferOwnershipArgs = {
      sku: asset.sku,
      owner: distributorUser.address
    }

    await assertRestStatus(async function () {
      await distributorAssetManagerContract.transferOwnership(transferOwnershipArgs);
    }, RestStatus.FORBIDDEN, AssetError.NULL)
    // TODO: test new owner. Might have to write a get asset call.
  });
})
