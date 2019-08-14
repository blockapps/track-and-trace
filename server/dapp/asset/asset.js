import { rest, util, importer } from "blockapps-rest";
import encodingHelpers from "../../helpers/encoding";
import config from "../../load.config";

const contractName = "Asset";
const contractFilename = `${process.cwd()}/${
  config.dappPath
}/asset/contracts/Asset.sol`;

const options = { config };

async function uploadContract(token, ttPermissionManagerContract, args) {
  const getKeyResponse = await rest.getKey(token, options);

  const contractArgs = Object.assign({}, toBytes32(args), {
    ttPermissionManager: ttPermissionManagerContract.address,
    owner: getKeyResponse
  });

  const contractArgs1 = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(contractArgs)
  };

  const contract = await rest.createContract(token, contractArgs1, options);
  contract.src = "removed";

  return bind(token, contract);
}

function bind(token, contract) {
  contract.getState = async function() {
    return await rest.getState(token, contract, options);
  };

  return contract;
}

function bindAddress(token, address) {
  let contract = {
    name: contractName,
    address
  };
  return bind(token, contract);
}

async function waitForRequiredUpdate(token, sku, searchCounter) {
  function predicate(response) {
    if (response.length) return response;
  }

  const contract = {
    name: contractName
  };

  const copyOfOptions = {
    ...options,
    query: {
      searchCounter: `gte.${searchCounter}`,
      sku: `eq.${sku}`
    }
  };

  const results = await rest.searchUntil(token, contract, predicate, copyOfOptions);
  const asset = fromBytes32(results[0]);

  return asset;
}

function fromBytes32(asset) {
  const converted = {
    ...asset,
    keys: asset.keys.map(k => encodingHelpers.fromBytes32(k)),
    values: asset.values.map(v => encodingHelpers.fromBytes32(v))
  };
  return converted;
}

function toBytes32(asset) {
  const converted = {
    ...asset,
    keys: asset.keys.map(k => encodingHelpers.toBytes32(k)),
    values: asset.values.map(v => encodingHelpers.toBytes32(v))
  };
  return converted;
}

async function getAssetByAddress(token, address) {
  const copyOfOptions = {
    ...options,
    query: {
      address: `eq.${address}`
    }
  };
  const contract = {
    name: contractName
  };
  const results = await rest.search(token, contract, copyOfOptions);
  if (results.length === 0) return undefined;
  return results[0];
}

export default {
  uploadContract,
  bindAddress,
  contractName,
  waitForRequiredUpdate,
  fromBytes32,
  toBytes32,
  getAssetByAddress
};
