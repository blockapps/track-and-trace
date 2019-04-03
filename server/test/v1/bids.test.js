import { fsUtil, parser } from 'blockapps-rest';
import { assert } from 'chai';

import oauthHelper from '../../helpers/oauth';
import { factory } from '../../dapp/asset/asset.factory';
const { get, post } = require(`${process.cwd()}/test/helpers/rest`);
const endpoints = require(`${process.cwd()}/api/v1/endpoints`);

import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminToken = { token: process.env.ADMIN_TOKEN };
const manufacturerToken = { token: process.env.MANUFACTURER_TOKEN };
const distributerToken = { token: process.env.DISTRIBUTOR_TOKEN };
const regulatorToken = { token: process.env.REGULATOR_TOKEN };

describe('Bids End-To-End Tests', function () {
  this.timeout(config.timeout);
  let asset, bidsList, bidDetail;
  let TtRole, AssetState, AssetEvent, BidState, BidEvent

  // TODO: move in utils
  const createUser = async function (userToken, role) {
    try {
      const user = await get(endpoints.Users.me, userToken.token);
      assert.equal(user.role, role, 'user already created with different role');
    } catch (err) {
      console.log(err);
      const userEmail = oauthHelper.getEmailIdFromToken(userToken.token);
      const createAccountResponse = await oauthHelper.createStratoUser(userToken, userEmail);
      const createTtUserArgs = {
        account: createAccountResponse.address,
        username: userEmail,
        role: role
      };
      await post(endpoints.Users.users, createTtUserArgs, adminToken.token);
    }
  }

  before(async function () {
    // TODO: check this properly
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributerToken, 'distributer token is not defined');

    // get ttRole Enums
    const ttRoleSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`)
    TtRole = await parser.parseEnum(ttRoleSource);

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

    await createUser(manufacturerToken, TtRole.MANUFACTURER);
    await createUser(distributerToken, TtRole.DISTRIBUTOR);
    await createUser(regulatorToken, TtRole.REGULATOR);

    const createAssetArgs = factory.getAssetArgs();
    asset = await post(endpoints.Assets.assets, { asset: createAssetArgs }, manufacturerToken.token);
    assert.equal(asset.sku, createAssetArgs.sku);

    const handleEventUrl = `${endpoints.Assets.assets}/handleEvent`;
    const assetState = await post(handleEventUrl, { sku: asset.sku, assetEvent: AssetEvent.REQUEST_BIDS }, manufacturerToken.token);
    assert.equal(AssetState.BIDS_REQUESTED, assetState, "State should be updated");
  });

  it('Create Bid', async function () {
    const bidValue = 10;
    const regulatorEmail = oauthHelper.getEmailIdFromToken(regulatorToken.token);
    bidDetail = await post(endpoints.Bids.bids, { address: asset.address, owner: asset.owner, bidValue, regulatorEmail }, distributerToken.token);
    assert.equal(bidDetail.assetOwner, asset.owner, "owner address should be same");
    assert.equal(bidDetail.asset, asset.address, "asset address should be same");
    assert.equal(bidDetail.value, bidValue, "bid value should be same");
  });

  it('List bids', async function () {
    bidsList = await get(endpoints.Bids.bids, manufacturerToken.token);
    assert.isAtLeast(bidsList.length, 1, 'bids should be at least 1');
  });

  it('Get bids using address', async function () {
    const url = `${endpoints.Bids.bids}/${bidsList[0].address}`;
    const bidDetail = await get(url, manufacturerToken.token);
    assert.isDefined(bidDetail, 'bid detail using address');
  });

  it('ACCEPT - handle event', async function () {
    const url = `${endpoints.Bids.bids}/${bidDetail.address}/event`;
    const bidState = await post(url, { chainId: bidDetail.chainId, bidEvent: BidEvent.ACCEPT }, manufacturerToken.token);
    assert.equal(bidState, BidState.ACCEPTED, "bid state should be in Accepted state");
  });

  it('REJECT - handle event', async function () {
    // create bid
    const bidValue = 10;
    const regulatorEmail = oauthHelper.getEmailIdFromToken(regulatorToken.token);
    const detail = await post(endpoints.Bids.bids, { address: asset.address, owner: asset.owner, bidValue, regulatorEmail }, distributerToken.token);
    assert.equal(detail.assetOwner, asset.owner, "owner address should be same");
    assert.equal(detail.asset, asset.address, "asset address should be same");
    assert.equal(detail.value, bidValue, "bid value should be same");

    // Reject bid
    const url = `${endpoints.Bids.bids}/${detail.address}/event`;
    const bidState = await post(url, { chainId: detail.chainId, bidEvent: BidEvent.REJECT }, manufacturerToken.token);
    assert.equal(bidState, BidState.REJECTED, "bid state should be in Rejected state");
  });

  it('should retrieve asset and bid history', async function () {
    const retrieved = await get(
      endpoints.Assets.asset.replace(':sku', asset.sku),
      manufacturerToken.token
    )

    assert.equal(retrieved.sku, asset.sku, 'SKU should match');
    assert.isArray(retrieved.history, 'History should be present');
    assert.isAtLeast(retrieved.history.length, 1, 'History should be present');
  });

});
