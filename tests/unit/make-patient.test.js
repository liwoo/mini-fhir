const config = require('config');
const { makePatients } = require('../../factories');
const { Patient } = require('../../models/Patient');
const mongoose = require('mongoose');
const { logger } = require('../../config/logging');

describe('Make Patient Factory', () => {
  beforeEach(async () => {
    await mongoose
      .connect(config.get('mongo_url'))
      .then(() => logger.info('MongoDB Connects \u{1F4BB}'))
      .catch(() => logger.error('Mongo Could not Connect \u{1F613}'));
  });

  afterEach(async () => {
    await Patient.remove();
    await mongoose.disconnect();
  });

  it('allows user to create fake Patients', async () => {
    const patients = await makePatients(2);
    expect(patients.insertedCount).toBe(2);
  });
});
