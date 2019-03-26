import { rest, util, importer } from 'blockapps-rest';
const { createContract } = rest;
import RestStatus from 'http-status-codes';

import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

const permissionManagerJs = require(`${process.cwd()}/${config.libPath}/auth/permission/permissionManager`);
// TODO: call method to get roles
// const TtRole = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`).TtRole;

const contractName = 'TtPermissionManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtPermissionManager.sol`;

const logger = console
const options = { config, logger }

async function uploadContract(admin, master) {
  const adminAddressResponse = await rest.getKey(admin, options);
  const masterAddressResponse = await rest.getKey(master, options);
  const args = { admin: adminAddressResponse, master: masterAddressResponse };

  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args)
  }

  const contract = await createContract(admin, contractArgs, options);
  contract.src = 'removed';
  return bind(admin, contract);
}

function bind(admin, _contract) {
  const contract = permissionManagerJs.bind(admin, _contract); // inherit base functionality

  contract.grantRole = async function (user, role) {
    return await grantRole(admin, contract, user, role);
  }
  contract.canCreateAsset = async function (user) {
    return await canCreateAsset(admin, contract, user);
  }
  contract.canTransferOwnership = async function (user) {
    return await canTransferOwnership(admin, contract, user);
  }
  contract.canModifyAsset = async function (user) {
    return await canModifyAsset(admin, contract, user);
  }
  contract.canModifyMap = async function (user) {
    return await canModifyMap(admin, contract, user);
  }
  contract.canCreateUser = async function (user) {
    return await canCreateUser(admin, contract, user);
  }
  contract.grantAdminRole = async function (user) {
    return await grantRole(admin, contract, user, 'ADMIN');
  }
  contract.grantManufacturerRole = async function (user) {
    return await grantRole(admin, contract, user, 'MANUFACTURER');
  }

  contract.grantDistributorRole = async function (user) {
    return await grantRole(admin, contract, user, 'DISTRIBUTOR');
  }

  contract.grantAssetManager = async function (user) {
    return await grantRole(admin, contract, user, 'ASSET_MANAGER');
  }
  return contract;
}

async function grantRole(admin, contract, user, role) {
  // function grantRole(string _id, address _address, EchoRole _role) public returns (uint, uint)
  const args = {
    id: user.name || user.username,
    address: user.account ? user.account : user.address,
    role: role,
  }

  const callArgs = {
    contract,
    method: 'grantRole',
    args: util.usc(args)
  }

  const [restStatus, permissions] = await rest.call(admin, callArgs, options);
  if (restStatus != RestStatus.OK) {
    throw new rest.RestError(restStatus, method, args);
  }
  return parseInt(permissions);
}

async function canCreateAsset(admin, contract, user) {
  // function canCreateAsset() returns (address)
  const args = { address: user.address };

  const callArgs = {
    contract,
    method: 'canCreateAsset',
    args: util.usc(args)
  }

  const [isPermitted] = await rest.call(admin, callArgs, options);
  return isPermitted;
}

async function canTransferOwnership(admin, contract, user) {
  // function canCreateTransferOwnership() returns (address)
  const args = { address: user.address };
  const callArgs = {
    contract,
    method: 'canTransferOwnership',
    args: util.usc(args)
  }
  const [isPermitted] = await rest.call(admin, callArgs, options);
  return isPermitted;
}

async function canModifyAsset(admin, contract, user) {
  // function canModifyAsset() returns (address)
  const args = { address: user.address };
  const callArgs = {
    contract,
    method: 'canModifyAsset',
    args: util.usc(args)
  }
  const [isPermitted] = await rest.call(admin, callArgs, options);
  return isPermitted;
}

async function canModifyMap(admin, contract, user) {
  // function canModifyMap() returns (address)
  const args = { address: user.address };
  const callArgs = {
    contract,
    method: 'canModifyMap',
    args: util.usc(args)
  }
  const [isPermitted] = await rest.call(admin, callArgs, options);
  return isPermitted;
}

async function canCreateUser(admin, contract, user) {
  // function canCreateUser() returns (address)
  const args = { address: user.address };
  const callArgs = {
    contract,
    method: 'canCreateUser',
    args: util.usc(args)
  }

  const [isPermitted] = await rest.callMethod(admin, callArgs, options);
  return isPermitted;
}

module.exports = {
  bind,
  uploadContract
};
