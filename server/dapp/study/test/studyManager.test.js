import { rest, util, assert } from 'blockapps-rest';
import config from '../../../load.config';
import dotenv from 'dotenv';

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

import studyManagerJs from '../studyManager';
import factory from './study.factory';
import studyJs from '../study';

const adminCredentials = { token: process.env.ADMIN_TOKEN };

const options = { config }

describe('Study Manager Tests', function () {
  this.timeout(config.timeout);

  let adminUser, masterUser, manufacturerUser, distributorUser;

  before(async function () {
    assert.isDefined(adminCredentials.token, 'admin token is not defined');

    adminUser = await rest.createUser(adminCredentials, options);
  });

  it('Upload Study Manager', async function () {
    const contract = await studyManagerJs.uploadContract(adminUser);
  });
});
