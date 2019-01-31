const jwtDecode = require('jwt-decode');

const { rest6: rest, common } = require('blockapps-rest');
const { config } = common;


const getUserIdFromToken = function (accessToken) {
  const token = (typeof accessToken === 'string') ? jwtDecode(accessToken) : accessToken;
  return config.oauth.userIdProperty ? token[config.oauth.userIdProperty] : (token.email || token.Email);
};

const createAccount = function* (accessToken, userIdOptional = null) {
  let address = null;
  let userId = userIdOptional;

  try {
    const getKeyResponse = yield rest.getKey(accessToken);
    if (!getKeyResponse || !getKeyResponse.address) return { status: 404, message: 'user address not found' };

    address = getKeyResponse.address;
    userId = getUserIdFromToken(accessToken);
  } catch (err) {
    if (err.status != 400) return { status: err.status, message: `error getting user key. Server returned ${err}` };
    
    try {
      const createKeyResponse = yield rest.createKey(accessToken);
      address = createKeyResponse.address;

      userId = userIdOptional || getUserIdFromToken(accessToken);
      yield rest.fill({ name: userId, address });

      if ((yield rest.getBalance(address)) < 1) {
        do {
          yield new Promise(resolve => setTimeout(resolve, 1000));
        } while ((yield rest.getBalance(address)) < 1);
      }
    } catch (error) {
      return {
        status: error.status,
        message: `error creating user key or faucet account. Server returned ${err}`,
      };
    }
  }

  return { status: 200, message: 'success', address, address, userId };
};


module.exports = {
  createAccount,
  getUserIdFromToken,
};
