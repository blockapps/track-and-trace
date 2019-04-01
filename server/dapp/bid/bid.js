import { rest, util, importer } from 'blockapps-rest';
import RestStatus from 'http-status-codes';

import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

const contractName = 'Bid';
const contractFilename = `${process.cwd()}/${config.dappPath}/bid/contracts/Bid.sol`;

import bidChainJs from '../bidChain/bidchain';
import queryHelper from '../../helpers/query';

// TODO: prevent bid from getting created if the asset is not in BIDS_REQUESTED state
async function createBid(token, assetAddress, ownerAddress, bidValue, regulatorAddress) {
  const { chainId } = await bidChainJs.createChain(token, ownerAddress, regulatorAddress)
  // NOTE: This is here to resolve a timing issue, where the balance is not assigned to the address in new chain causing low balance issue \
  // in next call. `sleep` is is just a workaround to let the things settle after chain creation
  // This is explaind in STRATO-1300, once the original issue is resolved, this should be removed.
  await util.sleep(500);

  const bid = await uploadContract(
    token,
    chainId,
    {
      asset: assetAddress,
      assetOwner: ownerAddress,
      value: bidValue
    }
  );

  function predicate(response) {
    if (response.length)
      return response;
  }

  const contract = {
    name: contractName
  }

  const results = await rest.searchUntil(contract, predicate, { config, query: { address: `eq.${bid.address}`, chainId: `eq.${chainId}` } });
  return results[0];
}

async function uploadContract(token, chainId, args) {
  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args)
  }

  const contract = await rest.createContract(token, contractArgs, { config, chainIds: [chainId] });
  // TODO: remove this when everything is proper
  // const contract = await rest.uploadContract(
  //   token,
  //   contractName,
  //   contractFilename,
  //   util.usc(args),
  //   {
  //     chainId,
  //     enableHistory: true
  //   }
  // );

  return bind(token, chainId, contract);
}

function bind(token, chainId, contract) {
  contract.handleBidEvent = async function (bidEvent) {
    return await handleBidEvent(token, chainId, contract, bidEvent);
  }

  return contract;
}

async function handleBidEvent(token, chainId, contract, bidEvent) {

  const args = {
    bidEvent
  }

  const callArgs = {
    contract,
    method: 'handleBidEvent',
    args: util.usc(args)
  }

  const [restStatus, newState] = await rest.call(token, callArgs, { config, chainIds: [chainId] });


  if (restStatus != RestStatus.OK) {
    throw new rest.RestError(
      restStatus,
      'Invalid transition',
      { method: callArgs.method, args }
    )
  }

  return newState;
}

async function getBids(token, searchParams) {
  const chains = await bidChainJs.getChains(token);

  const queryParams = {
    ...searchParams,
    chainId: chains.map(c => c.id)
  }

  function predicate(response) {
    return response;
  }

  const contract = {
    name: contractName
  }

  const results = await rest.searchUntil(contract, predicate, { config, query: { chainId: `in.${util.toCsv(queryParams.chainId)}` } });
  return results;
}

// TODO: No testcases for this function. add one
async function getBidsHistory(token, assetAddress) {
  const chains = await bidChainJs.getChains(token);

  if (chains.length === 0) {
    return []
  }

  const queryParams = {
    asset: assetAddress,
    chainId: chains.map(c => c.id)
  }

  const contract = {
    name: `history@${contractName}`
  }

  const results = await rest.search(contract, { config, query: { asset: `eq.${assetAddress}`, chainId: `in.${util.toCsv(queryParams.chainId)}` } });
  return results;
}



export default {
  createBid,
  uploadContract,
  bind,
  getBids,
  getBidsHistory
}
