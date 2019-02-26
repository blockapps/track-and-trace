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


function* createChain(token, assetOwner, retailerAddress) {
  const getKeyResponse = yield rest.getKey(token);

  const governanceSrc = yield rest.getContractString(
    contractName,
    contractFileName
  );

  const chain = yield rest.createChain(
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
        address: retailerAddress,
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
        address: retailerAddress,
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
  contract.addMember = function* (member) {
    return yield addMember(token, contract, member)
  }

  contract.removeMember = function* (member) {
    return yield removeMember(token, contract, member)
  }

  return contract;
}

function* addMember(token, contract, member) {
  rest.verbose('exists', member);

  const method = 'addMember';
  const args = {
    member,
    enode
  }

  const result = yield rest.callMethod(
    token,
    contract,
    method,
    util.usc(args)
  );

  return result
}

function* removeMember(token, contract, member) {
  rest.verbose('removeMember', member);
  const method = 'removeMember';
  const args = {
    member
  }

  const result = yield rest.callMethod(
    token,
    contract,
    method,
    util.usc(args)
  );

  return result
}

function* getChainById(chainId) {
  const chainInfo = yield rest.getChainInfo(chainId);
  return chainInfo;
}

// only return chains where current user is a member
function* getChains(token) {
  const keyResponse = yield rest.getKey(token);
  let chains;

  /* 
    NOTE: getChainIfos returns a 500 error expected should be empty array
    REFER: Strato JIRA ticket https://blockapps.atlassian.net/browse/STRATO-1304
    TODO: Remove Try and catch once STRATO-1304 is done
  */
  try {
    chains = yield rest.getChainInfos();
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
  getChains
}