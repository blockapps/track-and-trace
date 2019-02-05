require('co-mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const { common } = require('blockapps-rest');
const { assert, config } = common;
const { apiUrl } = config;


const server = require(`${process.cwd()}`);

const get = function* (endpoint, accessToken=null) {
  const url = apiUrl + endpoint;
  const response = accessToken
    ? yield chai.request(server).get(url).set('Cookie', `${config.oauth.appTokenCookieName}=${accessToken}`)
    : yield chai.request(server).get(url);
  assert.equal(response.statusCode, 200, `${url} should return status 200 OK`);
  return response.body.data;
}

const post = function* (endpoint, body, accessToken=null) {
  const url = apiUrl + endpoint;
  const response = accessToken
    ? yield chai.request(server).post(url).set('Cookie', `${config.oauth.appTokenCookieName}=${accessToken}`).send(body)
    : yield chai.request(server).post(url).send(body);
  assert.equal(response.statusCode, 200, `${url} should return status 200 OK`);
  return response.body.data;
}


module.exports = {
  get,
  post
};
