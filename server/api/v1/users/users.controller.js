import { rest } from 'blockapps-rest';

import dappJs from '../../../dapp/dapp/dapp';

class userController {

  static async me(req, res, next) {
    const { app, accessToken, decodedToken } = req;
    const token = { token: accessToken };

    const deploy = app.get('deploy');
    const username = decodedToken['email'];

    try {
      const dapp = await dappJs.bind(token, deploy.contract);
      const user = await dapp.getUser(username);
      rest.response.status200(res, user);
    } catch (e) {
      next(e)
    }
  }

  static async createUser(req, res, next) {
    const { app, accessToken, body } = req;
    const args = { ...body };
    const token = { token: accessToken };

    const deploy = app.get('deploy');

    try {
      const dapp = await dappJs.bind(token, deploy.contract);
      const asset = await dapp.createUser(args);
      rest.response.status200(res, asset);
    } catch (e) {
      next(e)
    }
  }
}

export default userController;