import { assert } from 'chai';
import { factory } from '../../dapp/asset/asset.factory';
import { getEnums } from '../../helpers/parse';
import { get, post } from '../helpers/rest';
import endpoints from '../../api/v1/endpoints';
import testHelper from '../helpers/test';
import config from '../../load.config';
import dotenv from 'dotenv';
import { util } from "blockapps-rest";
const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminToken = { token: process.env.ADMIN_TOKEN };
const manufacturerToken = { token: process.env.MANUFACTURER_TOKEN };

describe('External Storage Tests', function () {
    this.timeout(config.timeout);
    let TtRole;
    before(async function () {
        assert.isDefined(adminToken, 'admin token is not defined');
        assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
        // get TtRole Enums
        TtRole = await getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`);
        await testHelper.createUser(manufacturerToken, adminToken, TtRole.MANUFACTURER);
    });
    it('Upload', async function () {
        const uid = util.uid();
        const file = {content: 'content' + uid, type: 'type' + uid};
        const result = await post(endpoints.Exstorage.upload, {file} , manufacturerToken.token);
        console.log('server/test/v1/exstorageTest Upload test', result);
        assert.deepEqual(file, result.args);
    });
    it('Download', async function () {
        const uid = util.uid();
        const address = 'address' + uid;
        const endpoint = endpoints.Exstorage.download.replace(':address', address);
        const result = await get(endpoint, manufacturerToken.token);
        console.log('server/test/v1/exstorageTest Download test', result);

    });
    it('Verify', async function () {
        const uid = util.uid();
        const address = 'address' + uid;
        const endpoint = endpoints.Exstorage.verify.replace(':address', address);
        const result = await get(endpoint, manufacturerToken.token);
    });

});
