const config = require('config');
const { makeObservations } = require('../../factories');
const { Observation } = require('../../models/Observation');
const mongoose = require('mongoose');
const { logger } = require('../../config/logging');

describe('Make Observations Factory', () => {
  beforeEach(async () => {
    await mongoose
      .connect(config.get('mongo_url'))
      .then(() => logger.info('MongoDB Connects \u{1F4BB}'))
      .catch(() => logger.emerg('Mongo Could not Connect \u{1F613}'));
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
