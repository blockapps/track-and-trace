import dappJs from '../../../dapp/dapp/dapp';
import {rest} from "blockapps-rest";
import BidsController from "../bids/bids.controller";
import formidable from 'formidable';

class ExstorageController {

    static async upload(req, res, next) {

        const { app, accessToken, body } = req;
        console.log('exstorage.controller: upload', 'body', body);
        const args = {...body.file };
        console.log('exstorage.controller: upload', 'args', args );

        const parse = async (req) => {
            return new Promise((resolve, reject) => {
                const parsedForm = {}
                new formidable.IncomingForm().parse(req)
                    .on('fileBegin', (name, file) => {
                        file.path = '/tmp/uploads/' + file.name
                        parsedForm.content = file.path
                        parsedForm.type = file.type
                    })
                    .on('file', (name, file) => {
                        console.log('Uploaded file', name, file)
                    })
                    .on('field', (name,value) => {
                        console.log('meta from exstorage.controller@@@@@@@@@@', name, value);
                        if(name == 'metadata') {
                            parsedForm.metadata = value
                        } else {
                            console.log('Unexpected: ', name, value)
                        }
                    })
                    .on('end', () => {
                        resolve(parsedForm)
                    })
                    .on('error', (err) => {
                        throw err
                    })
                    .on('aborted', () => {
                        throw new Error('Upload Error')
                    });



            })
        }

        try {
            const args = await parse(req)
            const deploy = app.get('deploy');
            const dapp = await dappJs.bind(accessToken, deploy.contract);
            const exstorageDesc = await dapp.uploadFile(args);
            console.log('exstorage.controller: upload', 'exstorageDesc', exstorageDesc );
            rest.response.status200(res, exstorageDesc);
        } catch (e) {
            next(e)
        }

    }



    static async uploadBackup(req, res, next) {
        new formidable.IncomingForm().parse(req)
            .on('fileBegin', (name, file) => {
                file.path = '/tmp/uploads/' + file.name
            })
            .on('file', (name, file) => {
                console.log('Uploaded file', name, file)
            })
            .on('field', (name,value) => {
                console.log('meta from exstorage.controller@@@@@@@@@@', name, value);
            })

        const { app, accessToken, body } = req;
        console.log('exstorage.controller: upload', 'body', body);
        const args = {...body.file };
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

    static async download(req, res, next) {
        const { app, accessToken, body, params} = req;
        const { contractAddress } = params;
        const args = { contractAddress };

        try {
            const deploy = app.get('deploy');
            const dapp = await dappJs.bind(accessToken, deploy.contract);
            const exstorageDesc = await dapp.downloadFile(args);
            rest.response.status200(res, exstorageDesc);
        } catch (e) {
            next(e)
        }
    }

    static async verify(req, res, next) {
        const { app, accessToken, body } = req;
        const args = { filename: body.filename};

        try {
            const deploy = app.get('deploy');
            const dapp = await dappJs.bind(accessToken, deploy.contract);
            const exstorageDesc = await dapp.verifyFile(args);
            rest.response.status200(res, exstorageDesc);
        } catch (e) {
            next(e)
        }
    }
}
export default ExstorageController;
