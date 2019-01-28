const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const permissionManagerJs = require(`${process.cwd()}/${config.libPath}/auth/permission/permissionManager`);

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const TtRole = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`).TtRole;

const contractName = 'TtPermissionManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtPermissionManager.sol`;

function* uploadContract(adminUser, masterUser) {
  const args = { admin: adminUser.address, master: masterUser.address };

  const contract = yield rest.uploadContract(adminUser, contractName, contractFilename, util.usc(args));
  contract.src = 'removed';
  return bind(adminUser, contract);
}

function bind(adminUser, contract) {
  contract = permissionManagerJs.bind(adminUser, contract);

  contract.grantAssetManager = function* (assetManagerContract) {
    return yield grantRole(adminUser, contract, assetManagerContract.address, assetManagerContract.address, TtRole.ASSET_MANAGER);
  }

  contract.grantManufacturerRole = function* (user) {
    return yield grantRole(adminUser, contract, user.name, user.address, TtRole.MANUFACTURER);
  }

  contract.grantDistributorRole = function* (user) {
    return yield grantRole(adminUser, contract, user.name, user.address, TtRole.DISTRIBUTOR);
  }

  return contract;
}

function* grantRole(adminUser, contract, id, address, role) {
  rest.verbose('grantRole', { address, role });

  const method = 'grantRole';
  const args = { id, address, role };

  const [restStatus, permissions] = yield rest.callMethod(adminUser, contract, method, util.usc(args));
  if (restStatus != RestStatus.OK) {
    throw new rest.RestError(restStatus, method, args);
  }
  return parseInt(permissions, 10);
}


module.exports = {
  uploadContract,
};
