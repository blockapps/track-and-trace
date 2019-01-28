require('co-mocha');

const { rest6: rest, common } = require('blockapps-rest');
const { util, assert } = common;

const TEST_TIMEOUT = 60000;

// TODO: TT-5 replace with predefined OAuth tokens
const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('Asset Manager Tests', function () {
  this.timeout(TEST_TIMEOUT);

  let adminUser;

  before(function* () {
    adminUser = yield rest.createUser(adminName, adminPassword);
    yield rest.fill(adminUser, true);
  });

  it('Empty test', function* () {
    assert.equal(true, true, 'true');
  });
});
