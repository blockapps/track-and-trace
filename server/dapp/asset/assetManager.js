const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const contractName = 'AssetManager';
const contractFilename = `${process.cwd()}/${config.dappPath}/asset/contracts/AssetManager.sol`;


function* uploadContract(user, ttPermissionManagerContract) {
  const contractArgs = {
    ttPermissionManager: ttPermissionManagerContract.address
  };

  const contract = yield rest.uploadContract(user, contractName, contractFilename, util.usc(contractArgs));
  contract.src = 'removed';

  return bind(user, contract);
}

function bind(user, contract) {
  contract.exists = function* (uid) {
    return yield exists(user, contract, uid)
  }

  return contract;
}

function* exists(user, contract, uid) {
  rest.verbose('exists', uid);

  const method = 'exists';
  const args = { uid };

  const result = yield rest.callMethod(user, contract, method, util.usc(args));

  return result[0] === true;
}


module.exports = {
  uploadContract,
}
