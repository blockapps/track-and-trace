import jwtDecode from "jwt-decode";
import { rest } from "blockapps-rest";
import config from "../../../load.config";
import AuthHandler from "../../middleware/authHandler";

class AuthenticationController {
  static async callback(req, res, next) {
    const code = req.query["code"];
    const tokensResponse = await req.app.oauth.getAccessTokenByAuthCode(code);

    const accessToken = tokensResponse.token["access_token"];
    const refreshToken = tokensResponse.token["refresh_token"];

    const decodedToken = jwtDecode(accessToken);

    const accessTokenExpiration = decodedToken["exp"];

    res.cookie(req.app.oauth.getCookieNameAccessToken(), accessToken, {
      maxAge: config.nodes[0]["oauth"]["appTokenCookieMaxAge"],
      httpOnly: true,
    });
    res.cookie(
      req.app.oauth.getCookieNameAccessTokenExpiry(),
      accessTokenExpiration,
      {
        maxAge: config.nodes[0]["oauth"]["appTokenCookieMaxAge"],
        httpOnly: true,
      }
    );
    res.cookie(req.app.oauth.getCookieNameRefreshToken(), refreshToken, {
      maxAge: config.nodes[0]["oauth"]["appTokenCookieMaxAge"],
      httpOnly: true,
    });
    res.redirect("/");
  }

  static async logout(req, res) {
    const oauthSignOutUrl = req.app.oauth.getLogOutUrl();
    AuthHandler.clearAuthCookies(req, res);
    rest.response.status200(res, { logoutUrl: oauthSignOutUrl });
  }
}

export default AuthenticationController;
