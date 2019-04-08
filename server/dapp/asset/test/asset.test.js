import { rest, util } from 'blockapps-rest';
import { assert } from 'chai';
import RestStatus from 'http-status-codes';

import ttPermissionManagerJs from '../../ttPermission/ttPermissionManager';
import assetJs from '../asset';
import { factory } from '../asset.factory';
import { getEnums } from '../../../helpers/parse';

import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminCredentials = { token: process.env.ADMIN_TOKEN };
const masterCredentials = { token: process.env.MASTER_TOKEN };

const options = { config }

describe('Asset Tests', function () {
  this.timeout(config.timeout);

  let ttPermissionManagerContract, AssetError, AssetState;
  let adminUser, masterUser;

  before(async function () {
    assert.isDefined(adminCredentials.token, 'admin token is not defined');
    assert.isDefined(masterCredentials.token, 'master token is not defined');

    // get assertError Enums
    AssetError = await getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`)

    // get assetState Enums
    AssetState = await getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`)

    adminUser = await rest.createUser(adminCredentials, options);
    masterUser = await rest.createUser(masterCredentials, options);
    ttPermissionManagerContract = await ttPermissionManagerJs.uploadContract(adminUser, masterUser);
  });

  it('Create Asset', async function () {
    const args = factory.getAssetArgs();
    const contract = await assetJs.uploadContract(adminCredentials, ttPermissionManagerContract, args);

    const state = await contract.getState();

    assert.equal(state.ttPermissionManager, ttPermissionManagerContract.address, 'permission manager address');
    assert.equal(state.sku, args.sku, 'sku');
    assert.equal(state.assetState, AssetState.CREATED, 'asset state');
  });

  it('Set Asset State', async function () {
    const assetArgs = factory.getAssetArgs();
    const contract = await assetJs.uploadContract(adminCredentials, ttPermissionManagerContract, assetArgs);

    const setAssetStateArgs = {
      assetState: AssetState.BIDS_REQUESTED
    };

    const callArgs = {
      contract,
      method: 'setAssetState',
      args: util.usc(setAssetStateArgs)
    }

    const [restStatus, assetError] = await rest.call(adminCredentials, callArgs, options);
    assert.equal(restStatus, RestStatus.FORBIDDEN, 'rest status');
    assert.equal(assetError, AssetError.NULL, 'tt error');
  });
});
