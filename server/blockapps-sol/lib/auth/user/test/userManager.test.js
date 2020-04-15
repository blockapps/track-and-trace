import { assert } from 'chai';
import { rest, util, fsUtil, parser } from 'blockapps-rest';
const { createUser, call } = rest;

import config from '../../../util/load.config';
import { uploadContract } from '../userManager';
import { createUserArgs } from './user.factory';
import RestStatus from 'http-status-codes';

import dotenv from 'dotenv';
const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminCredentials = { token: process.env.ADMIN_TOKEN };
const masterCredentials = { token: process.env.MASTER_TOKEN };

describe('UserManager tests', function () {
  this.timeout(config.timeout);

  const options = { config }

  let admin, master;
  let contract;

  // get ready:  admin-user and manager-contract
  before(async function () {
    admin = await createUser(adminCredentials, options);
    contract = await uploadContract(admin);
    // bloc account must be created separately
    master = await createUser(masterCredentials, options);
  });

  it('Create User', async function () {
    const uid = util.uid();
    // create user with the bloc account
    const args = createUserArgs(admin.address, uid);
    const user = await contract.createUser(args);
    assert.equal(user.account, args.account, 'account');
    assert.equal(user.username, args.username, 'username');
    assert.equal(user.role, args.role, 'role');
  });

  it('Create User - UNAUTHORIZED', async function () {
    const uid = util.uid();
    const args = createUserArgs(master.address, uid);
    const attacker = await rest.createUser(master, options);

    const callArgs = {
      contract,
      method: 'createUser',
      args: util.usc(args)
    }

    // create user UNAUTHORIZED
    const [restStatus] = await call(attacker, callArgs, options);
    assert.equal(restStatus, RestStatus.UNAUTHORIZED, 'should fail');
  });

  it('Create User - illegal name', async function () {
    const uid = util.uid();
    const args = createUserArgs(master.address, uid);
    args.username = '123456789012345678901234567890123'; // 33 chars

    try {
      await contract.createUser(args);
    } catch (e) {
      assert.equal(e.response.status, RestStatus.BAD_REQUEST, 'should Throws 404 Not found')
    }
  });

  it('Test exists()', async function () {
    const uid = util.uid();
    const args = createUserArgs(master.address, uid);

    let exists;
    // should not exist
    exists = await contract.exists(args.username);
    assert.isDefined(exists, 'should be defined');
    assert.isNotOk(exists, 'should not exist');
    // create user
    const user = await contract.createUser(args);
    // should exist
    exists = await contract.exists(args.username);
    assert.equal(exists, true, 'should exist')
  });

  it('Test exists() with special characters', async function () {
    const uid = util.uid();
    const args = createUserArgs(master.address, uid);
    args.username += ' ?#%!@*';

    let exists;
    // should not exist
    exists = await contract.exists(args.username);
    assert.isDefined(exists, 'should be defined');
    assert.isNotOk(exists, 'should not exist');
    // create user
    const user = await contract.createUser(args);
    // should exist
    exists = await contract.exists(args.username);
    assert.equal(exists, true, 'should exist')
  });

  it('Create Duplicate User', async function () {
    const uid = util.uid();
    const args = createUserArgs(master.address, uid);

    try {
      await contract.createUser(args);
    } catch (e) {
      assert.equal(e.response.status, RestStatus.BAD_REQUEST, 'should Throws 404 Not found')
    }
  });

  it('Get User', async function () {
    const uid = util.uid();
    const args = createUserArgs(master.address, uid);

    // get non-existing user
    try {
      await contract.getUser(args.username);
    } catch (e) {
      assert.equal(e.response.status, RestStatus.NOT_FOUND, 'should Throws 404 Not found')
    }
    // create user
    await contract.createUser(args);
    // get user - should exist
    const user = await contract.getUser(args.username);
    assert.equal(user.username, args.username, 'username should be found');
  });

  it('Get Users', async function () {
    const uid = util.uid();
    const args = createUserArgs(master.address, uid);

    // get users - should not exist
    {
      const users = await contract.getUsers();
      const found = users.filter(function (user) {
        return user.username === args.username;
      });
      assert.equal(found.length, 0, 'user list should NOT contain ' + args.username);
    }
    // create user
    const user = await contract.createUser(args);
    // get user - should exist
    {
      const users = await contract.getUsers(admin, contract);
      const found = users.filter(function (user) {
        return user.username === args.username;
      });
      assert.equal(found.length, 1, 'user list should contain ' + args.username);
    }
  });

  // TODO: we can remove this as we are checking the same in userManager-load.test.js. @lior please confirm
  it.skip('User address leading zeros - load test - skipped', async function () {
    this.timeout(60 * 60 * 1000);
    const uid = util.uid();
    const args = createUserArgs(account.address, uid);
    const username = args.username;

    const count = 16 * 4; // leading 0 once every 16
    const users = [];
    // create users
    for (let i = 0; i < count; i++) {
      args.username = username + '_' + i;
      const user = await contract.createUser(args);
      users.push(user);
    }

    // get single user
    for (let user of users) {
      const resultUser = await contract.getUser(user.username);
    }

    // get all users
    const resultUsers = await contract.getUsers(admin, contract);
    const comparator = function (a, b) { return a.username == b.username; };
    const notFound = util.filter.isContained(users, resultUsers, comparator, true);
    assert.equal(notFound.length, 0, JSON.stringify(notFound));
  });

});
