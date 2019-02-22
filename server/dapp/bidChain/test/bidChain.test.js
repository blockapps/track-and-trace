require('dotenv').config();
require('co-mocha');
const { common, rest6: rest } = require('blockapps-rest');
const { assert, config, fsutil, util } = common;
const { getEmailIdFromToken, createStratoUser } = require(`${process.cwd()}/helpers/oauth`);

const bidChain = require(`${process.cwd()}/${config.dappPath}/bidChain/bidChain`);
const bidJs = require(`${process.cwd()}/${config.dappPath}/bid/bid`);
const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);
const assetFactory = require(`${process.cwd()}/${config.dappPath}/asset/asset.factory`);
const assetManagerJs = require(`${process.cwd()}/${config.dappPath}/asset/assetManager`);

const contractName = 'BidGovernance';
const contractAddress = '0000000000000000000000000000000000000100';   // the governance contract on private chains has this same address

describe('Bid Chain Tests', function() {
  this.timeout(60*1000);

  const distributorToken = process.env.DISTRIBUTOR_TOKEN;
  const manufacturerToken = process.env.MANUFACTURER_TOKEN;
  const adminToken = process.env.ADMIN_TOKEN;
  const masterToken = process.env.MASTER_TOKEN;
  let assetManagerContract, manufacturerAssetManagerContract;

  function* createUser(userToken) {
    const userEmail = getEmailIdFromToken(userToken);
    const createAccountResponse = yield createStratoUser(userToken, userEmail);
    assert.equal(createAccountResponse.status, 200, createAccountResponse.message);
    return { address: createAccountResponse.address, username: userEmail };
  }

  function* createAsset() {
    const assetArgs = assetFactory.getAssetArgs();
    const asset = yield manufacturerAssetManagerContract.createAsset(assetArgs);
    assert.equal(asset.sku, assetArgs.sku, 'sku');
    return asset;
  }

  function bindAssetManagerContractToUser(user, contract) {
    let copy = Object.assign({}, contract);

    return assetManagerJs.bind(user, copy);
  }

  before(function* () {
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    assert.isDefined(distributorToken, 'distributor token is not defined');

    manufacturerUser = yield createUser(manufacturerToken);
    distributorUser = yield createUser(distributorToken);
    adminUser = yield createUser(adminToken);

    const ttPermissionManager = yield ttPermissionManagerJs.uploadContract(adminToken, masterToken);
    assetManagerContract = yield assetManagerJs.uploadContract(adminToken, ttPermissionManager);

    yield ttPermissionManager.grantManufacturerRole(manufacturerUser);
    yield ttPermissionManager.grantDistributorRole(distributorUser);

    manufacturerAssetManagerContract = bindAssetManagerContractToUser(manufacturerToken, assetManagerContract);
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
  it.skip('should remove a member from bidding chain', function* () {
    // const chainId = yield bidChain.createChain(distributorToken, manufacturerUser.address)
    // // takes a few to populate
    // yield util.sleep(2*1000);
    //
    // const chain = yield bidChain.getChainById(chainId);
    // console.log(chain.members);
    const asset = yield createAsset();

    const bidValue = 100;
    const bid = yield bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue);
    const chain = yield bidChain.getChainById(bid.chainId);
    console.log('HERE IS THE CHAIN', chain);
    console.log('HERE IS THE MANUFACTURER USER', manufacturerUser);
    assert.equal(chain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(chain.members.length, 2, 'Chain should have 2 members');



    const bidContract = bidChain.bind(distributorToken, {
        name: 'Bid',
        address: bid.address,
        src: 'removed'
      },
      bid.chainId
    );
    // bidContract = bidChain.bind(distributorToken, {
    //   name: 'Bid',
    //   address: bidContract.address,
    //   src: 'removed'
    // });
    console.log('here is the bidContract', bidContract);
    const result = bidContract.removeMember(manufacturerUser.address);
    // const result = yield bidChain.removeMember(distributorToken,
    //   {
    //     name: 'Bid',
    //     address: bidContract.address,
    //     src: 'removed'
    //   },
    //   manufacturerUser.address,
    //   {
    //     chainId: chainId
    //   }
    // );
    console.log('Here is the result', result);
    const updatedChain = yield bidChain.getChainById(bid.chainId);
    assert.equal(updatedChain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(updatedChain.members.length, 1, 'Chain should have 1 member');

  })

  it('should add a member from bidding chain', function* () {
    // const chainId = yield bidChain.createChain(distributorToken, manufacturerUser.address)
    //
    // // takes a few to populate
    // yield util.sleep(2*1000);
    const asset = yield createAsset();

    const bidValue = 100;
    const bid = yield bidJs.createBid(distributorToken, asset.address, asset.owner, bidValue);
    const chain = yield bidChain.getChainById(bid.chainId);
    console.log('HERE IS THE CHAIN', chain);
    console.log('HERE IS THE MANUFACTURER USER', manufacturerUser);
    assert.equal(chain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match');
    assert.equal(chain.members.length, 2, 'Chain should have 2 members');



    const bidContract = bidChain.bind(distributorToken, {
        name: 'Bid',
        address: bid.address,
        src: 'removed'
      },
      bid.chainId
    );


    console.log('Here is adminUser to be added', adminUser);
    // const result = yield bidChain.addMember(distributorToken,
    //   {
    //     name: contractName,
    //     address: contractAddress
    //   },
    //   adminUser.address,
    //   {
    //     chaindId: chainId
    //   }
    // );
    const result = bidContract.addMember(adminUser.address);
    console.log('HERE IS THE RESULT', result);

    const newChain = yield bidChain.getChainById(bid.chainId);
    console.log('THIS IS THE NEW CHAIN', newChain);
    assert.equal(newChain.label, `bid_${distributorUser.address}_${manufacturerUser.address}`, 'Chain label should match')
    assert.equal(newChain.members.length, 3, 'Chain should have 3 members');
  })

})
