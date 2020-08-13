import { assert } from 'chai';
import { factory } from '../../dapp/asset/asset.factory';
import { getEnums } from '../../helpers/parse';
import { post } from '../helpers/rest';
import { util } from 'blockapps-rest';
import endpoints from '../../api/v1/endpoints';
import testHelper from '../helpers/test';
import config from '../../load.config';
import moment from 'moment';

import dotenv from 'dotenv';
const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminToken = { token: process.env.ADMIN_TOKEN };
const manufacturerToken = { token: process.env.MANUFACTURER_TOKEN };

describe('Create Assets Load Test', function () {
  this.timeout(config.timeout);
  const batchSize = util.getArgInt('--batchSize', 1);

  let TtRole;

  before(async function () {
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');

    // get TtRole Enums
    TtRole = await getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);

    await testHelper.createUser(manufacturerToken, adminToken, TtRole.MANUFACTURER);
  });

  it(`Create ${batchSize} Asset`, async function () {
    const startTime = moment();
    let createAssestTotalTime = 0;
    const createAssetListArgs = factory.createAssetListArgs(batchSize);
    
    for (let i=0; i < createAssetListArgs.length; i++) {
      const createAssetStartTime = moment();
      await post(endpoints.Assets.assets, { asset: createAssetListArgs[i] }, manufacturerToken.token);
      createAssestTotalTime += moment().diff(createAssetStartTime, 'seconds');
    }

    const createAssestsEndTimeinSec = moment().diff(startTime, 'seconds');
    const resultText = `
--------------------------------------------
Total Time: ${createAssestsEndTimeinSec} sec
Total Time to create ${batchSize} assets: ${createAssestTotalTime} sec
--------------------------------------------
`
    console.log(resultText)
  });
});
