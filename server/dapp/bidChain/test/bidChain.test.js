require('dotenv').config();
require('co-mocha');
const { common, rest6: rest } = require('blockapps-rest');
const { assert, config, fsutil, util } = common;
const { getEmailIdFromToken, createStratoUser } = require(`${process.cwd()}/helpers/oauth`);

const bidChain = require(`${process.cwd()}/${config.dappPath}/bidChain/bidchain`);

const contractName = 'BidGovernance';
const contractFileName = `${process.cwd()}/${config.dappPath}/bidChain/contracts/BidChain.sol`;

describe('Bid Chain Tests', function() {
  this.timeout(60*1000);

  const distributorToken = process.env.DISTRIBUTOR_TOKEN;
  const manufacturerToken = process.env.MANUFACTURER_TOKEN;
  const adminToken = process.env.ADMIN_TOKEN;
  const regulatorToken = process.env.REGULATOR_TOKEN;

  function* createUser(userToken) {
    const userEmail = getEmailIdFromToken(userToken);
    const createAccountResponse = yield createStratoUser(userToken, userEmail);
    assert.equal(createAccountResponse.status, 200, createAccountResponse.message);
    return { address: createAccountResponse.address, username: userEmail };
  }

  before(function* () {
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(regulatorToken, 'regulator token is not defined');

    manufacturerUser = yield createUser(manufacturerToken);
    distributorUser = yield createUser(distributorToken);
    adminUser = yield createUser(adminToken);
    regulatorUser = yield createUser(regulatorToken)
  })

  it('should create a bidding chain', function* () {
    const chainId = yield bidChain.createChain(distributorToken, manufacturerUser.address, regulatorUser.address)

    // takes a few to populate
    yield util.sleep(2*1000);

    const chain = yield bidChain.getChainById(chainId);

    assert.equal(chain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match')
    assert.equal(chain.members.length, 3, 'Chain should have 3 members');

    const chains = yield bidChain.getChains(distributorToken);

    const fChain = chains.find((c) => {
      return c.id === chainId
    })

    assert.isDefined(fChain, 'Should be able to query for chain using token');

  })

  // TODO: test does not pass. member is not being removed.
  it('should remove a member from bidding chain', function* () {
    const chainId = yield bidChain.createChain(distributorToken, manufacturerUser.address, regulatorUser.address)
    // takes a few to populate
    yield util.sleep(2*1000);

    const chain = yield bidChain.getChainById(chainId);
    assert.equal(chain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(chain.members.length, 3, 'Chain should have 3 members');

    const govContract = yield rest.uploadContract(
      distributorToken,
      contractName,
      contractFileName,
      {},
      {
        chainId: chainId
      }
    );

    const result = yield bidChain.removeMember(
      distributorToken,
      {
        name: contractName,
        address: govContract.address
      },
      manufacturerUser.address,
      chainId
    );

    const updatedChain = yield bidChain.getChainById(chainId);
    assert.equal(updatedChain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(updatedChain.members.length, 2, 'Chain should have 2 members');
  })

  it('should add a member from bidding chain', function* () {
    const chainId = yield bidChain.createChain(distributorToken, manufacturerUser.address, regulatorUser.address)

    // takes a few to populate
    yield util.sleep(2*1000);

    const chain = yield bidChain.getChainById(chainId);
    assert.equal(chain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(chain.members.length, 3, 'Chain should have 3 members');

    const govContract = yield rest.uploadContract(
      distributorToken,
      contractName,
      contractFileName,
      {},
      {
        chainId: chainId
      }
    );

    const result = yield bidChain.addMember(
      distributorToken,
      {
        name: contractName,
        address: govContract.address
      },
      adminUser.address,
      chainId
    );

    const updatedChain = yield bidChain.getChainById(chainId);

    assert.equal(updatedChain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match')
    assert.equal(updatedChain.members.length, 4, 'Chain should have 4 members');
  })

})
