import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import constants from './helpers/constants';
import routes from './api/v1/routes';
import authHandler from './api/middleware/authHandler';
import expressWinston from 'express-winston';
import winston from 'winston';
import cors from 'cors';
import errorHandler from './api/middleware/errorHandler';

import { fsUtil } from 'blockapps-rest';

import config from './load.config';

const app = express();

const deploy = fsUtil.getYaml(config.deployFilename);
if (!deploy) throw new Error('Deploy config.deployFilename not found ', config.deployFilename);
app.set(constants.deployParamName, deploy);

// remove x-powerd-by header
app.disable('x-powered-by');

// setup middleware
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// TODO; more robust logging framework
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console()
    ],
    meta: true,
    expressFormat: true
  })
);
// Initialize app oauth
authHandler.init(app);

// setup routes
app.use(`${constants.baseUrl}`, routes);

app.use(errorHandler)

const port = process.env.PORT || 3030;

const server = app.listen(port, () => console.log(`Listening on ${port}`));

export default server;
