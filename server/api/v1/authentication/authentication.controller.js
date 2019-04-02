import jwtDecode from 'jwt-decode';
import { rest } from 'blockapps-rest';

// TODO: refactor same code.
import { getYamlFile } from '../../../helpers/config';
const config = getYamlFile('config.yaml');

const authenticationController = {
  callback: async function (req, res, next) {
    const code = req.query['code'];
    console.log("---------------------------", code)
    const tokensResponse = await req.app.oauth.oauthGetAccessTokenByAuthCode(code);

    const accessToken = tokensResponse.token['access_token'];
    const refreshToken = tokensResponse.token['refresh_token'];

    const decodedToken = jwtDecode(accessToken);

    const accessTokenExpiration = decodedToken['exp'];

    res.cookie(req.app.oauth.getCookieNameAccessToken(), accessToken, {maxAge: config['oauth']['appTokenCookieMaxAge'], httpOnly: true});
    res.cookie(req.app.oauth.getCookieNameAccessTokenExpiry(), accessTokenExpiration, {maxAge: config['oauth']['appTokenCookieMaxAge'], httpOnly: true});
    res.cookie(req.app.oauth.getCookieNameRefreshToken(), refreshToken, {maxAge: config['oauth']['appTokenCookieMaxAge'], httpOnly: true});
    res.redirect('/');
  },

  logout: function (req, res) {
    const oauthSignOutUrl = req.app.oauth.getLogOutUrl();
    res.clearCookie(req.app.oauth.getCookieNameAccessToken());
    res.clearCookie(req.app.oauth.getCookieNameAccessTokenExpiry());
    res.clearCookie(req.app.oauth.getCookieNameRefreshToken());
    rest.response.status200(res, {logoutUrl: oauthSignOutUrl});
  }

};

module.exports = authenticationController;
