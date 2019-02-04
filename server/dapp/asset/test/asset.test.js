require('co-mocha');

const { rest6: rest, common } = require('blockapps-rest');
const { assert, config, util } = common;

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const TtError = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/TtError.sol`).TtError;
const AssetState = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`).AssetState;

const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);
const assetJs = require(`${process.cwd()}/${config.dappPath}/asset/asset`);
const assetFactory = require(`${process.cwd()}/${config.dappPath}/asset/asset.factory`);


const adminToken = process.env.ADMIN_TOKEN;
const masterToken = process.env.MASTER_TOKEN;

const TEST_TIMEOUT = 60000;

describe('Asset Tests', function () {
  this.timeout(TEST_TIMEOUT);

  let ttPermissionManagerContract;

  before(function* () {
    ttPermissionManagerContract = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken);
  });

  it('Create Asset', function* () {
    const args = assetFactory.getAssertArgs();
    const contract = yield assetJs.uploadContract(adminToken, ttPermissionManagerContract, args);

    const state = yield contract.getState();

    assert.equal(state.ttPermissionManager, ttPermissionManagerContract.address, 'permission manager address');
    assert.equal(state.uid, args.uid, 'uid');
    assert.equal(state.assetState, AssetState.CREATED, 'asset state');
  });

  it('Set Asset State', function* () {
    const assetArgs = assetFactory.getAssertArgs();
    const contract = yield assetJs.uploadContract(adminToken, ttPermissionManagerContract, assetArgs);

    const setAssetStateArgs = {
      assetState: AssetState.BIDS_REQUESTED
    };

    const [restStatus, ttError, ] = yield rest.callMethod(adminToken, contract, 'setAssetState', util.usc(setAssetStateArgs));
    assert.equal(restStatus, RestStatus.OK, 'rest status');
    assert.equal(ttError, TtError.NULL, 'tt error');

    const state = yield contract.getState();
    assert.equal(state.assetState, setAssetStateArgs.assetState, 'asset state');
  });
});
