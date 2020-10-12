import { rest, util, importer } from "blockapps-rest";
import RestStatus from "http-status-codes";
import config from "../../load.config";
import * as permissionHashmapJs from "../../blockapps-sol/dist/auth/permission/permissionedHashmap";
import assetJs from "./asset";
import queryHelper from "../../helpers/query";

const contractName = "AssetManager";
const contractFilename = `${process.cwd()}/${
  config.dappPath
}/asset/contracts/AssetManager.sol`;

const options = { config };

async function uploadContract(user, ttPermissionManagerContract) {
  const args = {
    ttPermissionManager: ttPermissionManagerContract.address,
  };

  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args),
  };

  const contract = await rest.createContract(user, contractArgs, options);
  contract.src = "removed";

  await ttPermissionManagerContract.grantAssetManager(contract);

  return bind(user, contract);
}

function bind(user, contract) {
  contract.exists = async function (sku) {
    return await exists(user, contract, sku);
  };

  contract.createAsset = async function (args) {
    return await createAsset(user, contract, args);
  };

  contract.handleAssetEvent = async function (args) {
    return await handleAssetEvent(user, contract, args);
  };

  contract.getAssets = async function (args) {
    return await getAssets(user, contract, args);
  };

  contract.getAsset = async function (sku) {
    return await getAsset(user, contract, sku);
  };

  contract.getAssetHistory = async function (sku) {
    return await getAssetHistory(user, contract, sku);
  };

  contract.transferOwnership = async function (args) {
    return await transferOwnership(user, contract, args);
  };

  return contract;
}

async function exists(user, contract, sku) {
  const args = { sku: sku };
  const callArgs = {
    contract,
    method: "exists",
    args: util.usc(args),
  };

  const result = await rest.call(user, callArgs, options);

  return result[0] === true;
}

async function createAsset(user, contract, args) {
  const converted = assetJs.toBytes32(args);

  const callArgs = {
    contract,
    method: "createAsset",
    args: util.usc(converted),
  };

  const copyOfOptions = {
    ...options,
    history: [assetJs.contractName],
  };

  const [restStatus, assetError, assetAddress] = await rest.call(
    user,
    callArgs,
    copyOfOptions
  );

  if (restStatus != RestStatus.CREATED)
    throw new rest.RestError(restStatus, assetError, {
      method: callArgs.method,
      converted,
    });

  const contractArgs = {
    name: assetJs.contractName,
    address: assetAddress,
  };

  const asset = await rest.waitForAddress(user, contractArgs, options);
  return assetJs.fromBytes32(asset);
}

async function handleAssetEvent(user, contract, args) {
  const callArgs = {
    contract,
    method: "handleAssetEvent",
    args: util.usc(args),
  };

  const [restStatus, assetError, searchCounter, newState] = await rest.call(
    user,
    callArgs,
    options
  );

  if (restStatus != RestStatus.OK)
    throw new rest.RestError(restStatus, assetError, {
      method: callArgs.method,
      args,
    });

  await assetJs.waitForRequiredUpdate(user, args.sku, searchCounter);

  return newState;
}

async function getAssets(user, contract, args) {
  const { ttPermissionManager } = await rest.getState(user, contract, options);

  const contractArgs = {
    name: assetJs.contractName,
  };

  const copyOfOptions = {
    ...options,
    query: {
      ttPermissionManager: `eq.${ttPermissionManager}`,
      ...args,
    },
  };

  const results = await rest.search(user, contractArgs, copyOfOptions);
  const converted = results.map((r) => assetJs.fromBytes32(r));

  return converted;
}

async function getAsset(user, contract, sku) {
  const found = await exists(user, contract, sku);

  if (!found) {
    throw new rest.RestError(RestStatus.NOT_FOUND, `SKU ${sku} not found`);
  }

  const callArgs = {
    contract,
    method: "getAsset",
    args: util.usc({ sku }),
  };

  const address = await rest.call(user, callArgs, options);

  const contractArgs = {
    name: assetJs.contractName,
  };

  const copyOfOptions = {
    ...options,
    query: {
      address: `eq.${address}`,
    },
  };

  const result = await rest.search(user, contractArgs, copyOfOptions);

  if (result.length != 1) {
    throw new rest.RestError(
      RestStatus.NOT_FOUND,
      `Unable to retrieve state for address ${address}`
    );
  }

  const converted = assetJs.fromBytes32(result[0]);

  return converted;
}

async function getAssetHistory(user, contract, sku) {
  const found = await exists(user, contract, sku);

  if (!found) {
    throw new rest.RestError(restStatus.NOT_FOUND, `SKU ${sku} not found`);
  }

  const callArgs = {
    contract,
    method: "getAsset",
    args: util.usc({ sku }),
  };

  const address = await rest.call(user, callArgs, options);

  const contractArgs = {
    name: `history@${assetJs.contractName}`,
  };

  const copyOfOptions = {
    ...options,
    query: {
      address: `eq.${address}`,
    },
  };

  const history = await rest.search(user, contractArgs, copyOfOptions);
  return history.map((h) => assetJs.fromBytes32(h));
}

async function transferOwnership(user, contract, args) {
  const callArgs = {
    contract,
    method: "transferOwnership",
    args: util.usc(args),
  };

  const [restStatus, assetError, searchCounter, newState] = await rest.call(
    user,
    callArgs,
    options
  );

  if (restStatus != RestStatus.OK)
    throw new rest.RestError(restStatus, assetError, {
      method: callArgs.method,
      args,
    });

  await assetJs.waitForRequiredUpdate(user, args.sku, searchCounter);

  return newState;
}

export default {
  uploadContract,
  bind,
};
