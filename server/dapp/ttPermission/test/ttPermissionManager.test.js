require('dotenv').config();
require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const { config, assert, cwd } = ba.common;

const ttPermissionManagerJs = require('../ttPermissionManager');

const { TtRole } = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);

const oauthHelper = require(`${process.cwd()}/helpers/oauth`);

const adminToken = process.env.ADMIN_TOKEN;
const masterToken = process.env.MASTER_TOKEN;
const manufacturerToken = process.env.MANUFACTURER_TOKEN;
const distributorToken = process.env.DISTRIBUTOR_TOKEN;

/**
 * @see PermissionManager tests
 */

 describe('TTPermissionManager tests', function () {
  this.timeout(config.timeout)
  let adminUser, masterUser, manufacturerUser, distributorUser;

  before(function* () {
    assert.isDefined(adminToken, 'manufacturer token is not defined');
    assert.isDefined(masterToken, 'distributor token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');

    adminUser = yield oauthHelper.createStratoUser(adminToken);
    masterUser = yield oauthHelper.createStratoUser(masterToken);
    manufacturerUser = yield oauthHelper.createStratoUser(manufacturerToken);
    distributorUser = yield oauthHelper.createStratoUser(distributorToken);
  });

  it('Grant Role - Admin', function* () {
    const contract = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken);
    const username = oauthHelper.getEmailIdFromToken(adminToken);
    const address = adminUser.address;
    Object.assign(adminUser , { username: username })
    // permitted
    {
      const canCreateUser = yield contract.canCreateUser(adminUser)
      assert.equal(canCreateUser, true, 'permitted - canCreateUser')
    }
    // check bit mask
    {
      const permissions = yield contract.getPermissions({ address: adminUser.address })
      const { rolePermissions } = yield contract.getState()
      const expected = rolePermissions[TtRole.ADMIN]
      assert.equal(permissions, expected, 'admin permissions')
    }
  })

  it('Grant Role - Asset Manager', function* () {
    const contract = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken)
    const username = oauthHelper.getEmailIdFromToken(masterToken);
    Object.assign(masterUser,{ username: username })
    // not yet permitted
    {
      const canModifyAsset = yield contract.canModifyAsset(masterUser)
      assert.equal(canModifyAsset, false, 'not permitted - canModifyAsset')
      const canModifyMap = yield contract.canModifyMap(masterUser)
      assert.equal(canModifyMap, false, 'not permitted - canModifyMap')

    }
    // grant
    {
      yield contract.grantAssetManager(masterUser)
    }
    // permitted now
    {
      const canModifyAsset = yield contract.canModifyAsset(masterUser)
      assert.equal(canModifyAsset, true, 'permitted - canModifyAsset')
      const canModifyMap = yield contract.canModifyMap(masterUser)
      assert.equal(canModifyMap, true, 'permitted - canModifyMap')
    }
    // check bit mask
    {
      const permissions = yield contract.getPermissions({ address: masterUser.address })
      const { rolePermissions } = yield contract.getState()
      const expected = rolePermissions[TtRole.ASSET_MANAGER]
      assert.equal(permissions, expected, 'asset manager permissions')
    }
  })

  it('Grant Role - Manufacturer', function* () {
    const contract = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken)
    const username = oauthHelper.getEmailIdFromToken(manufacturerToken);
    const address = manufacturerUser.address;
    Object.assign(manufacturerUser,{ username: username })
    // not yet permitted
    {
      const canTransferOwnership = yield contract.canTransferOwnership(manufacturerUser)
      assert.equal(canTransferOwnership, false, 'not permitted - canTransferOwnership')
      const canCreateAsset = yield contract.canCreateAsset(manufacturerUser)
      assert.equal(canCreateAsset, false, 'not permitted - canCreateAsset')
    }
    // grant
    {
      yield contract.grantManufacturerRole(manufacturerUser)
    }
    // permitted now
    {
      const canTransferOwnership = yield contract.canTransferOwnership(manufacturerUser)
      assert.equal(canTransferOwnership, true, 'permitted - canTransferOwnership')
      const canCreateAsset = yield contract.canCreateAsset(manufacturerUser)
      assert.equal(canCreateAsset, true, 'permitted - canCreateAsset')
    }
    // check bit mask
    {
      const permissions = yield contract.getPermissions({ address: manufacturerUser.address })
      const { rolePermissions } = yield contract.getState()
      const expected = rolePermissions[TtRole.MANUFACTURER]
      assert.equal(permissions, expected, 'manufacturer permissions')
    }
  })

  it('Grant Role - Distributor', function* () {
    const contract = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken)
    const username = oauthHelper.getEmailIdFromToken(distributorToken);
    const address = distributorUser.address;
    Object.assign(distributorUser,{ username: username })
    // not yet permitted
    {
      const canTransferOwnership = yield contract.canTransferOwnership(distributorUser)
      assert.equal(canTransferOwnership, false, 'not permitted - canTransferOwnership')

    }
    // grant
    {
      yield contract.grantDistributorRole(distributorUser)
    }
    // permitted now
    {
      const canTransferOwnership = yield contract.canTransferOwnership(distributorUser)
      assert.equal(canTransferOwnership, true, 'permitted - canTransferOwnership')
    }
    // check bit mask
    {
      const permissions = yield contract.getPermissions({ address: distributorUser.address })
      const { rolePermissions } = yield contract.getState()
      const expected = rolePermissions[TtRole.DISTRIBUTOR]
      assert.equal(permissions, expected, 'distributor permissions')
    }
  })
})
