const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const contractName = 'Asset';
const contractFilename = `${process.cwd()}/${config.dappPath}/asset/contracts/Asset.sol`;


function* uploadContract(user, ttPermissionManagerContract, args) {
  const contractArgs = Object.assign({}, args, {
    ttPermissionManager: ttPermissionManagerContract.address
  });

  const contract = yield rest.uploadContract(user, contractName, contractFilename, util.usc(contractArgs));
  contract.src = 'removed';

  return bind(user, contract);
}

function bind(user, contract) {
  contract.getState = function* () {
    return yield rest.getState(contract);
  };

  return contract;
}

module.exports = {
  uploadContract,
}
