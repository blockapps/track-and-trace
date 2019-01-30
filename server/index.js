const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { baseUrl } = require('./api/helpers/constants');
const routes = require('./api/v1/routes');
const authHandler = require('./api/middleware/authHandler');
const expressWinston = require('express-winston');
const winston = require('winston');
const cors = require('cors');
const errorHandler = require('./api/middleware/errorHandler');

const app = express();

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