import { rest, util, importer } from 'blockapps-rest';
const ip = require('ip');

import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

const contractName = 'BidChain';
const contractFileName = `${process.cwd()}/${config.dappPath}/bidChain/contracts/BidChain.sol`;
const balance = 100000000000000000000;
const publicKey = '6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0';
const port = 30303;
const localIp = ip.address();
const enode = `enode://${publicKey}@${localIp}:${port}`

const options = { config, logger: console };

async function createChain(token, assetOwner, regulatorAddress) {
  const getKeyResponse = await rest.getKey(token, options);

  // TODO: is this needed to create a chain
  // const governanceSrc = await rest.getContractString(
  //   contractName,
  //   contractFileName
  // );

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

  const chain = await rest.createChain(chainArgs, contractArgs, {config: options.config, history: [contractName]})

  // TODO: createChain is returing string. so binding is little tricky
  // is that something we need to createContract here. @samrit please confirm
  return bind(token, {chainId: chain});
}

function bind(token, contract) {
  contract.addMember = async function (member) {
    return await addMember(token, contract, member)
  }

  contract.removeMember = async function (member) {
    return await removeMember(token, contract, member)
  }

  return contract;
}

async function addMember(token, contract, member, chainId) {
  const args = {
    member,
    enode
  }

  const callArgs = {
    contract,
    method: 'addMember',
    args: util.usc(args)
  }

  const result = await rest.call(
    token,
    callArgs,
    { config, chainIds: [chainId] }
  );

  return result
}

async function removeMember(token, contract, member, chainId) {
  const args = {
    member
  }

  const callArgs = {
    contract,
    method: 'removeMember',
    args: util.usc(args)
  }

  const result = await rest.call(
    token,
    callArgs,
    { config, logger: console, chainIds: [chainId] }
  );

  return result
}

async function getChainById(chainId) {
  const chainInfo = await rest.getChain(chainId, options);
  return chainInfo;
}

// only return chains where current user is a member
async function getChains(token) {
  const keyResponse = await rest.getKey(token, options);
  let chains;

  /*
    NOTE: getChainIfos returns a 500 error expected should be empty array
    REFER: Strato JIRA ticket https://blockapps.atlassian.net/browse/STRATO-1304
    TODO: Remove Try and catch once STRATO-1304 is done
  */
  try {
    chains = await rest.getChains([], options);
  } catch (e) {
    if (e.status === 500) {
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
