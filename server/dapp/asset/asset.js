const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const contractName = 'Asset';
const contractFilename = `${process.cwd()}/${config.dappPath}/asset/contracts/Asset.sol`;


function* uploadContract(token, ttPermissionManagerContract, args) {
  const getKeyResponse = yield rest.getKey(token);
  
  const contractArgs = Object.assign({}, args, {
    ttPermissionManager: ttPermissionManagerContract.address,
    owner: getKeyResponse.address 
  });

  const contract = yield rest.uploadContract(token, contractName, contractFilename, util.usc(contractArgs));
  contract.src = 'removed';

  return bind(token, contract);
}

function bind(token, contract) {
  contract.getState = function* () {
    return yield rest.getState(contract);
  };

  return contract;
}

function bindAddress(token, address) {
  let contract = {
    name: contractName,
    address
  }
  return bind(token, contract);
}

function* waitForRequiredUpdate(sku, searchCounter) {
  const queryString = `${contractName}?and=(sku.eq.${sku},searchCounter.gte.${searchCounter})`;
  const results = yield rest.waitQuery(queryString, 1);

  return results[0];
}

module.exports = {
  uploadContract,
  bindAddress,
  contractName,
  waitForRequiredUpdate
}
