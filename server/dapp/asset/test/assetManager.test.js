require('dotenv').config();
require('co-mocha');

const { common, rest6: rest } = require('blockapps-rest');
const { assert, config, fsutil, util } = common;

const { getEmailIdFromToken, createStratoUser } = require(`${process.cwd()}/helpers/oauth`);

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const AssetError = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`).AssetError;
const AssetState = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`).AssetState;
const AssetEvent = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetEvent.sol`).AssetEvent;

const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);
const assetManagerJs = require(`${process.cwd()}/${config.dappPath}/asset/assetManager`);
const assetJs = require(`${process.cwd()}/${config.dappPath}/asset/asset`);
const assetFactory = require(`${process.cwd()}/${config.dappPath}/asset/asset.factory`);


const adminToken = process.env.ADMIN_TOKEN;
const masterToken = process.env.MASTER_TOKEN;
const manufacturerToken = process.env.DISTRIBUTOR_TOKEN;
const distributorToken = process.env.MANUFACTURER_TOKEN;

const TEST_TIMEOUT = 60000;
let existingSku;

describe('Asset Manager Tests', function () {
  this.timeout(TEST_TIMEOUT);

  let assetManagerContract, manufacturerAssetManagerContract, distributorAssetManagerContract;

  function* createUser(userToken) {
    const userEmail = getEmailIdFromToken(userToken);
    const createAccountResponse = yield createStratoUser(userToken, userEmail);
    assert.equal(createAccountResponse.status, 200, createAccountResponse.message);
    return { account: createAccountResponse.address, username: userEmail };
  }

  function bindAssetManagerContractToUser(user, contract) {
    let copy = Object.assign({}, contract);

    return assetManagerJs.bind(user, copy);
  }

  before(function* () {
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');

    manufacturerUser = yield createUser(manufacturerToken);
    distributorUser = yield createUser(distributorToken);

    const ttPermissionManager = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken);
    assetManagerContract = yield assetManagerJs.uploadContract(adminToken, ttPermissionManager);

    yield ttPermissionManager.grantManufacturerRole(manufacturerUser);
    yield ttPermissionManager.grantDistributorRole(distributorUser);

    manufacturerAssetManagerContract = bindAssetManagerContractToUser(manufacturerToken, assetManagerContract);
    distributorAssetManagerContract = bindAssetManagerContractToUser(distributorToken, assetManagerContract);
  });

  it('Does Asset Exist -- asset does not exist ', function* () {
    const sku = `${util.iuid}`

    const exists = yield assetManagerContract.exists(sku);
    assert.equal(exists, false, 'contract does not exists');
  });

  it('Create Asset -- unauthorized', function* () {
    const assetArgs = assetFactory.getAssetArgs();

    yield assert.shouldThrowRest(function* () {
      yield distributorAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.UNAUTHORIZED, AssetError.NULL);
  });

  it('Create Asset', function* () {
    const assetArgs = assetFactory.getAssetArgs();

    const asset = yield manufacturerAssetManagerContract.createAsset(assetArgs);

    assert.equal(asset.sku, assetArgs.sku, 'sku');

    existingSku = asset.sku;

  });

  it('Create Asset -- empty sku', function* () {
    const assetArgs = assetFactory.getAssetArgs({
      sku: ''
    });

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, AssetError.SKU_EMPTY);
  });

  // TODO: fix permissioned hash map issues
  it('Create Asset -- already exists', function* () {
    const assetArgs = assetFactory.getAssetArgs();
    assetArgs.sku = existingSku;

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, AssetError.SKU_EXISTS);
  });

  it('Handle Asset Event', function* () {
    const assetArgs = assetFactory.getAssetArgs();
    const asset = yield manufacturerAssetManagerContract.createAsset(assetArgs);
    const assetContract = assetJs.bindAddress(manufacturerToken, asset.address);

    const assertHandleAssertEvent = function* (assetEvent, expectedState) {
      const handleAssetEventArgs = {
        sku: assetArgs.sku,
        assetEvent,
      };

      const newState = yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
      assert.equal(newState, expectedState, 'returned new state');

      const state = yield assetContract.getState();
      assert.equal(state.assetState, expectedState, 'new state');
    }

    yield assertHandleAssertEvent(AssetEvent.REQUEST_BIDS, AssetState.BIDS_REQUESTED);
    yield assertHandleAssertEvent(AssetEvent.CHANGE_OWNER, AssetState.OWNER_UPDATED);
  });

  it('Handle Asset Event -- invalid event', function* () {
    const assetArgs = assetFactory.getAssetArgs();
    yield manufacturerAssetManagerContract.createAsset(assetArgs);

    const handleAssetEventArgs = {
      sku: assetArgs.sku,
      assetEvent: AssetEvent.CHANGE_OWNER,
    };

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    }, RestStatus.BAD_REQUEST, AssetError.NULL);
  });

  it('Handle Asset Event -- asset not fonund', function* () {
    const assetArgs = assetFactory.getAssetArgs();
    const handleAssetEventArgs = {
      sku: assetArgs.sku,
      assetEvent: AssetEvent.REQUEST_BIDS,
    };

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    }, RestStatus.NOT_FOUND, AssetError.SKU_NOT_FOUND);
  });
});
