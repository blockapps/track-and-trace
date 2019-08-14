import { rest, util, importer } from 'blockapps-rest';
const { createContract, getState, call } = rest;
import config from '../../load.config';
import * as userManagerJs from '../../blockapps-sol/dist/auth/user/userManager';
import assetManagerJs from '../asset/assetManager';
import ttPermissionManagerJs from '../ttPermission/ttPermissionManager';
import { yamlWrite } from "../../helpers/config";

const contractName = 'TtDapp';
const contractFilename = `${config.dappPath}/dapp/contracts/ttDapp.sol`;
const managersNames = ['userManager', 'assetManager', 'ttPermissionManager'];

const options = { config }

async function uploadContract(user, ttPermissionManager) {
  const args = {
    ttPermissionManager: ttPermissionManager.address,
  };

  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args)
  }

  const contract = await createContract(user, contractArgs, options);
  contract.src = 'removed';
  await util.sleep(5 * 1000);
  return await bind(user, contract);
}

async function getManagers(user, contract) {
  const state = await getState(user, contract, options);
  const managers = {};
  managersNames.forEach((name) => {
    const address = state[name];
    if (address === undefined || address == 0) throw new Error(`Sub contract address not found ${name}`);
    managers[name] = {
      name: name[0].toUpperCase() + name.substring(1),
      address,
    };
  });
  return managers;
}

async function bind(user, _contract) {
  const contract = _contract;
  // set the managers
  const unboundManagers = await getManagers(user, contract);
  const userManager = userManagerJs.bind(user, unboundManagers.userManager);
  const assetManager = assetManagerJs.bind(user, unboundManagers.assetManager);
  const ttPermissionManager = ttPermissionManagerJs.bind(user, unboundManagers.ttPermissionManager);
  // deploy
  contract.deploy = async function (deployFilename) {
    const managers = {
      userManager,
      assetManager,
      ttPermissionManager,
    }
    return await deploy(user, contract, deployFilename, managers)
  }

  // create user
  contract.createUser = async function (args) {
    const user = await userManager.createUser(args);
    await ttPermissionManager.grantRole(user, args.role);
    return user;
  };
  // get all users
  contract.getUsers = async function (args) {
    const user = await userManager.getUsers(args);
    return user;
  };

  contract.getUser = async function (username) {
    const user = await userManager.getUser(username);
    return user;
  };

  contract.getAssets = async function (args) {
    return await assetManager.getAssets(args);
  }

  contract.getAsset = async function (sku) {
    return await assetManager.getAsset(sku);
  }

  contract.getAssetHistory = async function (sku) {
    return await assetManager.getAssetHistory(sku);
  }

  contract.createAsset = async function (args) {
    return await assetManager.createAsset(args);
  }

  contract.handleAssetEvent = async function (args) {
    return await assetManager.handleAssetEvent(args);
  }

  contract.transferOwnership = async function (args) {
    return await assetManager.transferOwnership(args);
  }

  return contract;
}

// =========================== deployment ========================
async function deploy(user, contract, deployFilename, managers) {
  const { assetManager, ttPermissionManager, userManager } = managers;

  // grant permissions
  await ttPermissionManager.grantAssetManager(assetManager);

  // authoring the deployment
  let deployment = {
    url: config.nodes[0].url,
    contract: {
      name: contract.name,
      address: contract.address,
    },
  };
  // write
  if (config.apiDebug) {
    console.log('deploy filename:', deployFilename);
    console.log(yamlSafeDumpSync(deployment));
  }

  yamlWrite(deployment, deployFilename);

  return deployment;
}

export default {
  bind,
  uploadContract,
};
