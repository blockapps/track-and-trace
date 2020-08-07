import { rest, util, importer } from 'blockapps-rest';
import ip from 'ip';
import config from '../../load.config';

const contractName = 'BidGovernance';
const contractFileName = `${process.cwd()}/${config.dappPath}/bidChain/contracts/BidChain.sol`;
const balance = 100000000000000000000;
const publicKey = '6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0';
const port = 30303;
const localIp = ip.address();
const enode = `enode://${publicKey}@${localIp}:${port}`

const options = { config };

async function createChain(user, assetOwner, regulatorAddress) {
  const getKeyResponse = await rest.getKey(user, options);

  const chainArgs = {
    label: `bid_${getKeyResponse}_${assetOwner}`,
    src: await importer.combine(contractFileName),
    args: {},
    members: [
      {
        address: assetOwner,
        enode
      },
      {
        address: getKeyResponse,
        enode
      },
      {
        address: regulatorAddress,
        enode
      }
    ],
    balances: [
      {
        address: assetOwner,
        balance
      },
      {
        address: getKeyResponse,
        balance
      },
      {
        address: regulatorAddress,
        balance
      }
    ],
    contractName
  }

  const contractArgs = { name: contractName }

  const copyOfOptions = {
    ...options,
    query: { 
      history: [contractName]
    }
  }

  const chain = await rest.createChain(user, chainArgs, contractArgs, copyOfOptions)
  // createChain returns chainId. we need to use as object { chainId: chain }. So that we can bind other methods as well.
  return bind(user, { chainId: chain });
}

function bind(user, contract) {
  contract.addMember = async function (member) {
    return await addMember(user, contract, member)
  }

  contract.removeMember = async function (member) {
    return await removeMember(user, contract, member)
  }

  return contract;
}

async function addMember(user, contract, member, chainId) {
  const args = {
    member,
    enode
  }

  const callArgs = {
    contract,
    method: 'addMember',
    args: util.usc(args)
  }

  const copyOfOptions = {
    ...options,
    chainIds: [chainId]
  }

  const result = await rest.call(
    user,
    callArgs,
    copyOfOptions
  );

  return result
}

async function removeMember(user, contract, member, chainId) {
  const args = {
    member
  }

  const callArgs = {
    contract,
    method: 'removeMember',
    args: util.usc(args)
  }

  const copyOfOptions = {
    ...options,
    chainIds: [chainId]
  }
  
  const result = await rest.call(
    user,
    callArgs,
    copyOfOptions
  );

  return result
}

async function getChainById(user, chainId) {
  const chainInfo = await rest.getChain(user, chainId, options);
  return chainInfo;
}

// only return chains where current user is a member
async function getChains(user, chainIds = []) {
  const keyResponse = await rest.getKey(user, options);
  let chains;

  /*
    NOTE: getChainIfos returns a 500 error expected should be empty array
    REFER: Strato JIRA ticket https://blockapps.atlassian.net/browse/STRATO-1304
    TODO: Remove Try and catch once STRATO-1304 is done
  */
  try {
    chains = await rest.getChains(user, chainIds, options);
  } catch (e) {
    if (e.response.status === 500) {
      chains = [];
    }
    console.error('Error getting chainInfo:', e);
  }

  const filtered = chains.reduce((acc, c) => {
    const member = c.info.members.find((m) => {
      return m.address === keyResponse
    })
    if (member !== undefined) {
      acc.push(c)
    }
    return acc;
  }, [])

  return filtered;
}

export default {
  createChain,
  bind,
  getChainById,
  getChains,
  removeMember,
  addMember
}
