const { rest6: rest, common } = require('blockapps-rest');

const contractName = 'Bid';
const contractFilename = `${process.cwd()}/${config.dappPath}/bid/contracts/Bid.sol`;

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const bidChain = require(`${process.cwd()}/${config.dappPath}/bidChain/bidChain`);

function* createBid(token, chainId, assetAddress, ownerAddress, bidValue) {
  const bid = yield uploadContract(
    token,
    chainId,
    {
      _asset: assetAddress,
      _assetOwner: ownerAddress,
      _value: bidValue
    }
  );
  return bid;
}

function* uploadContract(token, chainId, args) {
  const contract = yield rest.uploadContract(
    token,
    contractName,
    contractFilename,
    util.usc(args),
    {
      chainid: chainId
    }
  );

  return bind(token, chainId, contract);
}

function bind(token, chainId, contract) {
  contract.handleBidEvent = function* (bidEvent) {
    return yield handleBidEvent(token, chainId, contract, bidEvent);
  }

  return contract;
}

function* handleBidEvent(token, chainId, contract, bidEvent) {
  rest.verbose('handleBidEvent', event)

  const method = 'handleBidEvent';
  const args = {
    bidEvent
  }
  
  const [restStatus, newState] = yield rest.callMethod(
    token, 
    contract, 
    method,
    util.usc(args),
    {
      chainid: chainId
    } 
  );

  if(restStatus != RestStatus.OK)  {
    throw new rest.RestError(
      restStatus, 
      'Invalid transition', 
      { method, args } 
    )
  }

  return newState;
}

function* getBids(token, searchParams) {
  const chains = yield bidChain.getChains(token);

  const queryParams = {
    ...searchParams,
    chainid: chains.map(c => c.id)
  }

  const results = yield rest.query(`${contractName}?${getPostgrestQueryString(queryParams)}`)
}

function getPostgrestQueryString(params) {
  const queryString = Object.getOwnPropertyNames(params).reduce((qs, prop) => {
    if(typeof params[prop] === 'object') {
      return qs;
    }
    if(Array.isArray(params[prop])) {
      qs += `${qs.length === 0 ? '' : '&'}${prop}=in.${arrayToCsv(params[prop])}`;
      return qs;
    }
    qs +=  `${qs.length === 0 ? '' : '&'}${prop}=eq.${params[prop]}`
  }, '')
  return queryString;
}

function arrayToCsv(array, delimiter = ',') {
  array.reduce((csv, element) => {
    csv += `${csv.length === 0 ? '' : delimiter}${element}`
  }, '')
}

module.exports = {
  createBid,
  uploadContract,
  bind,
  getBids
}
