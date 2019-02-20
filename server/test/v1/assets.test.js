require('dotenv').config();
require('co-mocha');

const { rest6: rest, common } = require('blockapps-rest');
const { assert, config } = common;

const { getEmailIdFromToken, createStratoUser } = require(`${process.cwd()}/helpers/oauth`);
const { get, post } = require(`${process.cwd()}/test/helpers/rest`);
const endpoints = require(`${process.cwd()}/api/v1/endpoints`);

const TtRole = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`).TtRole;
const assetFactory = require(`${process.cwd()}/${config.dappPath}/asset/asset.factory`);

const adminToken = process.env.ADMIN_TOKEN;
const manufacturerToken = process.env.MANUFACTURER_TOKEN;

const TEST_TIMEOUT = 60000;

describe('Assets End-To-End Tests', function () {
  this.timeout(TEST_TIMEOUT);

  const createUser = function* (userToken, role) {
    try {
      const user = yield get(endpoints.Users.me, userToken);
      assert.equal(user.role, role, 'user already created with different role');
    } catch (err) {
      console.log(err);
      const userEmail = getEmailIdFromToken(userToken);
      const createAccountResponse = yield createStratoUser(userToken, userEmail);
      const createTtUserArgs = {
        account: createAccountResponse.address,
        username: userEmail,
        role: role
      };
      yield post(endpoints.Users.users, createTtUserArgs, adminToken);
    }
  }

  before(function* () {
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    yield createUser(manufacturerToken, TtRole.MANUFACTURER);
  });

  it('Get Assets', function* () {
    const createAssetArgs = assetFactory.getAssetArgs();
    yield post(endpoints.Assets.assets, {asset: createAssetArgs} , manufacturerToken);

    const assets = yield get(endpoints.Assets.assets, manufacturerToken);
    assert.isAtLeast(assets.length, 1, 'assets list non-empty');
  });

  it('Get Asset', function* () {
    const createAssetArgs = assetFactory.getAssetArgs();
    const asset = yield post(endpoints.Assets.assets, {asset: createAssetArgs} , manufacturerToken);

    const retrieved = yield get(endpoints.Assets.asset.replace(':sku',asset.sku), manufacturerToken);
    assert.equal(asset.sku, retrieved.sku, 'Asset sku should match');
  });

  it('Create Asset', function* () {
    const createAssetArgs = assetFactory.getAssetArgs();
    const asset = yield post(endpoints.Assets.assets, {asset: createAssetArgs}, manufacturerToken);

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
