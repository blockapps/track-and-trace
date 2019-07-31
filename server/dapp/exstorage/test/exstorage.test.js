import { rest, util } from 'blockapps-rest';
import { assert } from 'chai';

import config from '../../../load.config';

import dotenv from 'dotenv';

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
    const content = `${util.cwd}/${config.dappPath}/exstorage/test/fixtures/upload.jpg`
    const type = 'image/jpeg'

    const args = {
      host: 'localhost:8080',
      username: adminBlocName,
      password: adminBlocPassword,
      address: adminBlocAddress,
      provider: 's3',
      metadata: `metadata ${uid}`,
      content,
      type,
    }

    const results = await upload(args)
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

    const uploadArgs = {
      host: 'localhost:8080',
      username: adminBlocName,
      password: adminBlocPassword,
      address: adminBlocAddress,
      provider: 's3',
      metadata: `metadata ${uid}`,
      content,
      type,
    }
    const uploadResults = await upload(uploadArgs)
    const args = {
      host: 'localhost:8080',
      contractAddress: uploadResults.contractAddress
    }

    const downloadResults = await download(args)
    /*
    {"url":"https://strato-external-test-bucket.s3.amazonaws.com/1564526045712-upload.jpg?AWSAccessKeyId=AKIASUITSAQO7UEK2EN5&Expires=1564583770&Signature=2iET3vts2MRqpgfCTURpyPjtAiU%3D"}
    */
    assert.isDefined(downloadResults.url, 'url')
  });


  it('Verify file', async function () {
    const uid = util.uid()
    const content = `${util.cwd}/${config.dappPath}/exstorage/test/fixtures/upload.jpg`
    const type = 'image/jpeg'

    const uploadArgs = {
      host: 'localhost:8080',
      username: adminBlocName,
      password: adminBlocPassword,
      address: adminBlocAddress,
      provider: 's3',
      metadata: `metadata ${uid}`,
      content,
      type,
    }
    const uploadResults = await upload(uploadArgs)

    const verifyArgs = {
      host: 'localhost:8080',
      contractAddress: uploadResults.contractAddress,
      address: adminBlocAddress,
    }

    const verifyResults = await verify(verifyArgs)
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

async function upload(args) {
  const command = `curl \
    -X POST "http://${args.host}/apex-api/bloc/file/upload" \
    -H "accept: application/json;charset=utf-8" -H "Content-Type: multipart/form-data" \
    -F "username=${args.username}" \
    -F "password=${args.password}" \
    -F "address=${args.address}" \
    -F "provider=s3" \
    -F "metadata=${args.metadata}" \
    -F "content=@${args.content};type=${args.type}"`
  const resultsString = await exec(command)
  return JSON.parse(resultsString)
}


async function download(args) {
  /*
  curl -X GET "http://<your-ip-address>/apex-api/bloc/file/download?contractAddress=<contract-address-of-externally-stored-object>"
  -H "accept: application/json;charset=utf-8"
  */
  const command = `curl \
    -X GET "http://${args.host}/apex-api/bloc/file/download?contractAddress=${args.contractAddress}" \
    -H "accept: application/json;charset=utf-8"`
  const resultsString = await exec(command)
  return JSON.parse(resultsString)
}

async function verify(args) {
  /*
  curl -X GET "http://<your-ip-address>/apex-api/bloc/file/verify?contractAddress=<contract-address-of-externally-stored-object>"
       -H "accept: application/json;charset=utf-8"
  */
  const command = `curl \
    -X GET "http://${args.host}/apex-api/bloc/file/verify?contractAddress=${args.contractAddress}" \
  -H "accept: application/json;charset=utf-8"`
  const resultsString = await exec(command)
  return JSON.parse(resultsString)
}


async function ls(args) {
  const command = `ls ${args}`
  const results = await exec(command)
  return results
}


async function exec(command) {
  const child = require('child_process')
  return new Promise(function (resolve, reject) {
    child.exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err) // throws exception
      }
      resolve(stdout) // return value
    })
  })
}