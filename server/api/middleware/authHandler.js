const { common } = require('blockapps-rest');
const { oauth, util, config } = common;
const jwtDecode = require('jwt-decode');

const authHandler = {
  authorizeRequest: (req, res, next) => {
    return async(req, res, next) => {
      const accessTokenFromCookie = req.cookies[req.app.oauth.getCookieNameAccessToken()];
      if (!accessTokenFromCookie) {
        return util.response.status('401', res, {loginUrl: req.app.oauth.oauthGetSigninURL()});
      }
      try  {
        await req.app.oauth.validateAndGetNewToken(req, res);
      } catch(err) {
        return util.response.status('401', res, { loginUrl: req.app.oauth.getLogOutUrl() });
      }
      req.accessToken = accessTokenFromCookie;
      req.decodedToken = jwtDecode(accessTokenFromCookie);
      return next();
    }
  },

  init: (app) => {
    try {
      app.oauth = oauth.init(config.oauth)
    }
    catch(err) {
      console.error('Error initializing oauth handlers');
      process.exit(1);
    }
  }
}

module.exports = authHandler;