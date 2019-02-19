require('dotenv').config();
require('co-mocha');
const { common, rest6: rest } = require('blockapps-rest');
const { assert, config, fsutil, util } = common;
const { getEmailIdFromToken, createStratoUser } = require(`${process.cwd()}/helpers/oauth`);

const bidChain = require(`${process.cwd()}/${config.dappPath}/bidChain/bidChain`);
const contractName = 'BidGovernance';
const contractAddress = '0000000000000000000000000000000000000100';   // the governance contract on private chains has this same address

describe('Bid Chain Tests', function() {
  this.timeout(60*1000);

  const manufacturerToken = process.env.DISTRIBUTOR_TOKEN;
  const distributorToken = process.env.MANUFACTURER_TOKEN;

  function* createUser(userToken) {
    const userEmail = getEmailIdFromToken(userToken);
    const createAccountResponse = yield createStratoUser(userToken, userEmail);
    assert.equal(createAccountResponse.status, 200, createAccountResponse.message);
    return { address: createAccountResponse.address, username: userEmail };
  }

  before(function* () {
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');

    manufacturerUser = yield createUser(manufacturerToken);
    distributorUser = yield createUser(distributorToken);
  })

  it('should create a bidding chain', function* () {
    const chainId = yield bidChain.createChain(distributorToken, manufacturerUser.address)

    // takes a few to populate
    yield util.sleep(2*1000);

    const chain = yield bidChain.getChainById(chainId);

    assert.equal(chain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match')
    assert.equal(chain.members.length, 2, 'Chain should have 2 members');

    const chains = yield bidChain.getChains(distributorToken);

    const fChain = chains.find((c) => {
      return c.id === chainId
    })

    assert.isDefined(fChain, 'Should be able to query for chain using token');

  })

  // TODO: test does not pass. member is not being removed.
  it('should remove a member from bidding chain', function* () {
    const chainId = yield bidChain.createChain(distributorToken, manufacturerUser.address)
    // takes a few to populate
    yield util.sleep(2*1000);

    const chain = yield bidChain.getChainById(chainId);

    assert.equal(chain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(chain.members.length, 2, 'Chain should have 2 members');

    const contract = bidChain.bind(distributorToken, {
      name: contractName,
      address: contractAddress,
      src: 'removed'
    });
    console.log('HERE IS THE CONTRACT', contract);
    const result = yield contract.removeMember(manufacturerUser.address);
    console.log('Here is the result', result);
    const updatedChain = yield bidChain.getChainById(chainId);
    assert.equal(updatedChain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(updatedChain.members.length, 1, 'Chain should have 1 member');

  })

  it.skip('should add a member from bidding chain', function* () {
    // TODO: complete this
  })

})
