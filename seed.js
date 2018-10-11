const config = require('config');
const readline = require('readline');
const mongoose = require('mongoose');
const { makeObservations, makePatients } = require('./factories');
const { logger } = require('./config/logging');

const seed = async () => {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('How many Observations would you like to seed:  ', async (answer) => {
      await mongoose.connect(config.get('mongo_url'));

      logger.info(`Beginning populating ${answer} Fake Observations...`);
      await makePatients(Math.ceil(Number(answer) / 5));
      await makeObservations(Number(answer))
        .then(() => {
          logger.info('Done Populating Fake Observations!');
          mongoose.disconnect();
        })
        .catch(() => logger.error('Whoops, something bad happened'));
      rl.close();
    });
  } catch (error) {
    logger.error('Could not connect to MongoDB at this moment... \u{1F613}');
  }
};

seed();
