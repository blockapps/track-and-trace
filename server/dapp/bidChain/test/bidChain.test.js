import { rest, util, importer } from 'blockapps-rest';
import { assert } from 'chai';
import bidChain from '../bidchain'

import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const contractName = 'BidGovernance';
const contractFileName = `${process.cwd()}/${config.dappPath}/bidChain/contracts/BidChain.sol`;

const options = { config }

describe('Bid Chain Tests', function () {
  this.timeout(config.timeout);

  let adminUser, regulatorUser, manufacturerUser, distributorUser;
  const distributorToken = { token: process.env.DISTRIBUTOR_TOKEN };
  const manufacturerToken = { token: process.env.MANUFACTURER_TOKEN };
  const adminToken = { token: process.env.ADMIN_TOKEN };
  const regulatorToken = { token: process.env.REGULATOR_TOKEN };

  before(async function () {
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(regulatorToken, 'regulator token is not defined');

    manufacturerUser = await rest.createUser(manufacturerToken, options);
    distributorUser = await rest.createUser(distributorToken, options);
    adminUser = await rest.createUser(adminToken, options);
    regulatorUser = await rest.createUser(regulatorToken, options);
  })

  it('should create a bidding chain', async function () {
    const { chainId } = await bidChain.createChain(distributorUser, manufacturerUser.address, regulatorUser.address)

    // takes a few to populate
    await util.sleep(2 * 1000);

    const chain = await bidChain.getChainById(chainId);

    assert.equal(chain.info.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match')
    assert.equal(chain.info.members.length, 3, 'Chain should have 3 members');

    const chains = await bidChain.getChains(distributorToken);

    const fChain = chains.find((c) => {
      return c.id === chainId
    })

    assert.isDefined(fChain, 'Should be able to query for chain using token');
  })

  // TODO: test does not pass. member is not being removed.
  it('should remove a member from bidding chain', async function () {
    const { chainId } = await bidChain.createChain(distributorToken, manufacturerUser.address, regulatorUser.address)
    // takes a few to populate
    await util.sleep(2 * 1000);

    const chain = await bidChain.getChainById(chainId);
    assert.equal(chain.info.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(chain.info.members.length, 3, 'Chain should have 3 members');

    const contractArgs = {
      name: contractName,
      source: await importer.combine(contractFileName),
      args: {}
    }

    const govContract = await rest.createContract(distributorUser, contractArgs, { config, chainIds: [chainId] });

    // Remove member
    await bidChain.removeMember(distributorUser, govContract, manufacturerUser.address, chainId);

    const updatedChain = await bidChain.getChainById(chainId);
    assert.equal(updatedChain.info.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(updatedChain.info.members.length, 2, 'Chain should have 2 members');
  })

  it('should add a member from bidding chain', async function () {
    const { chainId } = await bidChain.createChain(distributorToken, manufacturerUser.address, regulatorUser.address)

    // takes a few to populate
    await util.sleep(2 * 1000);

    const chain = await bidChain.getChainById(chainId);
    assert.equal(chain.info.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(chain.info.members.length, 3, 'Chain should have 3 members');

    const contractArgs = {
      name: contractName,
      source: await importer.combine(contractFileName),
      args: {}
    }

    const govContract = await rest.createContract(distributorUser, contractArgs, { config, chainIds: [chainId] });

    // add member to the chain
    await bidChain.addMember(distributorToken, govContract, adminUser.address, chainId);

    const updatedChain = await bidChain.getChainById(chainId);

    assert.equal(updatedChain.info.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match')
    assert.equal(updatedChain.info.members.length, 4, 'Chain should have 4 members');
  })

})
