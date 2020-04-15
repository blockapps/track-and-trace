import { assert } from 'chai';
import { rest, util } from 'blockapps-rest';

import config from '../../../util/load.config';
import { uploadContract, getUser } from '../user';
import { createUserArgs } from './user.factory';

import dotenv from 'dotenv';
const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminCredentials = { token: process.env.ADMIN_TOKEN };

describe('User tests', function () {
  this.timeout(config.timeout);

  const options = { config }
  let admin;

  before(async function () {
    admin = await rest.createUser(adminCredentials, options);
  });

  it('Create Contract', async function () {
    const uid = util.uid();
    // create the user with constructor args
    const args = createUserArgs(admin.address, uid);
    const contract = await uploadContract(adminCredentials, args);
    const user = await contract.getState();
    assert.equal(user.account, args.account, 'account');
    assert.equal(user.username, args.username, 'username');
    assert.equal(user.role, args.role, 'role');
  });

  it('Search Contract', async function () {
    const uid = util.uid();
    // create the user with constructor args
    const args = createUserArgs(admin.address, uid);
    const contract = await uploadContract(admin, args);
    // search
    const user = await getUser(admin, args.username);
    assert.equal(user.account, args.account, 'account');
    assert.equal(user.username, args.username, 'username');
    assert.equal(user.role, args.role, 'role');
  });

});
