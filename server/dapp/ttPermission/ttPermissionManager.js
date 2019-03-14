import { rest6 as rest, common } from 'blockapps-rest';
// const { util, config } = common;

const permissionManagerJs = require(`${process.cwd()}/${common.config.libPath}/auth/permission/permissionManager`);
const RestStatus = rest.getFields(`${process.cwd()}/${common.config.libPath}/rest/contracts/RestStatus.sol`);
const TtRole = rest.getEnums(`${process.cwd()}/${common.config.dappPath}/ttPermission/contracts/TtRole.sol`).TtRole;

const contractName = 'TtPermissionManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtPermissionManager.sol`;

async function uploadContract(admin, master) {
  const adminAddressResponse = await rest.getKey(admin);
  const masterAddressResponse = await rest.getKey(master);
  const args = { admin: adminAddressResponse.address, master: masterAddressResponse.address };
  const contract = await rest.uploadContract(admin, contractName, contractFilename, common.util.usc(args));
  contract.src = 'removed';
  return bind(admin, contract);
}

function bind(admin, _contract) {
  const contract = permissionManagerJs.bind(admin, _contract); // inherit base functionality

  contract.grantRole = async function(user, role) {
    return await grantRole(admin, contract, user, role);
  }
  contract.canCreateAsset = async function(user) {
    return await canCreateAsset(admin, contract, user);
  }
  contract.canTransferOwnership = async function(user) {
    return await canTransferOwnership(admin, contract, user);
  }
  contract.canModifyAsset = async function(user) {
    return await canModifyAsset(admin, contract, user);
  }
  contract.canModifyMap = async function(user) {
    return await canModifyMap(admin, contract, user);
  }
  contract.canCreateUser = async function(user) {
    return await canCreateUser(admin, contract, user);
  }
  contract.grantAdminRole = async function(user) {
    return await grantRole(admin, contract, user, TtRole.ADMIN);
  }
  contract.grantManufacturerRole = async function(user) {
    return await grantRole(admin, contract, user, TtRole.MANUFACTURER);
  }

  contract.grantDistributorRole = async function(user) {
    return await grantRole(admin, contract, user, TtRole.DISTRIBUTOR);
  }

  contract.grantAssetManager = async function(user) {
    return await grantRole(admin, contract, user, TtRole.ASSET_MANAGER);
  }
  return contract;
}

async function grantRole(admin, contract, user, role) {
  rest.verbose('grantRole', {user, role});
  // function grantRole(string _id, address _address, EchoRole _role) public returns (uint, uint)
  const method = 'grantRole';
  const args = {
    id: user.name || user.username,
    address: user.account? user.account:user.address,
    role: role,
  }
  const [restStatus, permissions] = await rest.callMethod(admin, contract, method, common.util.usc(args));
  if (restStatus != RestStatus.OK) {
    throw new rest.RestError(restStatus, method, args);
  }
  return parseInt(permissions);
}

async function canCreateAsset(admin, contract, user) {
  // function canCreateAsset() returns (address)
  const method = 'canCreateAsset';
  const args = {address: user.address};
  const [isPermitted] = await rest.callMethod(admin, contract, method, common.util.usc(args));
  return isPermitted;
}

async function canTransferOwnership(admin, contract, user) {
  // function canCreateTransferOwnership() returns (address)
  const method = 'canTransferOwnership';
  const args = {address: user.address};
  const [isPermitted] = await rest.callMethod(admin, contract, method, common.util.usc(args));
  return isPermitted;
}

async function canModifyAsset(admin, contract, user) {
  // function canModifyAsset() returns (address)
  const method = 'canModifyAsset';
  const args = {address: user.address};
  const [isPermitted] = await rest.callMethod(admin, contract, method, common.util.usc(args));
  return isPermitted;
}

async function canModifyMap(admin, contract, user) {
  // function canModifyMap() returns (address)
  const method = 'canModifyMap';
  const args = {address: user.address};
  const [isPermitted] = await rest.callMethod(admin, contract, method, common.util.usc(args));
  return isPermitted;
}

async function canCreateUser(admin, contract, user) {
  // function canCreateUser() returns (address)
  const method = 'canCreateUser';
  const args = {address: user.address};
  const [isPermitted] = await rest.callMethod(admin, contract, method, common.util.usc(args));
  return isPermitted;
}

module.exports = {
  bind,
  uploadContract
};
