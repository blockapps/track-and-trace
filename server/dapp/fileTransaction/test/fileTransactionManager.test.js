import { rest, util, assert } from 'blockapps-rest';
import config from '../../../load.config';
import dotenv from 'dotenv';
import RestStatus from "http-status-codes";
import fileTransactionJs from '../fileTransaction';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

import fileTransactionManagerJs from '../fileTransactionManager';
import factory from './fileTransaction.factory';

const adminCredentials = { token: process.env.ADMIN_TOKEN };

config.VM = "SolidVM"

const options = { config }

describe('FileTransaction Manager Tests', function () {
  this.timeout(config.timeout);

  let adminUser, masterUser, manufacturerUser, distributorUser;

  before(async function () {
    assert.isDefined(adminCredentials.token, 'admin token is not defined');

    adminUser = await rest.createUser(adminCredentials, options);
  });

  it('Upload FileTransaction Manager', async function () {
    const contract = await fileTransactionManagerJs.uploadContract(adminUser, options);
    const state = await contract.getState()
    assert.isDefined(state.fileTransactions, 'fileTransactions')
  });

  it('Create FileTransaction - 201', async function () {
    // create contract
    const contract = await fileTransactionManagerJs.uploadContract(adminUser, options);
    // create fileTransaction
    const uid = util.uid()
    // constructor
    const constructorArgs = factory.createConstructorArgs(uid);
    const fileTransaction = await contract.createFileTransaction(constructorArgs)
    assert.equal(fileTransaction.fileTransactionId, constructorArgs.fileTransactionId, 'fileTransactionId')
    // set details
    const detailsArgs = factory.createDetailsArgs(uid);
    detailsArgs.fileTransactionId = fileTransaction.fileTransactionId;
    const address = await contract.setDetails(detailsArgs)
    // check the state
    const ftContract = fileTransactionJs.bindAddress(adminUser, address)
    const state = await ftContract.getState();
    assert.equal(state.fileTransactionId, constructorArgs.fileTransactionId, 'fileTransactionId')
  });

  it('Create FileTransaction - 400 - exists', async function () {
    // create contract
    const contract = await fileTransactionManagerJs.uploadContract(adminUser, options);
    // create fileTransaction
    const uid = util.uid()
    const constructorArgs = factory.createConstructorArgs(uid)
    const fileTransaction = await contract.createFileTransaction(constructorArgs)
    assert.equal(fileTransaction.fileTransactionId, constructorArgs.fileTransactionId, 'fileTransactionId')

    await assert.restStatus(async function () {
      return await contract.createFileTransaction(constructorArgs)
    }, RestStatus.BAD_REQUEST)
  });
});
