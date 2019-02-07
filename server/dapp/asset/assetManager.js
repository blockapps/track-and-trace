const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const permissionHashmapJs = require(`${process.cwd()}/${config.libPath}/auth/permission/permissionedHashmap`);

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);

const assetJs = require(`${process.cwd()}/${config.dappPath}/asset/asset`);
const contractUtils = require(`${process.cwd()}/${config.dappPath}/asset/contractUtils`);

const contractName = 'AssetManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/asset/contracts/AssetManager.sol`;


function* uploadContract(user, ttPermissionManagerContract) {
  const contractArgs = {
    ttPermissionManager: ttPermissionManagerContract.address
  };

  const contract = yield rest.uploadContract(user, contractName, contractFilename, util.usc(contractArgs));
  yield compileSearch(contract);
  contract.src = 'removed';

  yield ttPermissionManagerContract.grantAssetManager(contract);

  return bind(user, contract);
}

function* compileSearch(contract) {
  rest.verbose('compileSearch', contractName);

  const isSearchable = yield rest.isSearchable(contract.codeHash);
  if (isSearchable) return;

  // compile + dependencies
  const searchable = [assetJs.contractName, contractName];
  yield rest.compileSearch(searchable, contractName, contractFilename);
}

function bind(user, contract) {
  contract.exists = function* (uid) {
    return yield exists(user, contract, uid);
  }

  contract.createAsset = function* (args) {
    return yield createAssert(user, contract, args);
  }

  contract.handleAssetEvent = function* (args) {
    return yield handleAssetEvent(user, contract, args);
  }

  contract.getAssets = function* (args) {
    return yield getAssets(user, contract, args);
  }

  return contract;
}

function* exists(user, contract, uid) {
  rest.verbose('exists', uid);

  const method = 'exists';
  const args = { uid };

  const result = yield rest.callMethod(user, contract, method, util.usc(args));

  return result[0] === true;
}

function* createAssert(user, contract, args) {
  rest.verbose('createAsset', args);

  const method = 'createAsset';
  const [restStatus, assetError, assetAddress] = yield rest.callMethod(user, contract, method, util.usc(args));

  if (restStatus != RestStatus.CREATED) throw new rest.RestError(restStatus, assetError, { method, args });

  const asset = yield contractUtils.waitForAddress(assetJs.contractName, assetAddress);

  return asset;
}

function* handleAssetEvent(user, contract, args) {
  rest.verbose('handleAssetEvent', args);

  const method = 'handleAssetEvent';
  const [restStatus, assetError, searchCounter, newState] = yield rest.callMethod(user, contract, method, util.usc(args));

  if (restStatus != RestStatus.OK) throw new rest.RestError(restStatus, assetError, { method, args });

  yield assetJs.waitForRequiredUpdate(args.uid, searchCounter);

  return newState;
}

function* getAssets(user, contract, args) {
  rest.verbose('getAssets', args);

  const { assets: assetsHashMap } = yield rest.getState(contract);
  const hashmap = permissionHashmapJs.bindAddress(user, assetsHashMap);

  const { values } = yield hashmap.getState();
  const addresses = values.slice(1);

  const results = yield rest.query(`${assetJs.contractName}?${genAddressString(addresses, '&')}`);
  return results;
}

function genAddressString(addresses, prefix = '?') {
  if (!addresses || addresses.length == 0) return '';

  const csv = util.toCsv(addresses);
  const res = `${prefix}address=in.${csv}`;

  return res;
}

module.exports = {
  uploadContract,
  bind,
}
