import { rest } from 'blockapps-rest';
import jwtDecode from 'jwt-decode';

import { getYamlFile } from './config';
const config = getYamlFile('config.yaml');

const logger = console
const options = { config, logger }

const getEmailIdFromToken = function(accessToken) {
  return (jwtDecode(accessToken)['email']);
};

async function createStratoUser(accessToken, userIdOptional = null) {
  // let address = null;
  // try {
  //   // const getKeyResponse = await rest.createOrGetKey(accessToken, options);
    
  //   console.log("-------------- ", address)
  //   // TODO:  remove unused code
  //   // if (getKeyResponse) {
  //   // } else {
  //   //   return { status: 404, message: 'user address not found' };
  //   // }
  // } catch (getKeyErr) {
  //   if (getKeyErr.status == 400) {
  //     try {
  //       const createKeyResponse = await rest.createKey(accessToken);
  //       address = createKeyResponse.address;
  //       const userId = userIdOptional || getEmailIdFromToken(accessToken);
  //       await rest.fill({ name: userId, address });
  //       if ((await rest.getBalance(address)) < 1) {
  //         do {
  //           await new Promise(resolve => setTimeout(resolve, 1000));
  //         } while ((await rest.getBalance(address)) < 1);
  //       }
  //     } catch (createKeyErr) {
  //       return { status: createKeyErr.status, message: 'error creating user key or faucet account' };
  //     }
  //   } else {
  //     return { status: getKeyErr.status, message: `error getting user key; server returned error: ${getKeyErr}` };
  //   }
  // }

  let user = await rest.createUser(accessToken, options);
  return { status: 200, message: 'success', user: user };
};

export default {
  getEmailIdFromToken,
  createStratoUser
}
