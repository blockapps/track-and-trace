import { rest } from 'blockapps-rest';
import { assert } from 'chai';
import ttPermissionManager from '../ttPermissionManager';
import oauthHelper from '../../../helpers/oauth';

import config from '../../../load.config';

import dotenv from 'dotenv';
import { getEnums } from '../../../helpers/parse';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminCredentials = { token: process.env.ADMIN_TOKEN };
const masterCredentials = { token: process.env.MASTER_TOKEN };
const manufacturerCredentials = { token: process.env.MANUFACTURER_TOKEN };
const distributorCredentials = { token: process.env.DISTRIBUTOR_TOKEN };

const options = { config }
/**
 * @see PermissionManager tests
 */

describe('TTPermissionManager tests', function () {
  this.timeout(config.timeout)
  let adminUser, masterUser, manufacturerUser, distributorUser;
  let TtRole;

  before(async function () {
    // get TtRole Enums
    TtRole = await getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);

    assert.isDefined(adminCredentials, 'admin token is not defined');
    assert.isDefined(masterCredentials, 'master token is not defined');
    assert.isDefined(manufacturerCredentials, 'manufacturer token is not defined');
    assert.isDefined(distributorCredentials, 'distributor token is not defined');

    adminUser = await rest.createUser(adminCredentials, options);
    masterUser = await rest.createUser(masterCredentials, options);
    manufacturerUser = await rest.createUser(manufacturerCredentials, options);
    distributorUser = await rest.createUser(distributorCredentials, options);
  });

  it('Grant Role - Admin', async function () {
    const contract = await ttPermissionManager.uploadContract(adminUser, masterUser);
    const username = oauthHelper.getEmailIdFromToken(adminCredentials.token);
    const address = adminUser.address;
    Object.assign(adminUser, { username: username })
    // permitted
    {
      const canCreateUser = await contract.canCreateUser(adminUser)
      assert.equal(canCreateUser, true, 'permitted - canCreateUser')
    }
    // check bit mask
    {
      const permissions = await contract.getPermissions({ address: adminUser.address })
      const { rolePermissions } = await contract.getState()
      const expected = rolePermissions[TtRole.ADMIN]
      assert.equal(permissions, expected, 'admin permissions')
    }
  })

  it('Grant Role - Asset Manager', async function () {
    const contract = await ttPermissionManager.uploadContract(adminUser, masterUser)
    const username = oauthHelper.getEmailIdFromToken(masterCredentials.token);
    Object.assign(masterUser, { username: username })
    // not yet permitted
    {
      const canModifyAsset = await contract.canModifyAsset(masterUser)
      assert.equal(canModifyAsset, false, 'not permitted - canModifyAsset')
      const canModifyMap = await contract.canModifyMap(masterUser)
      assert.equal(canModifyMap, false, 'not permitted - canModifyMap')

    }
    // grant
    {
      await contract.grantAssetManager(masterUser)
    }
    // permitted now
    {
      const canModifyAsset = await contract.canModifyAsset(masterUser)
      assert.equal(canModifyAsset, true, 'permitted - canModifyAsset')
      const canModifyMap = await contract.canModifyMap(masterUser)
      assert.equal(canModifyMap, true, 'permitted - canModifyMap')
    }
    // check bit mask
    {
      const permissions = await contract.getPermissions({ address: masterUser.address })
      const { rolePermissions } = await contract.getState()
      const expected = rolePermissions[TtRole.ASSET_MANAGER]
      assert.equal(permissions, expected, 'asset manager permissions')
    }
  })

  it('Grant Role - Manufacturer', async function () {
    const contract = await ttPermissionManager.uploadContract(adminCredentials, masterCredentials)
    const username = oauthHelper.getEmailIdFromToken(manufacturerCredentials.token);
    const address = manufacturerUser.address;
    Object.assign(manufacturerUser, { username: username })
    // not yet permitted
    {
      const canTransferOwnership = await contract.canTransferOwnership(manufacturerUser)
      assert.equal(canTransferOwnership, false, 'not permitted - canTransferOwnership')
      const canCreateAsset = await contract.canCreateAsset(manufacturerUser)
      assert.equal(canCreateAsset, false, 'not permitted - canCreateAsset')
    }
    // grant
    {
      await contract.grantManufacturerRole(manufacturerUser)
    }
    // permitted now
    {
      const canTransferOwnership = await contract.canTransferOwnership(manufacturerUser)
      assert.equal(canTransferOwnership, true, 'permitted - canTransferOwnership')
      const canCreateAsset = await contract.canCreateAsset(manufacturerUser)
      assert.equal(canCreateAsset, true, 'permitted - canCreateAsset')
    }
    // check bit mask
    {
      const permissions = await contract.getPermissions({ address: manufacturerUser.address })
      const { rolePermissions } = await contract.getState()
      const expected = rolePermissions[TtRole.MANUFACTURER]
      assert.equal(permissions, expected, 'manufacturer permissions')
    }
  })

  it('Grant Role - Distributor', async function () {
    const contract = await ttPermissionManager.uploadContract(adminCredentials, masterCredentials)
    const username = oauthHelper.getEmailIdFromToken(distributorCredentials.token);
    const address = distributorUser.address;
    Object.assign(distributorUser, { username: username })
    // not yet permitted
    {
      const canTransferOwnership = await contract.canTransferOwnership(distributorUser)
      assert.equal(canTransferOwnership, false, 'not permitted - canTransferOwnership')

    }
    // grant
    {
      await contract.grantDistributorRole(distributorUser)
    }
    // permitted now
    {
      const canTransferOwnership = await contract.canTransferOwnership(distributorUser)
      assert.equal(canTransferOwnership, true, 'permitted - canTransferOwnership')
    }
    // check bit mask
    {
      const permissions = await contract.getPermissions({ address: distributorUser.address })
      const { rolePermissions } = await contract.getState()
      const expected = rolePermissions[TtRole.DISTRIBUTOR]
      assert.equal(permissions, expected, 'distributor permissions')
    }
  })
})
