const { makeObservations } = require('../../factories');
const { Observation } = require('../../models/Observation');
const mongoose = require('mongoose');
const logger = require('../../config/logging');

describe('Make Observations Factory', () => {
  beforeEach(async () => {
    await mongoose.connect('mongodb://localhost/mini-fhir-test')
      .then(() => logger.info('MongoDB Connects'))
      .catch(() => logger.emerg('Mongo Could not Connect'));
  });

  afterEach(async () => {
    await Observation.remove();
    await mongoose.disconnect();
  });

  it('allows user to create fake Observations', async () => {
    const observations = await makeObservations(2);
    expect(observations.insertedCount).toBe(2);
  });
});