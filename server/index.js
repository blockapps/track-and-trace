const express = require('express');
const app = express();
const baseUrl = '/api/v1';
const package = require('./package.json');
const moment = require('moment');

// TODO: remove x-powerd-by header

app.get(`${baseUrl}`, (req, res) => {
  res.json({
    name: package.name,
    description: package.description,
    version: package.version,
    timestamp: moment().unix()
  })
})

const port = process.env.PORT || 3030;

app.listen(port, () => console.log(`Listening on ${port}`));