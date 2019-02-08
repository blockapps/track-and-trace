const jwtDecode = require('jwt-decode');
const ba = require('blockapps-rest');
const { rest6: rest } = ba;

const getEmailIdFromToken = function(accessToken) {
  return (jwtDecode(accessToken)['email']);
};

const createStratoUser = function* (accessToken, userIdOptional = null) {
  let address = null;
  try {
    const getKeyResponse = yield rest.getKey(accessToken);
    if (getKeyResponse && getKeyResponse.address) {
      address = getKeyResponse.address;
    } else {
      return { status: 404, message: 'user address not found' };
    }
  } catch (getKeyErr) {
    if (getKeyErr.status == 400) {
      try {
        const createKeyResponse = yield rest.createKey(accessToken);
        address = createKeyResponse.address;
        const userId = userIdOptional || getEmailIdFromToken(accessToken);
        yield rest.fill({ name: userId, address });
        if ((yield rest.getBalance(address)) < 1) {
          do {
            yield new Promise(resolve => setTimeout(resolve, 1000));
          } while ((yield rest.getBalance(address)) < 1);
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

module.exports = {
  getEmailIdFromToken,
  createStratoUser
}
