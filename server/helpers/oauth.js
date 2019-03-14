const jwtDecode = require('jwt-decode');
const ba = require('blockapps-rest');
const { rest6: rest } = ba;

const getEmailIdFromToken = function(accessToken) {
  return (jwtDecode(accessToken)['email']);
};

async function createStratoUser(accessToken, userIdOptional = null) {
  let address = null;
  try {
    const getKeyResponse = rest.getKey(accessToken);
    console.log("-------------------------------", getKeyResponse)
    if (getKeyResponse && getKeyResponse.address) {
      address = getKeyResponse.address;
    } else {
      return { status: 404, message: 'user address not found' };
    }
  } catch (getKeyErr) {
    if (getKeyErr.status == 400) {
      try {
        const createKeyResponse = await rest.createKey(accessToken);
        address = createKeyResponse.address;
        const userId = userIdOptional || getEmailIdFromToken(accessToken);
        await rest.fill({ name: userId, address });
        if ((await rest.getBalance(address)) < 1) {
          do {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } while ((await rest.getBalance(address)) < 1);
        }
      } catch (createKeyErr) {
        return { status: createKeyErr.status, message: 'error creating user key or faucet account' };
      }
    } else {
      return { status: getKeyErr.status, message: `error getting user key; server returned error: ${getKeyErr}` };
    }
  }
  return { status: 200, message: 'success', address: address };
};

export default {
  getEmailIdFromToken,
  createStratoUser
}
