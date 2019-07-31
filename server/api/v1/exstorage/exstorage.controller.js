import dappJs from '../../../dapp/dapp/dapp';
import {rest} from "blockapps-rest";
import BidsController from "../bids/bids.controller";


class ExstorageController {

    static async upload(req, res, next) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        const { app, accessToken, body } = req;
        const args = { ...body.asset };

        try {
            const deploy = app.get('deploy');
            const dapp = await dappJs.bind(accessToken, deploy.contract);
            const file = await dapp.uploadFile(args);
            rest.response.status200(res, file);
        } catch (e) {
            next(e)
        }
    }

    static async getAll(req, res, next) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            rest.response.status200(res, {});
    }
}
export default ExstorageController;
