import { rest, util, importer } from "blockapps-rest";
import { assert } from "chai";
import bidChain from "../bidchain";
import config from "../../../load.config";
import dotenv from "dotenv";

const loadEnv = dotenv.config();
assert.isUndefined(loadEnv.error);

const contractName = "BidGovernance";
const contractFileName = `${process.cwd()}/${
  config.dappPath
}/bidChain/contracts/BidChain.sol`;

const options = { config };

describe("Bid Chain Tests", function() {
  this.timeout(config.timeout);

  let adminUser, regulatorUser, manufacturerUser, distributorUser;
  const distributorCredentials = { token: process.env.DISTRIBUTOR_TOKEN };
  const manufacturerCredentials = { token: process.env.MANUFACTURER_TOKEN };
  const adminCredentials = { token: process.env.ADMIN_TOKEN };
  const regulatorCredentials = { token: process.env.REGULATOR_TOKEN };

  before(async function() {
    assert.isDefined(
      manufacturerCredentials.token,
      "manufacturer token is not defined"
    );
    assert.isDefined(
      distributorCredentials.token,
      "distributor token is not defined"
    );
    assert.isDefined(adminCredentials.token, "admin token is not defined");
    assert.isDefined(
      regulatorCredentials.token,
      "regulator token is not defined"
    );

    manufacturerUser = await rest.createUser(manufacturerCredentials, options);
    distributorUser = await rest.createUser(distributorCredentials, options);
    adminUser = await rest.createUser(adminCredentials, options);
    regulatorUser = await rest.createUser(regulatorCredentials, options);
  });

  it("should create a bidding chain", async function() {
    const { chainId } = await bidChain.createChain(
      distributorUser,
      manufacturerUser.address,
      regulatorUser.address
    );

    // takes a few to populate
    await util.sleep(2 * 1000);

    const chain = await bidChain.getChainById(distributorUser, chainId);

    assert.equal(
      chain.info.label,
      `bid_${distributorUser.address}_${manufacturerUser.address}`,
      "Chain label should match"
    );
    assert.equal(chain.info.members.length, 3, "Chain should have 3 members");

    const chains = await bidChain.getChains(distributorCredentials);

    const fChain = chains.find(c => {
      return c.id === chainId;
    });

    assert.isDefined(fChain, "Should be able to query for chain using token");
  });

  // TODO: test does not pass. member is not being removed.
  it("should remove a member from bidding chain", async function() {
    const { chainId } = await bidChain.createChain(
      distributorCredentials,
      manufacturerUser.address,
      regulatorUser.address
    );
    // takes a few to populate
    await util.sleep(2 * 1000);

    const chain = await bidChain.getChainById(distributorUser, chainId);
    assert.equal(
      chain.info.label,
      `bid_${distributorUser.address}_${manufacturerUser.address}`,
      "Chain label should match"
    );
    assert.equal(chain.info.members.length, 3, "Chain should have 3 members");

    const contractArgs = {
      name: contractName,
      source: await importer.combine(contractFileName),
      args: {}
    };

    const copyOfOptions = {
      ...options,
      chainIds: [chainId]
    };
    const govContract = await rest.createContract(
      distributorUser,
      contractArgs,
      copyOfOptions
    );

    // Remove member
    await bidChain.removeMember(
      distributorUser,
      govContract,
      manufacturerUser.address,
      chainId
    );

    const updatedChain = await bidChain.getChainById(distributorUser, chainId);
    assert.equal(
      updatedChain.info.label,
      `bid_${distributorUser.address}_${manufacturerUser.address}`,
      "Chain label should match"
    );
    assert.equal(
      updatedChain.info.members.length,
      2,
      "Chain should have 2 members"
    );
  });

  it("should add a member to bidding chain", async function() {
    const { chainId } = await bidChain.createChain(
      distributorCredentials,
      manufacturerUser.address,
      regulatorUser.address
    );

    // takes a few to populate
    await util.sleep(2 * 1000);

    const chain = await bidChain.getChainById(distributorUser, chainId);
    assert.equal(
      chain.info.label,
      `bid_${distributorUser.address}_${manufacturerUser.address}`,
      "Chain label should match"
    );
    assert.equal(chain.info.members.length, 3, "Chain should have 3 members");

    const contractArgs = {
      name: contractName,
      source: await importer.combine(contractFileName),
      args: {}
    };

    const copyOfOptions = {
      ...options,
      chainIds: [chainId]
    };
    const govContract = await rest.createContract(
      distributorUser,
      contractArgs,
      copyOfOptions
    );

    // add member to the chain
    await bidChain.addMember(
      distributorCredentials,
      govContract,
      adminUser.address,
      chainId
    );

    const updatedChain = await bidChain.getChainById(distributorUser, chainId);

    assert.equal(
      updatedChain.info.label,
      `bid_${distributorUser.address}_${manufacturerUser.address}`,
      "Chain label should match"
    );
    assert.equal(
      updatedChain.info.members.length,
      4,
      "Chain should have 4 members"
    );
  });
});
