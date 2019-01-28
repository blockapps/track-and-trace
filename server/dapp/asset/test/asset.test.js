require('co-mocha');

const { rest6: rest, common } = require('blockapps-rest');
const { assert, config, util } = common;

const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);
const assetJs = require(`${process.cwd()}/${config.dappPath}/asset/asset`);
const assetFactory = require(`${process.cwd()}/${config.dappPath}/asset/asset.factory`);


const TEST_TIMEOUT = 60000;

// TODO: TT-5 replace with predefined OAuth tokens
const adminName = util.uid('Admin');
const adminPassword = '1234';

const masterName = util.uid('Master');
const masterPassword = '1234';

describe('Asset Tests', function () {
  this.timeout(TEST_TIMEOUT);

  let adminUser, ttPermissionManagerContract;

  before(function* () {
    adminUser = yield rest.createUser(adminName, adminPassword);
    yield rest.fill(adminUser, true);

    masterUser = yield rest.createUser(masterName, masterPassword);
    ttPermissionManagerContract = yield ttPermissionManagerJs.uploadContract(adminUser, masterUser);
  });

  it('Create Asset', function* () {
    const args = assetFactory.getAssertArgs();
    const contract = yield assetJs.uploadContract(adminUser, ttPermissionManagerContract, args);

    const state = yield contract.getState();

    assert.equal(state.ttPermissionManager, ttPermissionManagerContract.address, 'permission manager address');
    assert.equal(state.uid, args.uid, 'uid');
  });
});
