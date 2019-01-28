const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const permissionManagerJs = require(`${process.cwd()}/${config.libPath}/auth/permission/permissionManager`);


const contractName = 'TtPermissionManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtPermissionManager.sol`;

function* uploadContract(admin, master) {
  const args = { admin: admin.address, master: master.address };

  const contract = yield rest.uploadContract(admin, contractName, contractFilename, util.usc(args));
  contract.src = 'removed';
  return bind(admin, contract);
}

function bind(admin, contract) {
  contract = permissionManagerJs.bind(admin, contract);

  return contract;
}


module.exports = {
  uploadContract,
};
