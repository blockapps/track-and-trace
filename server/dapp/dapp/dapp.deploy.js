require('co-mocha');
const ba = require('blockapps-rest');
const { rest6: rest } = require('blockapps-rest');
const { config, assert, cwd, util } = ba.common;
const jwtDecode = require('jwt-decode');
const yaml = require('yamljs');

const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/TtPermissionManager`);
const dappJs = require('./dapp');

// const utils = require(`${cwd}/server/utils`);
const { TtRole } = rest.getEnums(`${config.dappPath}/ttPermission/TtRole.sol`);
const { tokenFilename } = config
// const { orgIdToNameMapping } = require(`${cwd}/server/enums`);


// utils
const loadAccessTokens = function () {
  let userTokens;
  let envUserTokens = {};
  if (process.env.ADMIN_TOKEN && process.env.MASTER_TOKEN) {
    envUserTokens = {
      admin: process.env.ADMIN_TOKEN,
      master: process.env.MASTER_TOKEN,
      // not providing other users' tokens here
    };
  }
  if (tokenFilename) {
    const presetUserTokens = yaml.load(tokenFilename);
    if (!presetUserTokens) throw new Error('userTokens file is empty');
    userTokens = { ...presetUserTokens, ...envUserTokens };
  } else {
    userTokens = envUserTokens;
  }
  if (!userTokens || !userTokens.admin || !userTokens.master) {
    throw new Error(`ADMIN and MASTER tokens missing from environment and preset file - ${tokenFilename}`);
  }
  return userTokens
};

const getEmailIdFromToken = function(accessToken) {
  return (jwtDecode(accessToken)['email']);
};

const createUser = function* (accessToken, userIdOptional = null) {
  let address = null;
  try {
    const getKeyResponse = yield rest.getKey(accessToken);
    if (getKeyResponse && getKeyResponse.address) {
      address = getKeyResponse.address;
    } else {
      return { status: 404, message: 'user address not found' };
    }
  } catch (getKeyErr) {
    if (getKeyErr.status == 400) {
      try {
        const createKeyResponse = yield rest.createKey(accessToken);
        address = createKeyResponse.address;
        const userId = userIdOptional || getEmailIdFromToken(accessToken);
        yield rest.fill({ name: userId, address });
        if ((yield rest.getBalance(address)) < 1) {
          do {
            yield new Promise(resolve => setTimeout(resolve, 1000));
          } while ((yield rest.getBalance(address)) < 1);
        }
      } catch (createKeyErr) {
        return { status: createKeyErr.status, message: 'error creating user key or faucet account' };
      }
    } else {
      return { status: getKeyErr.status, message: `error getting user key; server returned error: ${getKeyErr}` };
    }
  }
  return { status: 200, message: 'success', address: address };
};

const userTokens = loadAccessTokens();
const adminToken = userTokens.admin;
const masterToken = userTokens.master;
const ADMIN_ROLE = 'ADMIN';



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
    const adminEmail = getEmailIdFromToken(adminToken);
    console.log('Creating admin', adminEmail);
    const adminCreated = yield createUser(adminToken, adminEmail);
    assert.strictEqual(adminCreated.status, 200, adminCreated.message);

    const masterEmail = getEmailIdFromToken(masterToken);
    console.log('Creating master', masterEmail);
    const masterCreated = yield createUser(masterToken, masterEmail);
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
    yield dappBind.createUser(args);

    console.log('Deployment');
    const deployment = yield dapp.deploy(config.deployFilename, config.presetsDeployFilename, presetFilename, userTokens);
    assert.isDefined(deployment);
  })

})
