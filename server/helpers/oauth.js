import { rest } from 'blockapps-rest';
import jwtDecode from 'jwt-decode';
import config from '../load.config';

const options = { config }

const getEmailIdFromToken = function (accessToken) {
  return (jwtDecode(accessToken)['email']);
};

async function createStratoUser(accessToken) {
  try {
    let user = await rest.createUser(accessToken, options);
    return { status: 200, message: 'success', user };
  } catch (e) {
    return { status: e.response.status, message: `error while creating user` };
  }
};

export default {
  getEmailIdFromToken,
  createStratoUser
}
