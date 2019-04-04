import { assert } from 'chai';
import { factory } from '../../dapp/asset/asset.factory';
import { getEnums } from '../../helpers/parse';
import { get, post } from '../helpers/rest';
import endpoints from '../../api/v1/endpoints';
import testHelper from '../helpers/test';

// read config.yaml
import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

import dotenv from 'dotenv';
const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminToken = { token: process.env.ADMIN_TOKEN };
const manufacturerToken = { token: process.env.MANUFACTURER_TOKEN };

describe('Assets End-To-End Tests', function () {
  this.timeout(config.timeout);

  let TtRole;

  before(async function () {
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');

    // get assertError Enums
    TtRole = await getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);

    await testHelper.createUser(manufacturerToken, adminToken, TtRole.MANUFACTURER);
  });

  it('Get Assets', async function () {
    const createAssetArgs = factory.getAssetArgs();
    await post(endpoints.Assets.assets, { asset: createAssetArgs }, manufacturerToken.token);

    const assets = await get(endpoints.Assets.assets, manufacturerToken.token);
    assert.isAtLeast(assets.length, 1, 'assets list non-empty');
  });

  it('Get Asset', async function () {
    const createAssetArgs = factory.getAssetArgs();
    const asset = await post(endpoints.Assets.assets, { asset: createAssetArgs }, manufacturerToken.token);

    const retrieved = await get(endpoints.Assets.asset.replace(':sku', asset.sku), manufacturerToken.token);
    assert.equal(asset.sku, retrieved.sku, 'Asset sku should match');
  });

  it('Create Asset', async function () {
    const createAssetArgs = factory.getAssetArgs();
    const asset = await post(endpoints.Assets.assets, { asset: createAssetArgs }, manufacturerToken.token);

    assert.equal(asset.sku, createAssetArgs.sku, 'sku matches');
    assert.equal(asset.description, createAssetArgs.description, 'description matches');
    assert.sameDeepMembers(
      asset.keys,
      createAssetArgs.keys,
      'key array matches'
    );
    assert.sameDeepMembers(
      asset.values,
      createAssetArgs.values,
      'values array matches'
    );
  });
});
