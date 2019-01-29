require('co-mocha');
const ba = require('blockapps-rest');

const { config, assert, cwd, util } = ba.common;
const yaml = require('yamljs');

const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/TtPermissionManager`);
const dappJs = require('./dapp');

// const utils = require(`${cwd}/server/utils`);
const { TtRole } = rest.getEnums(`${config.dappPath}/ttPermission/TtRole.sol`);

// const { orgIdToNameMapping } = require(`${cwd}/server/enums`);

// const userTokens = utils.loadAccessTokens();
// const adminToken = userTokens.admin;
// const masterToken = userTokens.master;
const ADMIN_ROLE = 'ADMIN'

// ---------------------------------------------------
//   deploy the projects contracts
// ---------------------------------------------------

describe('Track and Trace - deploy contracts', function () {
  this.timeout(config.timeout * 10);
  let presetFilename;

  before(() => {
    assert.isDefined(config.accountFilename, 'Data filename (input) argument missing. Set in config, or use --data <path>');
    assert.isDefined(config.deployFilename, 'Deployment filename (output) argument missing. Set in config');
    assert.isDefined(config.presetsDeployFilename, 'Presets Deployment filename (output) argument missing. Set in config');
    // The last arguement in CLI is presetFilename
    presetFilename = util.getArgString('--presetFilename', null) == null ? undefined : util.getArgString('--presetFilename', null);
  })

  //  uploading the admin contract and dependencies
  it('should upload the contracts', function* () {
    const adminEmail = utils.getEmailIdFromToken(adminToken);
    console.log('Creating admin', adminEmail);
    const adminCreated = yield utils.createUser(adminToken, adminEmail);
    assert.strictEqual(adminCreated.status, 200, adminCreated.message);

    const masterEmail = utils.getEmailIdFromToken(masterToken);
    console.log('Creating master', masterEmail);
    const masterCreated = yield utils.createUser(masterToken, masterEmail);
    assert.strictEqual(masterCreated.status, 200, masterCreated.message);

    console.log('Permission Manager');
    const ttPermissionManager = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken)
    console.log('Uploading dapp');
    const dapp = yield dappJs.uploadContract(adminToken, ttPermissionManager);

    const dappBind = yield dappJs.bind(adminToken, { name: dapp.name, address: dapp.address });
    const role = TtRole[ADMIN_ROLE];
    const args = {
      // orgIds: [orgIdToNameMapping[0].id],
      role,
    }

    console.log('Create Admin TTUser');
    Object.assign(args, {uid: 1, account: adminCreated.address, username: adminEmail });
    yield dappBind.createUser(args);

    console.log('Create Master TTUser');
    Object.assign(args, { uid: 2, account: masterCreated.address, username: masterEmail });

    console.log('Deployment');
    const deployment = yield dapp.deploy(config.deployFilename, config.presetsDeployFilename, presetFilename, userTokens);
    assert.isDefined(deployment);
  })

})
