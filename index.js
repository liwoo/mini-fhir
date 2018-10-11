const config = require('config');
const express = require('express');
require('express-async-errors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const observationRoutes = require('./routes/observation');
const { logger } = require('./config/logging');
const err = require('./middleware/error');

mongoose
  .connect(config.get('mongo_url'))
  .then(() => logger.info('MongoDB Connects \u{1F4BB}'))
  .catch(() => logger.error('Mongo Could not Connect \u{1F613}'));

const app = express();

app.use(bodyParser.json());
app.use('/fhir/Observation', observationRoutes);
app.use('/', (req, res) => res.send({
  availableEnpoints: {
    get: ['/fhir/Observation'],
    post: ['/fhir/Observation'],
  },
}));
app.use(err);

const server = app.listen(4000, () => logger.info('Listening on Port 4000'));

module.exports = server;
