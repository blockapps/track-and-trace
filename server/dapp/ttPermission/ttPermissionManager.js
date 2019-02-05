const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const permissionManagerJs = require(`${process.cwd()}/${config.libPath}/auth/permission/permissionManager`);

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const TtRole = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`).TtRole;

const contractName = 'TtPermissionManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtPermissionManager.sol`;

function* uploadContract(admin, master) {

  const adminAddressResponse = yield rest.getKey(admin);
  const masterAddressResponse = yield rest.getKey(master);
  const args = { admin: adminAddressResponse.address, master: masterAddressResponse.address };

  const contract = yield rest.uploadContract(admin, contractName, contractFilename, util.usc(args));
  contract.src = 'removed';
  return bind(admin, contract);
}

function bind(admin, _contract) {
  const contract = permissionManagerJs.bind(admin, _contract); // inherit base functionality

  contract.grantRole = function* (user, role) {
    return yield grantRole(admin, contract, user, role);
  }
  contract.canCreateAsset = function* (user) {
    return yield canCreateAsset(admin, contract, user);
  }
  contract.canTransferOwnershipMap = function* (user) {
    return yield canTransferOwnershipMap(admin, contract, user);
  }
  contract.canModifyMap = function* (user) {
    return yield canModifyMap(admin, contract, user);
  }
  contract.canCreateUser = function* (user) {
    return yield canCreateUser(admin, contract, user);
  }
  contract.grantAdminRole = function* (user) {
    return yield grantRole(admin, contract, user, TtRole.ADMIN);
  }
  contract.grantManufacturerRole = function* (user) {
    return yield grantRole(admin, contract, user, TtRole.MANUFACTURER);
  }

  contract.grantDistributorRole = function* (user) {
    return yield grantRole(admin, contract, user, TtRole.DISTRIBUTOR);
  }

  contract.grantAssetManager = function* (user) {
    return yield grantRole(admin, contract, user, TtRole.ASSET_MANAGER);
  }
  return contract;
}

function* grantRole(admin, contract, user, role) {
  rest.verbose('grantRole', {user, role});
  // function grantRole(string _id, address _address, EchoRole _role) public returns (uint, uint)
  const method = 'grantRole';
  const args = {
    id: user.name || user.username,
    address: user.account? user.account:user.address,
    role: role,
  }
  const [restStatus, permissions] = yield rest.callMethod(admin, contract, method, util.usc(args));
  if (restStatus != RestStatus.OK) {
    throw new rest.RestError(restStatus, method, args);
  }
  return parseInt(permissions);
}

function* canCreateAsset(admin, contract, user) {
  // function canCreateAsset() returns (address)
  const method = 'canCreateAsset';
  const args = {address: user.address};
  const [isPermitted] = yield rest.callMethod(admin, contract, method, util.usc(args));
  return isPermitted;
}

function* canTransferOwnershipMap(admin, contract, user) {
  // function canCreateTransferOwnershipMap() returns (address)
  const method = 'canTransferOwnershipMap';
  const args = {address: user.address};
  const [isPermitted] = yield rest.callMethod(admin, contract, method, util.usc(args));
  return isPermitted;
}

function* canModifyMap(admin, contract, user) {
  // function canModifyMap() returns (address)
  const method = 'canModifyMap';
  const args = {address: user.address};
  const [isPermitted] = yield rest.callMethod(admin, contract, method, util.usc(args));
  return isPermitted;
}

function* canCreateUser(admin, contract, user) {
  // function canCreateUser() returns (address)
  const method = 'canCreateUser';
  const args = {address: user.address};
  const [isPermitted] = yield rest.callMethod(admin, contract, method, util.usc(args));
  return isPermitted;
}

module.exports = {
  bind,
  uploadContract
};
