import { rest } from 'blockapps-rest';
import jwtDecode from 'jwt-decode';

import { getYamlFile } from './config';
const config = getYamlFile('config.yaml');

const options = { config }

const getEmailIdFromToken = function (accessToken) {
  return (jwtDecode(accessToken)['email']);
};

async function createStratoUser(accessToken, userIdOptional = null) {
  // TODO: any other cases that needs to be handled?
  try {
    let user = await rest.createUser(accessToken, options);
    return { status: 200, message: 'success', user };
  } catch (e) {
    return { status: e.status, message: `error while creating user` };
  }
};

export default {
  getEmailIdFromToken,
  createStratoUser
}
