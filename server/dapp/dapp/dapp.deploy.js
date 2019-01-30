require('dotenv').config();
require('co-mocha');
const ba = require('blockapps-rest');
const { rest6: rest } = ba;
const { config, assert } = ba.common;
const jwtDecode = require('jwt-decode');
const oauthHelper = require(`${process.cwd()}/helpers/oauth`);
const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);
const dappJs = require('./dapp');

const { TtRole } = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);

const ADMIN_ROLE = 'ADMIN';
// ---------------------------------------------------
//   deploy the projects contracts
// ---------------------------------------------------

describe('Track and Trace - deploy contracts', function () {
  this.timeout(config.timeout * 10);

  before(() => {
    assert.isDefined(config.deployFilename, 'Deployment filename (output) argument missing. Set in config');
    assert.isDefined(process.env.ADMIN_TOKEN, 'ADMIN_TOKEN should be defined');
    assert.isDefined(process.env.MASTER_TOKEN, 'MASTER_TOKEN should be defined');
    })

  //  uploading the admin contract and dependencies
  it('should upload the contracts', function* () {
    const adminEmail = oauthHelper.getEmailIdFromToken(process.env.ADMIN_TOKEN);
    console.log('Creating admin', adminEmail);
    const adminCreated = yield oauthHelper.createStratoUser(process.env.ADMIN_TOKEN, adminEmail);
    assert.strictEqual(adminCreated.status, 200, adminCreated.message);

    const masterEmail = oauthHelper.getEmailIdFromToken(process.env.MASTER_TOKEN);
    console.log('Creating master', masterEmail);
    const masterCreated = yield oauthHelper.createStratoUser(process.env.MASTER_TOKEN, masterEmail);
    assert.strictEqual(masterCreated.status, 200, masterCreated.message);

    console.log('Permission Manager');
    const ttPermissionManager = yield ttPermissionManagerJs.uploadContract(process.env.ADMIN_TOKEN, process.env.MASTER_TOKEN);
    console.log('Uploading dapp');
    const dapp = yield dappJs.uploadContract(process.env.ADMIN_TOKEN, ttPermissionManager);
    const dappBind = yield dappJs.bind(process.env.ADMIN_TOKEN, { name: dapp.name, address: dapp.address });
    const role = TtRole[ADMIN_ROLE];
    const args = {
      role,
    }

    console.log('Create Admin TTUser');
    Object.assign(args, { account: adminCreated.address, username: adminEmail });
    yield dappBind.createUser(args);

    console.log('Create Master TTUser');
    Object.assign(args, { account: masterCreated.address, username: masterEmail });
    yield dappBind.createUser(args);

    console.log('Deployment');
    const deployment = yield dapp.deploy(config.deployFilename);
    assert.isDefined(deployment);
  })

})
