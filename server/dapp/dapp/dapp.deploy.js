import { assert } from 'chai';
import { fsUtil, parser } from 'blockapps-rest';
import oauthHelper from '../../helpers/oauth';
import ttPermissionManagerJs from '../ttPermission/ttPermissionManager';
import dappJs from './dapp';

import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminToken = { token: process.env.ADMIN_TOKEN };
const masterToken = { token: process.env.MASTER_TOKEN };
const manufacturerToken = { token: process.env.MANUFACTURER_TOKEN };
const distributorToken = { token: process.env.DISTRIBUTOR_TOKEN };
const retailerToken = { token: process.env.RETAILER_TOKEN };
const regulatorToken = { token: process.env.REGULATOR_TOKEN };

// ---------------------------------------------------
//   deploy the projects contracts
// ---------------------------------------------------

describe('Track and Trace - deploy contracts', function () {
  this.timeout(config.timeout * 10);
  let TtRole;

  before(async () => {
    // get TtRole Enums
    const ttRoleSource = fsUtil.get(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`)
    TtRole = await parser.parseEnum(ttRoleSource);

    assert.isDefined(config.deployFilename, 'Deployment filename (output) argument missing. Set in config');
    assert.isDefined(process.env.ADMIN_TOKEN, 'ADMIN_TOKEN should be defined');
    assert.isDefined(process.env.MASTER_TOKEN, 'MASTER_TOKEN should be defined');
    assert.isDefined(process.env.DISTRIBUTOR_TOKEN, 'DISTRIBUTOR_TOKEN should be defined');
    assert.isDefined(process.env.MANUFACTURER_TOKEN, 'MANUFACTURER_TOKEN should be defined');
    assert.isDefined(process.env.RETAILER_TOKEN, 'RETAILER_TOKEN should be defined');
    assert.isDefined(process.env.REGULATOR_TOKEN, 'REGULATOR_TOKEN should be defined');
  });

  // Create users
  // Upload admin contract
  it('should upload the contracts', async function () {
    const adminEmail = oauthHelper.getEmailIdFromToken(adminToken.token);
    console.log('Creating admin', adminEmail);
    const adminCreated = await oauthHelper.createStratoUser(adminToken, adminEmail);
    assert.strictEqual(adminCreated.status, 200, adminCreated.message);

    const masterEmail = oauthHelper.getEmailIdFromToken(masterToken.token);
    console.log('Creating master', masterEmail);
    const masterCreated = await oauthHelper.createStratoUser(masterToken, masterEmail);
    assert.strictEqual(masterCreated.status, 200, masterCreated.message);

    const distributorEmail = oauthHelper.getEmailIdFromToken(distributorToken.token);
    console.log('Creating distributor', distributorEmail);
    const distributorCreated = await oauthHelper.createStratoUser(distributorToken, distributorEmail);
    assert.strictEqual(distributorCreated.status, 200, distributorCreated.message);

    const manufacturerEmail = oauthHelper.getEmailIdFromToken(manufacturerToken.token);
    console.log('Creating manufacturer', manufacturerEmail);
    const manufacturerCreated = await oauthHelper.createStratoUser(manufacturerToken, manufacturerEmail);
    assert.strictEqual(manufacturerCreated.status, 200, manufacturerCreated.message);

    const retailerEmail = oauthHelper.getEmailIdFromToken(retailerToken.token);
    console.log('Creating retailer', retailerEmail);
    const retailerCreated = await oauthHelper.createStratoUser(retailerToken, retailerEmail);
    assert.strictEqual(retailerCreated.status, 200, retailerCreated.message);

    const regulatorEmail = oauthHelper.getEmailIdFromToken(regulatorToken.token);
    console.log('Creating regulator', regulatorEmail);
    const regulatorCreated = await oauthHelper.createStratoUser(regulatorToken, regulatorEmail);
    assert.strictEqual(regulatorCreated.status, 200, regulatorCreated.message);

    console.log('Permission Manager');
    const ttPermissionManager = await ttPermissionManagerJs.uploadContract(adminCreated.user, masterCreated.user);
    console.log('Uploading dapp');
    const dapp = await dappJs.uploadContract(adminCreated.user, ttPermissionManager);
    const dappBind = await dappJs.bind(adminCreated.user, {
      name: dapp.name,
      address: dapp.address
    });
    const role = TtRole.ADMIN;
    const args = {
      role,
    }

    console.log('Create Admin TTUser');
    Object.assign(args, {
      account: adminCreated.user.address,
      username: adminEmail
    });
    const ttAdminUser = await dappBind.createUser(args);

    console.log('Create Master TTUser');
    Object.assign(args, {
      account: masterCreated.user.address,
      username: masterEmail
    });
    await dappBind.createUser(args);

    console.log('Create Distributor TTUser');
    Object.assign(args, {
      account: distributorCreated.user.address,
      username: distributorEmail,
      role: TtRole.DISTRIBUTOR
    });
    await dappBind.createUser(args);

    console.log('Create Manufacturer TTUser');
    Object.assign(args, {
      account: manufacturerCreated.user.address,
      username: manufacturerEmail,
      role: TtRole.MANUFACTURER
    });
    await dappBind.createUser(args);

    console.log('Create Retailer TTUser');
    Object.assign(args, {
      account: retailerCreated.user.address,
      username: retailerEmail,
      role: TtRole.RETAILER
    });
    await dappBind.createUser(args);

    console.log('Create Regulator TTUser');
    Object.assign(args, {
      account: regulatorCreated.user.address,
      username: regulatorEmail,
      role: TtRole.REGULATOR
    });
    await dappBind.createUser(args);

    console.log('Deployment');
    const deployment = await dapp.deploy(config.deployFilename);
    assert.isDefined(deployment);
  })

})