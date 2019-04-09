import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import config from '../../load.config';
import server from '../../index';

const get = async function (endpoint, accessToken = null) {
  const url = config.apiUrl + endpoint;
  const response = accessToken
    ? await chai.request(server).get(url).set('Cookie', `${config.nodes[0].oauth.appTokenCookieName}=${accessToken}`)
    : await chai.request(server).get(url);
  chai.assert.equal(response.statusCode, 200, `${url} should return status 200 OK`);
  return response.body.data;
}

const post = async function (endpoint, body, accessToken = null) {
  const url = config.apiUrl + endpoint;
  const response = accessToken
    ? await chai.request(server).post(url).set('Cookie', `${config.nodes[0].oauth.appTokenCookieName}=${accessToken}`).send(body)
    : await chai.request(server).post(url).send(body);
  chai.assert.equal(response.statusCode, 200, `${url} should return status 200 OK`);
  return response.body.data;
}

export {
  get,
  post
};
