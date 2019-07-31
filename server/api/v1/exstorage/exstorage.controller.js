import dappJs from '../../../dapp/dapp/dapp';
import {rest} from "blockapps-rest";
import BidsController from "../bids/bids.controller";


class ExstorageController {

    static async upload(req, res, next) {
        const { app, accessToken, body } = req;
        console.log('exstorage.controller: upload', 'body', body );
        const args = { filename: body.filename};
        console.log('exstorage.controller: upload', 'args', args );


        try {
            const deploy = app.get('deploy');
            const dapp = await dappJs.bind(accessToken, deploy.contract);
            const exstorageDesc = await dapp.uploadFile(args);
            console.log('exstorage.controller: upload', 'exstorageDesc', exstorageDesc );
            rest.response.status200(res, exstorageDesc);
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
