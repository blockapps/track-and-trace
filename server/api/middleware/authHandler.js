import { rest, oauthUtil } from 'blockapps-rest';
import jwtDecode from 'jwt-decode';

// TODO: refactor same code.
import { getYamlFile } from '../../helpers/config';
const config = getYamlFile('config.yaml');

const authHandler = {
  authorizeRequest: (req, res, next) => {
    return async (req, res, next) => {
      const token = req.app.oauth.getCookieNameAccessToken();
      console.log("------------------------------------", token)
      const accessTokenFromCookie = req.cookies[token];
      console.log("-sdf-----------------------------------", accessTokenFromCookie)
      if (!accessTokenFromCookie) {
        return rest.response.status('401', res, { loginUrl: req.app.oauth.getSigninURL() });
      }
      try {
        await req.app.oauth.validateAndGetNewToken(req, res);
      } catch (err) {
        return rest.response.status('401', res, { loginUrl: req.app.oauth.getSigninURL() });
      }
      req.accessToken = accessTokenFromCookie;
      req.decodedToken = jwtDecode(accessTokenFromCookie);
      return next();
    }
  },

  init: (app) => {
    try {
      app.oauth = oauthUtil.init(config.oauth)
    }
    catch (err) {
      console.error('Error initializing oauth handlers');
      process.exit(1);
    }
  }
}

module.exports = authHandler;