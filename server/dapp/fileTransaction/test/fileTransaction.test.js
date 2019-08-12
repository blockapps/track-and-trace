import { rest, util } from 'blockapps-rest';
import { assert } from 'chai';
import factory from './fileTransaction.factory';
import fileTransactionJs from '../fileTransaction';
import config from '../../../load.config';

import dotenv from 'dotenv';
const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const options = { config }
console.log(config);
const adminCredentials = { token: process.env.ADMIN_TOKEN };
const masterCredentials = { token: process.env.MASTER_TOKEN };


describe('FileTransaction Tests', function () {
  this.timeout(config.timeout);

  before(async function () {
    assert.isDefined(adminCredentials.token, 'admin token is not defined');
    assert.isDefined(masterCredentials.token, 'master token is not defined');
  });

  it('Create FileTransaction contract', async function () {
    const uid = util.uid()
    // constructor
    const constructorArgs = factory.createConstructorArgs(uid);
    const contract = await fileTransactionJs.uploadContract(adminCredentials, constructorArgs);
    // set details
    const detailsArgs = factory.createDetailsArgs(uid);
    contract.setDetails(detailsArgs)
    // check state
    const state = await contract.getState();
    assert.equal(state.fileTransactionId, constructorArgs.fileTransactionId, 'fileTransactionId')
  });
});
