const { rest6: rest, common } = require('blockapps-rest');
const { config, util } = common;

const contractName = 'Bid';
const contractFilename = `${process.cwd()}/${config.dappPath}/bid/contracts/Bid.sol`;

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const bidChainJs = require(`${process.cwd()}/${config.dappPath}/bidChain/bidchain`);

// TODO: prevent bid from getting created if the asset is not in BIDS_REQUESTED state
function* createBid(token, assetAddress, ownerAddress, bidValue) {
  const chainId = yield bidChainJs.createChain(token, ownerAddress)

  // NOTE: This is here to resolve a timing issue, where the balance is not assigned to the address in new chain causing low balance issue \
  // in next call. `sleep` is is just a workaround to let the things settle after chain creation
  // This is explaind in STRATO-1300, once the original issue is resolved, this should be removed.
  yield util.sleep(500);

  const bid = yield uploadContract(
    token,
    chainId,
    {
      asset: assetAddress,
      assetOwner: ownerAddress,
      value: bidValue
    }
  );

  const result = yield rest.waitQuery(`${contractName}?address=eq.${bid.address}&chainId=eq.${chainId}`, 1);
  return result[0];
}

function* uploadContract(token, chainId, args) {
  const contract = yield rest.uploadContract(
    token,
    contractName,
    contractFilename,
    util.usc(args),
    {
      chainId
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
  rest.verbose('handleBidEvent', bidEvent)

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
      chainId
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
  const chains = yield bidChainJs.getChains(token);

  const queryParams = {
    ...searchParams,
    chainId: chains.map(c => c.id)
  }

  const results = yield rest.query(`${contractName}?${getPostgrestQueryString(queryParams)}`)
  return results;
}

function getPostgrestQueryString(params) {
  const queryString = Object.getOwnPropertyNames(params).reduce((qs, prop) => {
    if(Array.isArray(params[prop])) {
      qs += `${qs.length === 0 ? '' : '&'}${prop}=in.${arrayToCsv(params[prop])}`;
      return qs;
    }
    if(typeof params[prop] === 'object') {
      return qs;
    }
    qs +=  `${qs.length === 0 ? '' : '&'}${prop}=eq.${params[prop]}`
  }, '')

  return queryString;
}

function arrayToCsv(array, delimiter = ',') {
  return array.reduce(
    (csv, element) => {
      csv += `${csv.length === 0 ? '' : delimiter}${element}`
      return csv;
    }, 
    ''
  )
}

module.exports = {
  createBid,
  uploadContract,
  bind,
  getBids
}
