import { rest, util, importer } from "blockapps-rest";
import RestStatus from "http-status-codes";
import config from "../../load.config";
import { getPostgrestQueryString } from "../../helpers/query";

const contractName = "Bid";
const contractFilename = `${process.cwd()}/${
  config.dappPath
}/bid/contracts/Bid.sol`;

import bidChainJs from "../bidChain/bidchain";
import queryHelper from "../../helpers/query";
import { equal } from "assert";

const options = { config };

async function createBid(
  user,
  assetAddress,
  ownerAddress,
  bidValue,
  regulatorAddress
) {
  const { chainId } = await bidChainJs.createChain(
    user,
    ownerAddress,
    regulatorAddress
  );
  // NOTE: This is here to resolve a timing issue, where the balance is not assigned to the address in new chain causing low balance issue \
  // in next call. `sleep` is is just a workaround to let the things settle after chain creation
  // This is explaind in STRATO-1300, once the original issue is resolved, this should be removed.
  await util.sleep(500);

  // TODO: prevent bid from getting created if the asset is not in BIDS_REQUESTED state

  const bid = await uploadContract(user, chainId, {
    asset: assetAddress,
    assetOwner: ownerAddress,
    value: bidValue
  });

  function predicate(response) {
    if (response.length) return response;
  }

  const contract = {
    name: contractName
  };

  const copyOfOptions = {
    ...options,
    query: {
      address: `eq.${bid.address}`,
      chainId: `eq.${chainId}`
    }
  };

  const results = await rest.searchUntil(user, contract, predicate, copyOfOptions);
  return results[0];
}

async function uploadContract(user, chainId, args) {
  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args)
  };

  const copyOfOptions = {
    ...options,
    chainIds: [chainId]
  };

  const contract = await rest.createContract(
    user,
    contractArgs,
    copyOfOptions
  );
  return bind(user, chainId, contract);
}

function bind(user, chainId, contract) {
  contract.handleBidEvent = async function(bidEvent) {
    return await handleBidEvent(user, chainId, contract, bidEvent);
  };

  contract.getBid = async function() {
    return await getBid(user, chainId, contract.address);
  };

  return contract;
}

async function handleBidEvent(user, chainId, contract, bidEvent) {
  const args = {
    bidEvent
  };

  const callArgs = {
    contract,
    method: "handleBidEvent",
    args: util.usc(args)
  };

  const copyOfOptions = {
    ...options,
    chainIds: [chainId]
  };
  const [restStatus, newState] = await rest.call(
    user,
    callArgs,
    copyOfOptions
  );

  if (restStatus != RestStatus.OK) {
    throw new rest.RestError(restStatus, "Invalid transition", {
      method: callArgs.method,
      args
    });
  }

  // make sure state changes are persisted
  await rest.searchUntil(
    user,
    contract,
    r => {
      return r && r.length > 0;
    },
    {
      ...options,
      query: {
        address: `eq.${contract.address}`,
        chainId: `eq.${chainId}`,
        bidState: `eq.${newState}`
      }
    }
  );

  return newState;
}

async function getBid(user, chainId, address) {
  const contract = {
    name: contractName
  };
  const copyOfOptions = {
    ...options,
    query: {
      chainId: `eq.${chainId}`,
      address: `eq.${address}`
    }
  };

  const results = await rest.search(user, contract, copyOfOptions);
  if (results.length === 0) return undefined;
  return results[0];
}

async function getBids(user, searchParams) {
  const chains = await bidChainJs.getChains(user);

  const query = {
    ...searchParams,
    chainId: `in.${util.toCsv(chains.map(c => c.id))}`
  };

  function predicate(response) {
    return response;
  }

  const contract = {
    name: contractName
  };

  const copyOfOptions = {
    ...options,
    query
  };
  const results = await rest.searchUntil(user, contract, predicate, copyOfOptions);
  return results;
}

async function getBidsHistory(user, assetAddress) {
  const chains = await bidChainJs.getChains(user);

  if (chains.length === 0) {
    return [];
  }

  const query = {
    asset: `eq.${assetAddress}`,
    chainId: `in.${util.toCsv(chains.map(c => c.id))}`
  };

  const contract = {
    name: contractName
  };

  const copyOfOptions = {
    ...options,
    query
  };

  const results = await rest.search(user, contract, copyOfOptions);
  return results;
}

export default {
  createBid,
  uploadContract,
  bind,
  getBids,
  getBidsHistory
};
