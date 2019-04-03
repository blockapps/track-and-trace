import { fsUtil, parser } from 'blockapps-rest';
import { assert } from 'chai';

import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

import oauthHelper from '../../helpers/oauth';
const { get, post } = require(`${process.cwd()}/test/helpers/rest`);
const endpoints = require(`${process.cwd()}/api/v1/endpoints`);

import { factory } from '../../dapp/asset/asset.factory';

const adminToken = { token: process.env.ADMIN_TOKEN };
const manufacturerToken = { token: process.env.MANUFACTURER_TOKEN };

describe('Assets End-To-End Tests', function () {
  this.timeout(config.timeout);

  let TtRole;

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
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');

    // get assertError Enums
    const ttRoleSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`)
    TtRole = await parser.parseEnum(ttRoleSource);

    await createUser(manufacturerToken, TtRole.MANUFACTURER);
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
