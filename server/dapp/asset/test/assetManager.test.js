require('co-mocha');

const { common, rest6: rest } = require('blockapps-rest');
const { assert, config, util } = common;

const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);
const assetManagerJs = require(`${process.cwd()}/${config.dappPath}/asset/assetManager`);
const assetFactory = require(`${process.cwd()}/${config.dappPath}/asset/asset.factory`);


const TEST_TIMEOUT = 60000;

// TODO: TT-5 replace with predefined OAuth tokens
const adminName = util.uid('Admin');
const adminPassword = '1234';

const masterName = util.uid('Master');
const masterPassword = '1234';

const manufacturerName = util.uid('Manufacturer');
const manufacturerPassword = '1234';

describe('Asset Manager Tests', function () {
  this.timeout(TEST_TIMEOUT);

  let adminUser, masterUser, manufacturerUser, ttPermissionManager, contract;

  before(function* () {
    adminUser = yield rest.createUser(adminName, adminPassword);
    yield rest.fill(adminUser, true);

    masterUser = yield rest.createUser(masterName, masterPassword);

    manufacturerUser = yield rest.createUser(manufacturerName, manufacturerPassword);
    yield rest.fill(manufacturerUser, true);

    ttPermissionManager = yield ttPermissionManagerJs.uploadContract(adminUser, masterUser);
    contract = yield assetManagerJs.uploadContract(adminUser, ttPermissionManager);
  });

  it('Does Asset Exist -- asset does not exist ', function* () {
    const uid = util.iuid()

    const exists = yield contract.exists(uid);
    assert.equal(exists, false, 'contract does not exists');
  });
});
