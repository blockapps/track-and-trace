import RestStatus from 'http-status-codes';
import { assert } from 'chai';
import oauthHelper from '../../helpers/oauth';
import ttPermissionManagerJs from '../ttPermission/ttPermissionManager';
import dappJs from './dapp';

import config from '../../load.config';

import dotenv from 'dotenv';
import { getEnums } from '../../helpers/parse';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminCredentials = { token: process.env.ADMIN_TOKEN };
const masterCredentials = { token: process.env.MASTER_TOKEN };
const manufacturerCredentials = { token: process.env.MANUFACTURER_TOKEN };
const distributorCredentials = { token: process.env.DISTRIBUTOR_TOKEN };
const retailerCredentials = { token: process.env.RETAILER_TOKEN };
const regulatorCredentials = { token: process.env.REGULATOR_TOKEN };

// ---------------------------------------------------
//   deploy the projects contracts
// ---------------------------------------------------

describe('Track and Trace - deploy contracts', function () {
  this.timeout(config.timeout * 10);
  let TtRole;

  before(async () => {
    // get ttRole Enums
    TtRole = await getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);

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
    const adminEmail = oauthHelper.getEmailIdFromToken(adminCredentials.token);
    console.log('Creating admin', adminEmail);
    const adminResponse = await oauthHelper.createStratoUser(adminCredentials, adminEmail);
    assert.strictEqual(adminResponse.status, RestStatus.OK, adminResponse.message);

    const masterEmail = oauthHelper.getEmailIdFromToken(masterCredentials.token);
    console.log('Creating master', masterEmail);
    const masterResponse = await oauthHelper.createStratoUser(masterCredentials, masterEmail);
    assert.strictEqual(masterResponse.status, RestStatus.OK, masterResponse.message);

    const distributorEmail = oauthHelper.getEmailIdFromToken(distributorCredentials.token);
    console.log('Creating distributor', distributorEmail);
    const distributorResponse = await oauthHelper.createStratoUser(distributorCredentials, distributorEmail);
    assert.strictEqual(distributorResponse.status, RestStatus.OK, distributorResponse.message);

    const manufacturerEmail = oauthHelper.getEmailIdFromToken(manufacturerCredentials.token);
    console.log('Creating manufacturer', manufacturerEmail);
    const manufacturerResponse = await oauthHelper.createStratoUser(manufacturerCredentials, manufacturerEmail);
    assert.strictEqual(manufacturerResponse.status, RestStatus.OK, manufacturerResponse.message);

    const retailerEmail = oauthHelper.getEmailIdFromToken(retailerCredentials.token);
    console.log('Creating retailer', retailerEmail);
    const retailerResponse = await oauthHelper.createStratoUser(retailerCredentials, retailerEmail);
    assert.strictEqual(retailerResponse.status, RestStatus.OK, retailerResponse.message);

    const regulatorEmail = oauthHelper.getEmailIdFromToken(regulatorCredentials.token);
    console.log('Creating regulator', regulatorEmail);
    const regulatorResponse = await oauthHelper.createStratoUser(regulatorCredentials, regulatorEmail);
    assert.strictEqual(regulatorResponse.status, RestStatus.OK, regulatorResponse.message);

    console.log('Permission Manager');
    const ttPermissionManager = await ttPermissionManagerJs.uploadContract(adminResponse.user, masterResponse.user);
    console.log('Uploading dapp');
    const dapp = await dappJs.uploadContract(adminResponse.user, ttPermissionManager);
    const dappBind = await dappJs.bind(adminResponse.user, {
      name: dapp.name,
      address: dapp.address
    });
    const role = TtRole.ADMIN;
    const args = {
      role,
    }

    console.log('Create Admin TTUser');
    Object.assign(args, {
      account: adminResponse.user.address,
      username: adminEmail
    });
    const ttAdminUser = await dappBind.createUser(args);

    console.log('Create Master TTUser');
    Object.assign(args, {
      account: masterResponse.user.address,
      username: masterEmail
    });
    await dappBind.createUser(args);

    console.log('Create Distributor TTUser');
    Object.assign(args, {
      account: distributorResponse.user.address,
      username: distributorEmail,
      role: TtRole.DISTRIBUTOR
    });
    await dappBind.createUser(args);

    console.log('Create Manufacturer TTUser');
    Object.assign(args, {
      account: manufacturerResponse.user.address,
      username: manufacturerEmail,
      role: TtRole.MANUFACTURER
    });
    await dappBind.createUser(args);

    console.log('Create Retailer TTUser');
    Object.assign(args, {
      account: retailerResponse.user.address,
      username: retailerEmail,
      role: TtRole.RETAILER
    });
    await dappBind.createUser(args);

    console.log('Create Regulator TTUser');
    Object.assign(args, {
      account: regulatorResponse.user.address,
      username: regulatorEmail,
      role: TtRole.REGULATOR
    });
    await dappBind.createUser(args);

    console.log('Deployment');
    const deployment = await dapp.deploy(config.deployFilename);
    assert.isDefined(deployment);
  })

})