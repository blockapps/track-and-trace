require('dotenv').config();
require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const { config, assert, cwd, util } = ba.common;

const ttPermissionManagerJs = require('../ttPermissionManager');
const userManager = require(`${process.cwd()}/${config.libPath}/auth/user/userManager`);

const ttPermission = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtPermission.sol`);
const { TtRole } = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);

const oauthHelper = require(`${process.cwd()}/helpers/oauth`);

const adminToken = process.env.ADMIN_TOKEN;
const masterToken = process.env.MASTER_TOKEN;

const bit = int => 1 << int;


/**
 * @see PermissionManager tests
 */

 describe('TTPermissionManager tests', function () {
  this.timeout(config.timeout)
  let adminAddress;

  before(function* () {
    const adminAddressResponse = yield rest.getKey(adminToken);
    adminAddress = adminAddressResponse.address;
  });

  it('Grant admin with TtRole.ADMIN permissions on construction', function* () {
    const contract = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken);
    const { permits, rolePermissions } = yield contract.getState();
    const permit = permits[1];
    assert.equal(permit.adrs, adminAddress, 'admin address in the array');
    assert.equal(permit.permissions, rolePermissions[TtRole.ADMIN], ' admin has admin permissions');
    assert.equal(permit.id, 'Admin', 'hardcoded id');
  })

  it('Grant basic permission', function* () {
    const contract = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken);
    const username = oauthHelper.getEmailIdFromToken(masterToken);
    const masterAddressResponse = yield rest.getKey(adminToken);
    const address = masterAddressResponse.address;
    // not yet permitted
    {
      const permissions = bit(ttPermission.CREATE_USER)
      const args = { address, permissions }
      const isPermitted = yield contract.check(args)
      assert.equal(isPermitted, false, 'not permitted')
    }
    // grant
    {
      const permissions = bit(ttPermission.CREATE_USER)
      const args = { address, id: username, permissions }
      yield contract.grant(args)
    }
    // permitted now
    {
      const permissions = bit(ttPermission.CREATE_USER)
      const args = { address, permissions }
      const isPermitted = yield contract.check(args)
      assert.equal(isPermitted, true, 'permitted')
    }
  })

  it.skip('Grant permission to transfer asset', function* () {
    const contract = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken)
    const manufacturerName = util.uid('Manufacturer');
    const manufacturerPassword = '1234';
    let manufacturerUser = yield rest.createUser(manufacturerName, manufacturerPassword);
    yield rest.fill(manufacturerUser, true);
    // not yet permitted
    {
      const isPermitted = yield contract.canTransferOwnershipMap(manufacturerUser);
      assert.equal(isPermitted, false, 'not permitted');
    }
    // grant
    {
      const permissions = bit(ttPermission.TRANSFER_OWNERSHIP_MAP);
      const args = { address: manufacturerUser.address, id: manufacturerUser.name, permissions };
      yield contract.grant(args);
    }
    // permitted now
    {
      const isPermitted = yield contract.canTransferOwnershipMap(manufacturerUser);
      assert.equal(isPermitted, true, 'permitted');
    }
  })

  it('Grant Role - Manufacturer', function* () {
    const contract = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken)
    const manufacturerName = util.uid('Manufacturer');
    const manufacturerPassword = '1234';
    let manufacturerUser = yield rest.createUser(manufacturerName, manufacturerPassword);
    yield rest.fill(manufacturerUser, true);
    // not yet permitted
    {
      const canTransferOwnershipMap = yield contract.canTransferOwnershipMap(manufacturerUser)
      assert.equal(canTransferOwnershipMap, false, 'not permitted - canTransferOwnershipMap')
      const canCreateAsset = yield contract.canCreateAsset(manufacturerUser)
      assert.equal(canCreateAsset, false, 'not permitted - canCreateAsset')
    }
    // grant
    {
      yield contract.grantManufacturerRole(manufacturerUser)
    }
    // permitted now
    {
      const canTransferOwnershipMap = yield contract.canTransferOwnershipMap(manufacturerUser)
      assert.equal(canTransferOwnershipMap, true, 'permitted - canTransferOwnershipMap')
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
})
