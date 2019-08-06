import { rest, util } from 'blockapps-rest';
import { assert } from 'chai';

import config from '../../../load.config';

import dotenv from 'dotenv';

import exstorage from '../exstorage'

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

const adminCredentials = { token: process.env.ADMIN_TOKEN };
const masterCredentials = { token: process.env.MASTER_TOKEN };

const options = { config }

const adminBlocName = 'admin'
const adminBlocPassword = '1234'
let adminBlocAddress

describe('External Storage Tests', function () {
  this.timeout(config.timeout);

  let adminUser, masterUser;

  before(async function () {

    assert.isDefined(adminCredentials.token, 'admin token is not defined');
    assert.isDefined(masterCredentials.token, 'master token is not defined');

    adminUser = await rest.createUser(adminCredentials, options);
    masterUser = await rest.createUser(masterCredentials, options);

    // admin user must be created in the SMD
    const users = await rest.getUsers({}, options)
    const index = users.indexOf(adminBlocName)
    assert.isAtLeast(index, 0, 'user not found: ' + adminBlocName)
    adminBlocAddress = await rest.getUser({ username: adminBlocName }, options)
    assert.isDefined(adminBlocAddress, 'adminBlocAddress')
  });

  /*

    curl -X POST "http://<your-ip-address>/apex-api/bloc/file/upload" -H "accept: application/json;charset=utf-8" -H "Content-Type: multipart/form-data"
      -F "username=<username>"
      -F "password=<password>"
      -F "address=<address-of-user>"
      -F "provider=s3"
      -F "metadata=<description>"
      -F "content=@<local-path-to-file>;type=<type-of-file>"

    @see: https://developers.blockapps.net/advanced/external-storage/

    {
      "contractAddress": "0x123456789",
      "URI": "`...`",
      "metadata": "a sample video on s3"
    }
  */
  it('Upload file', async function () {
    const uid = util.uid()
    const host = config.nodes[0].url;
    const content = `${util.cwd}/${config.dappPath}/exstorage/test/fixtures/upload.jpg`
    const type = 'image/jpeg'

    const args = {
      host,
      username: adminBlocName,
      password: adminBlocPassword,
      address: adminBlocAddress,
      provider: 's3',
      metadata: `metadata ${uid}`,
      content,
      type,
    }

    const results = await exstorage.upload(args)
    // {
    // "contractAddress":"8f8fa44ea0a84a7b4dc9f64fb85e77f3583d65a9",
    // "uri":"https://strato-external-test-bucket.s3.amazonaws.com/1564525231435-upload.jpg",
    // "metadata":"metadata 266108"
    // }
    assert.isDefined(results.contractAddress, 'contractAddress')
    assert.isDefined(results.uri, 'uri')
    assert.equal(results.metadata, args.metadata, 'metadata')
  });

  it('Download file', async function () {

    const uid = util.uid()
    const content = `${util.cwd}/${config.dappPath}/exstorage/test/fixtures/upload.jpg`
    const type = 'image/jpeg'
    const host = config.nodes[0].url;

    const uploadArgs = {
      host,
      username: adminBlocName,
      password: adminBlocPassword,
      address: adminBlocAddress,
      provider: 's3',
      metadata: `metadata ${uid}`,
      content,
      type,
    }
    const uploadResults = await exstorage.upload(uploadArgs)
    const args = {
      host,
      contractAddress: uploadResults.contractAddress
    }

    const downloadResults = await exstorage.download(args)
    /*
    {"url":"https://strato-external-test-bucket.s3.amazonaws.com/1564526045712-upload.jpg?AWSAccessKeyId=AKIASUITSAQO7UEK2EN5&Expires=1564583770&Signature=2iET3vts2MRqpgfCTURpyPjtAiU%3D"}
    */
    assert.isDefined(downloadResults.url, 'url')
  });


  it('Verify file', async function () {
    const uid = util.uid()
    const content = `${util.cwd}/${config.dappPath}/exstorage/test/fixtures/upload.jpg`
    const type = 'image/jpeg'
    const host = config.nodes[0].url;

    const uploadArgs = {
      host,
      username: adminBlocName,
      password: adminBlocPassword,
      address: adminBlocAddress,
      provider: 's3',
      metadata: `metadata ${uid}`,
      content,
      type,
    }
    const uploadResults = await exstorage.upload(uploadArgs)

    const verifyArgs = {
      host,
      contractAddress: uploadResults.contractAddress,
      address: adminBlocAddress,
    }

    const verifyResults = await exstorage.verify(verifyArgs)
    /*
    {"uri":"https://strato-external-test-bucket.s3.amazonaws.com/1564526045712-upload.jpg",
    "timeStamp":1564526046,
    "signers":["71e99ad9d89ad199a1516cb726ebec0dc73b7563"]}
    */
    assert.isDefined(verifyResults.uri, 'uri')
    assert.isDefined(verifyResults.timeStamp, 'timeStamp')
    assert.equal(verifyResults.signers[0], verifyArgs.address, 'signers')
  });
});

