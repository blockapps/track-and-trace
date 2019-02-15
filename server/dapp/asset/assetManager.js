const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const permissionHashmapJs = require(`${process.cwd()}/${config.libPath}/auth/permission/permissionedHashmap`);

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);

const assetJs = require(`${process.cwd()}/${config.dappPath}/asset/asset`);
const contractUtils = require(`${process.cwd()}/${config.dappPath}/asset/contractUtils`);

const contractName = 'AssetManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/asset/contracts/AssetManager.sol`;


function* uploadContract(token, ttPermissionManagerContract) {
  const contractArgs = {
    ttPermissionManager: ttPermissionManagerContract.address
  };

  const contract = yield rest.uploadContract(token, contractName, contractFilename, util.usc(contractArgs));
  contract.src = 'removed';

  yield ttPermissionManagerContract.grantAssetManager(contract);

  return bind(token, contract);
}

function bind(token, contract) {
  contract.exists = function* (sku) {
    return yield exists(token, contract, sku);
  }

  contract.createAsset = function* (args) {
    return yield createAsset(token, contract, args);
  }

  contract.handleAssetEvent = function* (args) {
    return yield handleAssetEvent(token, contract, args);
  }

  contract.getAssets = function* (args) {
    return yield getAssets(token, contract, args);
  }

  contract.transferOwnership = function* (args) {
    return yield transferOwnership(token, contract, args);
  }

  return contract;
}

function* exists(token, contract, sku) {
  rest.verbose('exists', sku);

  const method = 'exists';
  const args = { sku: sku };

  const result = yield rest.callMethod(token, contract, method, util.usc(args));

  return result[0] === true;
}

function* createAsset(token, contract, args) {
  rest.verbose('createAsset', args);

  const method = 'createAsset';

  const [restStatus, assetError, assetAddress] = yield rest.callMethod(token, contract, method, util.usc(args));

  if (restStatus != RestStatus.CREATED) throw new rest.RestError(restStatus, assetError, { method, args });
  const asset = yield contractUtils.waitForAddress(assetJs.contractName, assetAddress);

  return asset;
}

function* handleAssetEvent(token, contract, args) {
  rest.verbose('handleAssetEvent', args);

  const method = 'handleAssetEvent';
  const [restStatus, assetError, searchCounter, newState] = yield rest.callMethod(token, contract, method, util.usc(args));

  if (restStatus != RestStatus.OK) throw new rest.RestError(restStatus, assetError, { method, args });

  yield assetJs.waitForRequiredUpdate(args.sku, searchCounter);

  return newState;
}

function* getAssets(token, contract) {
  rest.verbose('getAssets');

  const { assets: assetsHashMap } = yield rest.getState(contract);
  const hashmap = permissionHashmapJs.bindAddress(token, assetsHashMap);

  const { values } = yield hashmap.getState();
  const addresses = values.slice(1);

  const results = yield rest.query(`${assetJs.contractName}?${genAddressString(addresses, '&')}`);
  return results;
}

function* transferOwnership(token, contract, args) {
  rest.verbose('transferOwnership', args);

  const method = 'transferOwnership';
  const [restStatus, assetError, searchCounter, newState] =
    yield rest.callMethod(token, contract, method, util.usc(args));

  if (restStatus != RestStatus.OK) throw new rest.RestError(restStatus, assetError, { method, args });

  yield assetJs.waitForRequiredUpdate(args.sku, searchCounter);

  return newState;
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
