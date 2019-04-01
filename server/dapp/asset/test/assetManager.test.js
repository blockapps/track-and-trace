import { rest, fsUtil, parser, util } from 'blockapps-rest';
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
import assetJs from '../asset';
import assetFactory from '../asset.factory';
import { assertRestStatus } from '../../../helpers/assertRestStatus';

const adminToken = { token: process.env.ADMIN_TOKEN };
const masterToken = { token: process.env.MASTER_TOKEN };
const manufacturerToken = { token: process.env.DISTRIBUTOR_TOKEN };
const distributorToken = { token: process.env.MANUFACTURER_TOKEN };

let existingSku;

describe('Asset Manager Tests', function () {
  this.timeout(config.timeout);

  let assetManagerContract, manufacturerAssetManagerContract, distributorAssetManagerContract;
  let AssetError, AssetState, AssetEvent;
  let adminUser, masterUser, manufacturerUser, distributorUser;

  // TODO: check wheater it is needed or not
  async function createUser(userToken) {
    const userEmail = oauthHelper.getEmailIdFromToken(userToken.token);
    const createAccountResponse = await oauthHelper.createStratoUser(userToken, userEmail);
    assert.equal(createAccountResponse.status, 200, createAccountResponse.message);
    return { address: createAccountResponse.address, username: userEmail };
  }

  function bindAssetManagerContractToUser(user, contract) {
    let copy = Object.assign({}, contract);

    return assetManagerJs.bind(user, copy);
  }

  before(async function () {
    // get assertError Enums
    const assetErrorSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`)
    AssetError = await parser.parseEnum(assetErrorSource);

    // get assertError Enums
    const assetStateSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`)
    AssetState = await parser.parseEnum(assetStateSource);

    // get assertError Enums
    const assetEventSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetEvent.sol`)
    AssetEvent = await parser.parseEnum(assetEventSource);

    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(masterToken, 'master token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');

    // TODO: refactor this code or remove createStratoUser util
    adminUser = await rest.createUser(adminToken, { config });
    masterUser = await rest.createUser(masterToken, { config });
    manufacturerUser = await rest.createUser(manufacturerToken, { config });
    distributorUser = await rest.createUser(distributorToken, { config });

    const ttPermissionManager = await ttPermissionManagerJs.uploadContract(adminUser, masterUser);
    assetManagerContract = await assetManagerJs.uploadContract(adminUser, ttPermissionManager);

    const manufacturerUsername = oauthHelper.getEmailIdFromToken(manufacturerUser.token);
    Object.assign(manufacturerUser, { username: manufacturerUsername })

    await ttPermissionManager.grantManufacturerRole(manufacturerUser);

    const distributorUsername = oauthHelper.getEmailIdFromToken(distributorUser.token);
    Object.assign(distributorUser, { username: distributorUsername })
    await ttPermissionManager.grantDistributorRole(distributorUser);

    manufacturerAssetManagerContract = bindAssetManagerContractToUser(manufacturerUser, assetManagerContract);
    distributorAssetManagerContract = bindAssetManagerContractToUser(distributorUser, assetManagerContract);
  });

  it('Does Asset Exist -- asset does not exist ', async function () {
    const sku = `${util.iuid}`

    const exists = await assetManagerContract.exists(sku);
    assert.equal(exists, false, 'contract does not exists');
  });

  it('Create Asset -- unauthorized', async function () {
    const assetArgs = assetFactory.getAssetArgs();

    await assertRestStatus(async function () {
      await distributorAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.UNAUTHORIZED, AssetError.NULL)
  });

  it('Create Asset', async function () {
    const assetArgs = assetFactory.getAssetArgs();

    const asset = await manufacturerAssetManagerContract.createAsset(assetArgs);
    assert.equal(asset.sku, assetArgs.sku, 'sku');

    existingSku = asset.sku;

  });

  it('Create Asset -- empty sku', async function () {
    const assetArgs = assetFactory.getAssetArgs({
      sku: ''
    });

    await assertRestStatus(async function () {
      await manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, AssetError.SKU_EMPTY)
  });

  it('Create Asset -- already exists', async function () {
    const assetArgs = assetFactory.getAssetArgs();
    assetArgs.sku = existingSku;

    await assertRestStatus(async function () {
      await manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, AssetError.SKU_EXISTS)
  });

  it('Handle Asset Event', async function () {
    const assetArgs = assetFactory.getAssetArgs();
    const asset = await manufacturerAssetManagerContract.createAsset(assetArgs);
    const assetContract = assetJs.bindAddress(manufacturerToken, asset.address);

    const assertHandleAssertEvent = async function (assetEvent, expectedState) {
      const handleAssetEventArgs = {
        sku: assetArgs.sku,
        assetEvent,
      };

      const newState = await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
      assert.equal(newState, expectedState, 'returned new state');

      const state = await assetContract.getState();
      assert.equal(state.assetState, expectedState, 'new state');
    }

    await assertHandleAssertEvent(AssetEvent.REQUEST_BIDS, AssetState.BIDS_REQUESTED);
    await assertHandleAssertEvent(AssetEvent.CHANGE_OWNER, AssetState.OWNER_UPDATED);
  });

  it('Handle Asset Event -- invalid event', async function () {
    const assetArgs = assetFactory.getAssetArgs();
    await manufacturerAssetManagerContract.createAsset(assetArgs);

    const handleAssetEventArgs = {
      sku: assetArgs.sku,
      assetEvent: AssetEvent.CHANGE_OWNER,
    };

    await assertRestStatus(async function () {
      await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    }, RestStatus.BAD_REQUEST, AssetError.NULL)

  });

  // TODO: fix this
  it.skip('Handle Asset Event -- asset not fonund', async function () {
    const assetArgs = assetFactory.getAssetArgs();
    const handleAssetEventArgs = {
      sku: assetArgs.sku,
      assetEvent: AssetEvent.REQUEST_BIDS,
    };

    await assert.shouldThrowRest(async function () {
      await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    }, RestStatus.NOT_FOUND, AssetError.SKU_NOT_FOUND);
  });

  // TODO: test transfer ownership call
});
