const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const permissionHashmapJs = require(`${process.cwd()}/${config.libPath}/auth/permission/permissionedHashmap`);

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);

const assetJs = require(`${process.cwd()}/${config.dappPath}/asset/asset`);
const contractUtils = require(`${process.cwd()}/${config.dappPath}/asset/contractUtils`);

const contractName = 'AssetManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/asset/contracts/AssetManager.sol`;

const encodingHelper = require(`${process.cwd()}/helpers/encoding`);
const queryHelper = require('../../helpers/query');


function* uploadContract(token, ttPermissionManagerContract) {
  const contractArgs = {
    ttPermissionManager: ttPermissionManagerContract.address
  };
  const contract = yield rest.uploadContract(
    token, 
    contractName, 
    contractFilename, 
    util.usc(contractArgs)
  );
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

  contract.getAsset = function* (sku) {
    return yield getAsset(token, contract, sku);
  }

  contract.getAssetHistory = function* (sku) {
    return yield getAssetHistory(token, contract, sku);
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

  const converted = assetJs.toBytes32(args);

  const [restStatus, assetError, assetAddress] = yield rest.callMethod(token, contract, method, util.usc(converted), { history: [assetJs.contractName] });

  if (restStatus != RestStatus.CREATED) throw new rest.RestError(restStatus, assetError, { method, converted });
  const asset = yield contractUtils.waitForAddress(assetJs.contractName, assetAddress);

  return assetJs.fromBytes32(asset);
}

function* handleAssetEvent(token, contract, args) {
  rest.verbose('handleAssetEvent', args);

  const method = 'handleAssetEvent';
  const [restStatus, assetError, searchCounter, newState] = yield rest.callMethod(token, contract, method, util.usc(args));

  if (restStatus != RestStatus.OK) throw new rest.RestError(restStatus, assetError, { method, args });

  yield assetJs.waitForRequiredUpdate(args.sku, searchCounter);

  return newState;
}

function* getAssets(token, contract, args) {
  rest.verbose('getAssets');

  const { assets: assetsHashMap } = yield rest.getState(contract);
  const hashmap = permissionHashmapJs.bindAddress(token, assetsHashMap);

  const { values } = yield hashmap.getState();
  const addresses = values.slice(1);

  const params = {
    address: args.address ? addresses.filter(
      (a) =>  Array.isArray(args.address) 
        ? args.address.indexOf(a) !== -1 
        : a === args.address
      ) : addresses,
    ...args
  }

  const results = yield rest.query(`${assetJs.contractName}?${queryHelper.getPostgrestQueryString(params)}`);

  const converted = results.map(r => assetJs.fromBytes32(r));

  return converted;
}

function* getAsset(token, contract, sku) {
  rest.verbose('getAsset');

  const found = yield exists(token, contract, sku);

  if(!found) {
    throw new rest.RestError(restStatus.NOT_FOUND, `SKU ${sku} not found`);
  }

  const address = yield rest.callMethod(
    token,
    contract,
    'getAsset',
    util.usc({sku})
  )

  const result = yield rest.query(`${assetJs.contractName}?address=eq.${address}`);

  if(result.length != 1) {
    throw new rest.RestError(restStatus.NOT_FOUND, `Unable to retrieve state for address ${address}`);
  }

  const converted = assetJs.fromBytes32(result[0]);

  return converted;
}

function* getAssetHistory(token, contract, sku) {
  rest.verbose('getAssetHistory');

  const found = yield exists(token, contract, sku);

  if(!found) {
    throw new rest.RestError(restStatus.NOT_FOUND, `SKU ${sku} not found`);
  }

  const address = yield rest.callMethod(
    token,
    contract,
    'getAsset',
    util.usc({sku})
  )

  const history = yield rest.query(`history@${assetJs.contractName}?address=eq.${address}`);
  return history.map(h => assetJs.fromBytes32(h));
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

function genAddressString(addresses) {
  if (!addresses || addresses.length == 0) return '';

  const csv = util.toCsv(addresses);
  const res = `address=in.${csv}`;

  return res;
}

module.exports = {
  uploadContract,
  bind,
}
