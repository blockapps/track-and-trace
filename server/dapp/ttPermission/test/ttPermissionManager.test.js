import { rest } from 'blockapps-rest';
import { assert } from 'chai';
import { uploadContract } from '../ttPermissionManager';
import oauthHelper from '../../../helpers/oauth';

import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

// TODO: get TT roles using API
// const { TtRole } = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);

const adminToken = { token: process.env.ADMIN_TOKEN };
const masterToken = { token: process.env.MASTER_TOKEN };
const manufacturerToken = { token: process.env.MANUFACTURER_TOKEN };
const distributorToken = { token: process.env.DISTRIBUTOR_TOKEN };

/**
 * @see PermissionManager tests
 */

describe('TTPermissionManager tests', function () {
  this.timeout(config.timeout)
  let adminUser, masterUser, manufacturerUser, distributorUser;

  before(async function () {
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(masterToken, 'master token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');

    // TODO: add this if needed
    // adminUser = await oauthHelper.createStratoUser(adminToken);
    // masterUser = await oauthHelper.createStratoUser(masterToken);
    // manufacturerUser = await oauthHelper.createStratoUser(manufacturerToken);
    // distributorUser = await oauthHelper.createStratoUser(distributorToken);

    adminUser = await rest.createUser(adminToken, { config });
    masterUser = await rest.createUser(masterToken, { config });
    manufacturerUser = await rest.createUser(manufacturerToken, { config });
    distributorUser = await rest.createUser(distributorToken, { config });
  });

  it('Grant Role - Admin', async function () {
    const contract = await uploadContract(adminUser, masterUser);
    const username = oauthHelper.getEmailIdFromToken(adminToken.token);
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
      const expected = rolePermissions[ADMIN]
      assert.equal(permissions, expected, 'admin permissions')
    }
  })

  it('Grant Role - Asset Manager', async function () {
    const contract = await uploadContract(adminToken, masterToken)
    const username = oauthHelper.getEmailIdFromToken(masterToken);
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
      const expected = rolePermissions[ASSET_MANAGER]
      assert.equal(permissions, expected, 'asset manager permissions')
    }
  })

  it('Grant Role - Manufacturer', async function () {
    const contract = await uploadContract(adminToken, masterToken)
    const username = oauthHelper.getEmailIdFromToken(manufacturerToken);
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
      const expected = rolePermissions[MANUFACTURER]
      assert.equal(permissions, expected, 'manufacturer permissions')
    }
  })

  it('Grant Role - Distributor', async function () {
    const contract = await uploadContract(adminToken, masterToken)
    const username = oauthHelper.getEmailIdFromToken(distributorToken);
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
      const expected = rolePermissions[DISTRIBUTOR]
      assert.equal(permissions, expected, 'distributor permissions')
    }
  })
})
