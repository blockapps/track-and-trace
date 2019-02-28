const { rest6: rest, common } = require('blockapps-rest');
const { config, util } = common;

const contractName = 'Bid';
const contractFilename = `${process.cwd()}/${config.dappPath}/bid/contracts/Bid.sol`;

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const bidChainJs = require(`${process.cwd()}/${config.dappPath}/bidChain/bidchain`);
const assetJs = require(`${process.cwd()}/${config.dappPath}/asset/asset`);
const queryHelper = require('../../helpers/query');

// TODO: prevent bid from getting created if the asset is not in BIDS_REQUESTED state
function* createBid(token, assetAddress, ownerAddress, bidValue, regulatorAddress) {
  const chainId = yield bidChainJs.createChain(token, ownerAddress, regulatorAddress)

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
      chainId,
      enableHistory: true
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

  const results = yield rest.query(`${contractName}?${queryHelper.getPostgrestQueryString(queryParams)}`)
  return results;
}

function* getBidsHistory(token, assetAddress) {
  const chains = yield bidChainJs.getChains(token);

  if(chains.length === 0) {
    return []
  }

  const queryParams = {
    asset: assetAddress,
    chainId: chains.map(c => c.id)
  }

  const results = yield rest.query(`history@${contractName}?${queryHelper.getPostgrestQueryString(queryParams)}`)
  return results;
}



module.exports = {
  createBid,
  uploadContract,
  bind,
  getBids,
  getBidsHistory
}
