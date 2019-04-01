import { rest, fsUtil, parser, util } from 'blockapps-rest';
import { assert } from 'chai';
import RestStatus from 'http-status-codes';

import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

import ttPermissionManagerJs from '../../ttPermission/ttPermissionManager';
import assetJs from '../asset';
import { factory } from '../asset.factory';

const adminToken = { token: process.env.ADMIN_TOKEN };
const masterToken = { token: process.env.MASTER_TOKEN };

describe('Asset Tests', function () {
  this.timeout(config.timeout);

  let ttPermissionManagerContract, AssetError, AssetState;
  let adminUser, masterUser;

  before(async function () {
    // get assertError Enums
    const assetErrorSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetError.sol`)
    AssetError = await parser.parseEnum(assetErrorSource);

    // get assetState Enums
    const assetStateSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`)
    AssetState = await parser.parseEnum(assetStateSource);

    adminUser = await rest.createUser(adminToken, { config });
    masterUser = await rest.createUser(masterToken, { config });
    ttPermissionManagerContract = await ttPermissionManagerJs.uploadContract(adminUser, masterUser);
  });

  it('Create Asset', async function () {
    const args = factory.getAssetArgs();
    const contract = await assetJs.uploadContract(adminToken, ttPermissionManagerContract, args);

    const state = await contract.getState();

    assert.equal(state.ttPermissionManager, ttPermissionManagerContract.address, 'permission manager address');
    assert.equal(state.sku, args.sku, 'sku');
    assert.equal(state.assetState, AssetState.CREATED, 'asset state');
  });

  it('Set Asset State', async function () {
    const assetArgs = factory.getAssetArgs();
    const contract = await assetJs.uploadContract(adminToken, ttPermissionManagerContract, assetArgs);

    const setAssetStateArgs = {
      assetState: AssetState.BIDS_REQUESTED
    };

    const callArgs = {
      contract,
      method: 'setAssetState',
      args: util.usc(setAssetStateArgs)
    }

    const [restStatus, assetError] = await rest.call(adminToken, callArgs, { config });
    assert.equal(restStatus, RestStatus.FORBIDDEN, 'rest status');
    assert.equal(assetError, AssetError.NULL, 'tt error');
  });
});
