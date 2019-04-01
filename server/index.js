import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { baseUrl, deployParamName } from './helpers/constants';
const routes = require('./api/v1/routes');
const authHandler = require('./api/middleware/authHandler');
const expressWinston = require('express-winston');
const winston = require('winston');
const cors = require('cors');
const errorHandler = require('./api/middleware/errorHandler');

import { common } from 'blockapps-rest';
const { config, fsutil } = common;

const app = express();

const deploy = fsutil.yamlSafeLoadSync(config.deployFilename);
if (!deploy) throw new Error('Deploy config.deployFilename not found ', config.deployFilename);
app.set(deployParamName, deploy);

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
app.use(`${baseUrl}`, routes);

app.use(errorHandler)

const port = process.env.PORT || 3030;

const server = app.listen(port, () => console.log(`Listening on ${port}`));

module.exports = server;
