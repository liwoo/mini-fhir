const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const observationRoutes = require('./routes/observation');
const logger = require('./config/logging');

mongoose.connect('mongodb://localhost/mini-fhir-test')
  .then(() => logger.info('MongoDB Connects'))
  .catch(() => logger.emerg('Mongo Could not Connect'));


const app = express();

app.use(bodyParser.json());
app.use('/fhir/Observation', observationRoutes);

const server = app.listen(4000, () => logger.info('Listening on Port 4000'));

module.exports = server;
