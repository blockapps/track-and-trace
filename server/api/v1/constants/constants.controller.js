import { rest } from 'blockapps-rest';
import constants from '../../../helpers/constants';

class ConstantsController {

  static async getConstants(req, res) {
    rest.response.status200(res, await constants.getConstants());
  }

}

export default ConstantsController;
