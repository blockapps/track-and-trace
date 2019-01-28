require('co-mocha');

const { common, rest6: rest } = require('blockapps-rest');
const { assert, config, util } = common;

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const TtError = rest.getFields(`${process.cwd()}/${config.dappPath}/asset/TtError.sol`);

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

const distributorName = util.uid('Distributor');
const distributorPassword = '1234';


describe('Asset Manager Tests', function () {
  this.timeout(TEST_TIMEOUT);

  let adminUser, masterUser, manufacturerUser, distributorUser;
  let assetManagerContract, manufacturerAssetManagerContract, distributorAssetManagerContract;

  function bindAssetManagerContractToUser(user, contract) {
    let copy = Object.assign({}, contract);

    return assetManagerJs.bind(user, copy);
  }

  before(function* () {
    adminUser = yield rest.createUser(adminName, adminPassword);
    yield rest.fill(adminUser, true);

    masterUser = yield rest.createUser(masterName, masterPassword);

    manufacturerUser = yield rest.createUser(manufacturerName, manufacturerPassword);
    yield rest.fill(manufacturerUser, true);

    distributorUser = yield rest.createUser(distributorName, distributorPassword);
    yield rest.fill(distributorUser, true);

    const ttPermissionManager = yield ttPermissionManagerJs.uploadContract(adminUser, masterUser);
    assetManagerContract = yield assetManagerJs.uploadContract(adminUser, ttPermissionManager);

    yield ttPermissionManager.grantManufacturerRole(manufacturerUser);
    yield ttPermissionManager.grantDistributorRole(distributorUser);

    manufacturerAssetManagerContract = bindAssetManagerContractToUser(manufacturerUser, assetManagerContract);
    distributorAssetManagerContract = bindAssetManagerContractToUser(distributorUser, assetManagerContract);
  });

  it('Does Asset Exist -- asset does not exist ', function* () {
    const uid = util.iuid()

    const exists = yield assetManagerContract.exists(uid);
    assert.equal(exists, false, 'contract does not exists');
  });

  it('Create Asset -- unauthorized', function* () {
    const assetArgs = assetFactory.getAssertArgs();

    yield assert.shouldThrowRest(function* () {
      yield distributorAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.UNAUTHORIZED, TtError.NULL);
  });

  it('Create Asset', function* () {
    const assetArgs = assetFactory.getAssertArgs();

    const asset = yield manufacturerAssetManagerContract.createAsset(assetArgs);

    assert.equal(asset.uid, assetArgs.uid, 'uid');
  });

  it('Create Asset -- empty uid', function* () {
    const assetArgs = assetFactory.getAssertArgs({
      uid: ''
    });

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, TtError.UID_EMPTY);
  });

  it('Create Asset -- already exists', function* () {
    const assetArgs = assetFactory.getAssertArgs();

    yield manufacturerAssetManagerContract.createAsset(assetArgs);

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, TtError.UID_EXISTS);
  });
});
