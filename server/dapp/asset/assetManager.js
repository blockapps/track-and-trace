import { rest, util, importer } from 'blockapps-rest';
import RestStatus from 'http-status-codes';

import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

import permissionHashmapJs from '../../blockapps-sol/dist/auth/permission/permissionedHashmap';
import assetJs from './asset';
import contractUtils from './contractUtils';
import queryHelper from '../../helpers/query';

const contractName = 'AssetManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/asset/contracts/AssetManager.sol`;

const options = { config }

async function uploadContract(token, ttPermissionManagerContract) {
  const args = {
    ttPermissionManager: ttPermissionManagerContract.address
  };

  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args)
  }

  const contract = await rest.createContract(token, contractArgs, options);
  contract.src = 'removed';

  await ttPermissionManagerContract.grantAssetManager(contract);

  return bind(token, contract);
}

function bind(token, contract) {
  contract.exists = async function (sku) {
    return await exists(token, contract, sku);
  }

  contract.createAsset = async function (args) {
    return await createAsset(token, contract, args);
  }

  contract.handleAssetEvent = async function (args) {
    return await handleAssetEvent(token, contract, args);
  }

  contract.getAssets = async function (args) {
    return await getAssets(token, contract, args);
  }

  contract.getAsset = async function (sku) {
    return await getAsset(token, contract, sku);
  }

  contract.getAssetHistory = async function (sku) {
    return await getAssetHistory(token, contract, sku);
  }

  contract.transferOwnership = async function (args) {
    return await transferOwnership(token, contract, args);
  }

  return contract;
}

async function exists(token, contract, sku) {
  const args = { sku: sku };
  const callArgs = {
    contract,
    method: 'exists',
    args: util.usc(args)
  }

  const result = await rest.call(token, callArgs, options);

  return result[0] === true;
}

async function createAsset(token, contract, args) {
  const converted = assetJs.toBytes32(args);

  const callArgs = {
    contract,
    method: 'createAsset',
    args: util.usc(converted)
  }

  const [restStatus, assetError, assetAddress] = await rest.call(token, callArgs, { config, history: [assetJs.contractName] });

  if (restStatus != RestStatus.CREATED) throw new rest.RestError(restStatus, assetError, { method: callArgs.method, converted });

  const asset = await contractUtils.waitForAddress(assetJs.contractName, assetAddress);
  return assetJs.fromBytes32(asset);
}

async function handleAssetEvent(token, contract, args) {
  const callArgs = {
    contract,
    method: 'handleAssetEvent',
    args: util.usc(args)
  }

  const [restStatus, assetError, searchCounter, newState] = await rest.call(token, callArgs, options);

  if (restStatus != RestStatus.OK) throw new rest.RestError(restStatus, assetError, { method: callArgs.method, args });

  await assetJs.waitForRequiredUpdate(args.sku, searchCounter);

  return newState;
}

async function getAssets(token, contract, args) {
  rest.verbose('getAssets');

  const { assets: assetsHashMap } = await rest.getState(contract);
  const hashmap = permissionHashmapJs.bindAddress(token, assetsHashMap);

  const { values } = await hashmap.getState();
  const addresses = values.slice(1);

  const params = {
    address: args.address ? addresses.filter(
      (a) => Array.isArray(args.address)
        ? args.address.indexOf(a) !== -1
        : a === args.address
    ) : addresses,
    ...args
  }

  const results = await rest.query(`${assetJs.contractName}?${queryHelper.getPostgrestQueryString(params)}`);

  const converted = results.map(r => assetJs.fromBytes32(r));

  return converted;
}

// TODO: No testcases yet
async function getAsset(token, contract, sku) {
  const found = await exists(token, contract, sku);

  if (!found) {
    throw new rest.RestError(restStatus.NOT_FOUND, `SKU ${sku} not found`);
  }

  const callArgs = {
    contract,
    method: 'getAsset',
    args: util.usc({ sku })
  }

  const address = await rest.call(token, callArgs, options);

  // TODO: replace it with searchUntil
  const result = await rest.query(`${assetJs.contractName}?address=eq.${address}`);

  if (result.length != 1) {
    throw new rest.RestError(restStatus.NOT_FOUND, `Unable to retrieve state for address ${address}`);
  }

  const converted = assetJs.fromBytes32(result[0]);

  return converted;
}

async function getAssetHistory(token, contract, sku) {
  const found = await exists(token, contract, sku);

  if (!found) {
    throw new rest.RestError(restStatus.NOT_FOUND, `SKU ${sku} not found`);
  }

  const callArgs = {
    contract,
    method: 'getAsset',
    args: util.usc({ sku })
  }

  const address = await rest.call(token, callArgs, options)

  // TODO: replace it with searchUntil
  const history = await rest.query(`history@${assetJs.contractName}?address=eq.${address}`);
  return history.map(h => assetJs.fromBytes32(h));
}

async function transferOwnership(token, contract, args) {
  const callArgs = {
    contract,
    method: 'transferOwnership',
    args: util.usc(args)
  }

  const [restStatus, assetError, searchCounter, newState] = await rest.call(token, callArgs, options);

  if (restStatus != RestStatus.OK) throw new rest.RestError(restStatus, assetError, { method: callArgs.method, args });

  await assetJs.waitForRequiredUpdate(args.sku, searchCounter);

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
