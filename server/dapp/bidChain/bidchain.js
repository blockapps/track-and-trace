const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;
const ip = require('ip');

const contractName = 'BidChain';
const contractFileName = `${process.cwd()}/${config.dappPath}/bidChain/contracts/BidChain.sol`;
const balance = 100000000000000000000;
const publicKey = '6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0';
const port = 30303;
const localIp = ip.address();
const enode = `enode://${publicKey}@${localIp}:${port}`


async function createChain(token, assetOwner, regulatorAddress) {
  const getKeyResponse = await rest.getKey(token);

  const governanceSrc = await rest.getContractString(
    contractName,
    contractFileName
  );

  const chain = await rest.createChain(
    `bid_${getKeyResponse.address}_${assetOwner}`,
    [
      {
        address: assetOwner,
        enode
      },
      {
        address: getKeyResponse.address,
        enode
      },
      {
        address: regulatorAddress,
        enode
      }
    ],
    [
      {
        address: assetOwner,
        balance
      },
      {
        address: getKeyResponse.address,
        balance
      },
      {
        address: regulatorAddress,
        balance
      }
    ],
    governanceSrc,
    {},
    {
      enableHistory: true,
      contract: contractName
    }
  );

  return bind(token, chain);
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
  rest.verbose('exists', member);

  const method = 'addMember';
  const args = {
    member,
    enode
  }

  const result = await rest.callMethod(
    token,
    contract,
    method,
    util.usc(args),
    {
      chainId
    }
  );

  return result
}

async function removeMember(token, contract, member, chainId) {
  rest.verbose('removeMember', member);
  const method = 'removeMember';
  const args = {
    member
  }

  const result = await rest.callMethod(
    token,
    contract,
    method,
    util.usc(args),
    {
      chainId
    }
  );

  return result
}

async function getChainById(chainId) {
  const chainInfo = await rest.getChainInfo(chainId);
  return chainInfo;
}

// only return chains where current user is a member
async function getChains(token) {
  const keyResponse = await rest.getKey(token);
  let chains;

  /*
    NOTE: getChainIfos returns a 500 error expected should be empty array
    REFER: Strato JIRA ticket https://blockapps.atlassian.net/browse/STRATO-1304
    TODO: Remove Try and catch once STRATO-1304 is done
  */
  try {
    chains = await rest.getChainInfos();
  } catch (e) {
    if (e.status === 500) {
      chains = [];
    }
    console.error('Error getting chainInfo:', e);
  }

  const filtered = chains.reduce((acc, c) => {
    const member = c.info.members.find((m) => {
      return m.address === keyResponse.address
    })
    if (member !== undefined) {
      acc.push(c)
    }
    return acc;
  }, [])

  return filtered;
}

module.exports = {
  createChain,
  bind,
  getChainById,
  getChains,
  removeMember,
  addMember
}
