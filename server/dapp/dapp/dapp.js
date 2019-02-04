const ba = require('blockapps-rest');

const { rest6: rest } = ba;
const { config, util, fsutil, cwd } = ba.common;

const contractName = 'TtDapp';
const contractFilename = `${config.dappPath}/dapp/contracts/ttDapp.sol`;
const managersNames = ['userManager', 'assetManager', 'ttPermissionManager'];

const userManagerJs = require(`${process.cwd()}/${config.libPath}/auth/user/userManager`);
const assetManagerJs = require(`${process.cwd()}/${config.dappPath}/asset/assetManager`);
const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);

rest.calllistBatch = function* (admin, txs) {
  const batchSize = 60;
  const results = [];
  for (let i = 0; i < txs.length; i += batchSize) {
    const slice = txs.slice(i, i + batchSize);
    const batchResults = yield rest.callList(admin, slice);
    results.push(...batchResults);
  }
  return results;
}

function* uploadContract(admin, ttPermissionManager) {
  const args = {
    ttPermissionManager: ttPermissionManager.address,
  };
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, util.usc(args));
  contract.src = 'removed';
  yield util.sleep(5 * 1000);
  return yield bind(admin, contract);
}

function* getManagers(contract) {
  rest.verbose('getManagers', { contract, managersNames });
  const state = yield rest.getState(contract);
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

function* bind(admin, _contract) {
  rest.verbose('bind', { admin, _contract });
  const contract = _contract;
  // set the managers
  const unboundManagers = yield getManagers(contract);
  const userManager = userManagerJs.bind(admin, unboundManagers.userManager);
  const assetManager = assetManagerJs.bind(admin, unboundManagers.assetManager);
  const ttPermissionManager = ttPermissionManagerJs.bind(admin, unboundManagers.ttPermissionManager);

  // deploy
  contract.deploy = function* (deployFilename) {
    const managers = {
      userManager,
      assetManager,
      ttPermissionManager,
    }
    return yield deploy(admin, contract, deployFilename, managers)
  }

  // create user
  contract.createUser = function* (args) {
    const user = yield userManager.createUser(args);
    yield ttPermissionManager.grantRole(user, args.role);
    return user;
  };
  // get all users
  contract.getUsers = function* (args) {
    const user = yield userManager.getUsers(args);
    return user;
  };

  contract.getUser = function* (username) {
    const user = yield userManager.getUser(username);
    return user;
  };

  contract.getAssets = function* (args) {
    return yield assetManager.getAssets(args);
  }

  contract.createAsset = function* (args) {
    return yield assetManager.createAsset(args);
  }

  return contract;
}

// =========================== deployment ========================
function* deploy(admin, contract, deployFilename, managers) {
  rest.verbose('dapp: deploy');
  const { assetManager, ttPermissionManager, userManager } = managers;

  // grant permissions
  yield ttPermissionManager.grantAssetManager(assetManager);

  // authoring the deployment
  let deployment = {
    url: config.getBlocUrl(),
    contract: {
      name: contract.name,
      address: contract.address,
    },
  };
  // write
  if (config.apiDebug) {
    console.log('deploy filename:', deployFilename);
    console.log(fsutil.yamlSafeDumpSync(deployment));
  }

  fsutil.yamlWrite(deployment, deployFilename);

  return deployment;
}

module.exports = {
  bind,
  uploadContract,
};
