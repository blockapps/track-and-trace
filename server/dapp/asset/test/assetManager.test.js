import { rest, util } from 'blockapps-rest';
import { assert } from 'chai';
import RestStatus from 'http-status-codes';

import config from '../../../load.config';

import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

import oauthHelper from '../../../helpers/oauth';
import ttPermissionManagerJs from '../../ttPermission/ttPermissionManager';
import assetManagerJs from '../../asset/assetManager';
import assetJs from '../asset';
import { factory } from '../asset.factory';
import { assertRestStatus } from '../../../helpers/assertRestStatus';
import { getEnums } from '../../../helpers/parse';

const adminCredentials = { token: process.env.ADMIN_TOKEN };
const masterCredentials = { token: process.env.MASTER_TOKEN };
const manufacturerCredentials = { token: process.env.DISTRIBUTOR_TOKEN };
const distributorCredentials = { token: process.env.MANUFACTURER_TOKEN };

const options = { config }
let existingSku;

describe('Asset Manager Tests', function () {
  this.timeout(config.timeout);

  let assetManagerContract, manufacturerAssetManagerContract, distributorAssetManagerContract;
  let AssetError, AssetState, AssetEvent;
  let adminUser, masterUser, manufacturerUser, distributorUser;

  function bindAssetManagerContractToUser(user, contract) {
    let copy = Object.assign({}, contract);

    return assetManagerJs.bind(user, copy);
  }

  before(async function () {
    assert.isDefined(adminCredentials.token, 'admin token is not defined');
    assert.isDefined(masterCredentials.token, 'master token is not defined');
    assert.isDefined(manufacturerCredentials.token, 'manufacturer token is not defined');
    assert.isDefined(distributorCredentials.token, 'distributor token is not defined');

    // get assertError Enums
    AssetError = await getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`);

    // get assertState Enums
    AssetState = await getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`);

    // get assertEvent Enums
    AssetEvent = await getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetEvent.sol`);


    adminUser = await rest.createUser(adminCredentials, options);
    masterUser = await rest.createUser(masterCredentials, options);
    manufacturerUser = await rest.createUser(manufacturerCredentials, options);
    distributorUser = await rest.createUser(distributorCredentials, options);

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
    const assetArgs = factory.getAssetArgs();

    await assertRestStatus(async function () {
      await distributorAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.UNAUTHORIZED, AssetError.NULL)
  });

  it('Create Asset', async function () {
    const assetArgs = factory.getAssetArgs();

    const asset = await manufacturerAssetManagerContract.createAsset(assetArgs);
    assert.equal(asset.sku, assetArgs.sku, 'sku');

    existingSku = asset.sku;

  });

  it('Create Asset -- empty sku', async function () {
    const assetArgs = factory.getAssetArgs({
      sku: ''
    });

    await assertRestStatus(async function () {
      await manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, AssetError.SKU_EMPTY)
  });

  it('Create Asset -- already exists', async function () {
    const assetArgs = factory.getAssetArgs();
    assetArgs.sku = existingSku;

    await assertRestStatus(async function () {
      await manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, AssetError.SKU_EXISTS)
  });

  it('Handle Asset Event', async function () {
    const assetArgs = factory.getAssetArgs();
    const asset = await manufacturerAssetManagerContract.createAsset(assetArgs);
    const assetContract = assetJs.bindAddress(manufacturerCredentials, asset.address);

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
    const assetArgs = factory.getAssetArgs();
    await manufacturerAssetManagerContract.createAsset(assetArgs);

    const handleAssetEventArgs = {
      sku: assetArgs.sku,
      assetEvent: AssetEvent.CHANGE_OWNER,
    };

    await assertRestStatus(async function () {
      await manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    }, RestStatus.BAD_REQUEST, AssetError.NULL)

  });
});
