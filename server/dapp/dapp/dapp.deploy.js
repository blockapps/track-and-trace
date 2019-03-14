require('dotenv').config();
import "@babel/polyfill";
import ba from 'blockapps-rest';
import jwtDecode from 'jwt-decode';
import oauthHelper from '../../helpers/oauth';
import ttPermissionManagerJs from '../../dapp/ttPermission/ttPermissionManager';
import dappJs from './dapp';

// const {
//   rest6: rest
// } = ba;
// const {
//   assert,
//   config
// } = ba.common;
// const oauthHelper = require(`${process.cwd()}/helpers/oauth`);
// const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);
// import dappJs from './dapp';

// const {
//   TtRole
// } = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);

// ---------------------------------------------------
//   deploy the projects contracts
// ---------------------------------------------------

describe('Track and Trace - deploy contracts', function () {
  this.timeout(config.timeout * 10);

  before(() => {
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
  it('should upload the contracts', async function() {
    const adminEmail = oauthHelper.getEmailIdFromToken(process.env.ADMIN_TOKEN);
    console.log('Creating admin', adminEmail);
    const adminCreated = await oauthHelper.createStratoUser(process.env.ADMIN_TOKEN, adminEmail);
    assert.strictEqual(adminCreated.status, 200, adminCreated.message);

    // const masterEmail = oauthHelper.getEmailIdFromToken(process.env.MASTER_TOKEN);
    // console.log('Creating master', masterEmail);
    // const masterCreated = await oauthHelper.createStratoUser(process.env.MASTER_TOKEN, masterEmail);
    // assert.strictEqual(masterCreated.status, 200, masterCreated.message);

    // const distributorEmail = oauthHelper.getEmailIdFromToken(process.env.DISTRIBUTOR_TOKEN);
    // console.log('Creating distributor', distributorEmail);
    // const distributorCreated = await oauthHelper.createStratoUser(process.env.DISTRIBUTOR_TOKEN, distributorEmail);
    // assert.strictEqual(distributorCreated.status, 200, distributorCreated.message);

    // const manufacturerEmail = oauthHelper.getEmailIdFromToken(process.env.MANUFACTURER_TOKEN);
    // console.log('Creating manufacturer', manufacturerEmail);
    // const manufacturerCreated = await oauthHelper.createStratoUser(process.env.MANUFACTURER_TOKEN, manufacturerEmail);
    // assert.strictEqual(manufacturerCreated.status, 200, manufacturerCreated.message);

    // const retailerEmail = oauthHelper.getEmailIdFromToken(process.env.RETAILER_TOKEN);
    // console.log('Creating retailer', retailerEmail);
    // const retailerCreated = await oauthHelper.createStratoUser(process.env.RETAILER_TOKEN, retailerEmail);
    // assert.strictEqual(retailerCreated.status, 200, retailerCreated.message);

    // const regulatorEmail = oauthHelper.getEmailIdFromToken(process.env.REGULATOR_TOKEN);
    // console.log('Creating regulator', regulatorEmail);
    // const regulatorCreated = await oauthHelper.createStratoUser(process.env.REGULATOR_TOKEN, regulatorEmail);
    // assert.strictEqual(regulatorCreated.status, 200, regulatorCreated.message);

    // console.log('Permission Manager');
    // const ttPermissionManager = await ttPermissionManagerJs.uploadContract(process.env.ADMIN_TOKEN, process.env.MASTER_TOKEN);
    // console.log('Uploading dapp');
    // const dapp = await dappJs.uploadContract(process.env.ADMIN_TOKEN, ttPermissionManager);
    // const dappBind = await dappJs.bind(process.env.ADMIN_TOKEN, {
    //   name: dapp.name,
    //   address: dapp.address
    // });
    // const role = TtRole.ADMIN;
    // const args = {
    //   role,
    // }

    // console.log('Create Admin TTUser');
    // Object.assign(args, {
    //   account: adminCreated.address,
    //   username: adminEmail
    // });
    // const ttAdminUser = await dappBind.createUser(args);
    
    // console.log('Create Master TTUser');
    // Object.assign(args, {
    //   account: masterCreated.address,
    //   username: masterEmail
    // });
    // await dappBind.createUser(args);

    // console.log('Create Distributor TTUser');
    // Object.assign(args, {
    //   account: distributorCreated.address,
    //   username: distributorEmail,
    //   role: TtRole.DISTRIBUTOR
    // });
    // await dappBind.createUser(args);

    // console.log('Create Manufacturer TTUser');
    // Object.assign(args, {
    //   account: manufacturerCreated.address,
    //   username: manufacturerEmail,
    //   role: TtRole.MANUFACTURER
    // });
    // await dappBind.createUser(args);

    // console.log('Create Retailer TTUser');
    // Object.assign(args, {
    //   account: retailerCreated.address,
    //   username: retailerEmail,
    //   role: TtRole.RETAILER
    // });
    // await dappBind.createUser(args);
   
    // console.log('Create Regulator TTUser');
    // Object.assign(args, {
    //   account: regulatorCreated.address,
    //   username: regulatorEmail,
    //   role: TtRole.REGULATOR
    // });
    // await dappBind.createUser(args); 

    // console.log('Deployment');
    // const deployment = yield dapp.deploy(config.deployFilename);
    // assert.isDefined(deployment);
  })

})