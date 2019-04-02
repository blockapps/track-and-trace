import { rest } from 'blockapps-rest';

import dappJs from '../../../dapp/dapp/dapp';

const userController = {
  me: async (req, res, next) => {
    const { app, accessToken, decodedToken } = req;
    const token = { token: accessToken };

    const deploy = app.get('deploy');
    const username = decodedToken['email'];

    const dapp = await dappJs.bind(token, deploy.contract);
    const user = await dapp.getUser(username);
    rest.response.status200(res, user);
  },
  createUser: async (req, res, next) => {
    const { app, accessToken, body } = req;
    const args = { ...body };
    const token = { token: accessToken };

    const deploy = app.get('deploy');

    const dapp = yield dappJs.bind(token, deploy.contract);
    const asset = yield dapp.createUser(args);
    rest.response.status200(res, asset);
  },
}

module.exports = userController;