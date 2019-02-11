const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const contractName = 'Asset';
const contractFilename = `${process.cwd()}/${config.dappPath}/asset/contracts/Asset.sol`;


function* uploadContract(user, ttPermissionManagerContract, args) {
  const getKeyResponse = yield rest.getKey(user);
  
  const contractArgs = Object.assign({}, args, {
    ttPermissionManager: ttPermissionManagerContract.address,
    owner: getKeyResponse.address
  });

  const contract = yield rest.uploadContract(user, contractName, contractFilename, util.usc(contractArgs));
  yield compileSearch(contract);
  contract.src = 'removed';

  return bind(user, contract);
}

function* compileSearch(contract) {
  rest.verbose('compileSearch', contractName);

  const isSearchable = yield rest.isSearchable(contract.codeHash);
  if (isSearchable) return;

  const searchable = [contractName];
  yield rest.compileSearch(searchable, contractName, contractFilename);
}

function bind(user, contract) {
  contract.getState = function* () {
    return yield rest.getState(contract);
  };

  return contract;
}

function bindAddress(user, address) {
  let contract = {
    name: contractName,
    address
  }
  return bind(user, contract);
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
