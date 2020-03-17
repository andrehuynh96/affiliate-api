const config = require('app/config');

const seedData = async () => {
  if (config.db.enableSeed) {
    try {
      await require('./organization')();
      await require('./affiliate-type')();
      await require('./app')();
      await require('./policy')();

      console.log('Seed data completed.');
    }
    catch (err) {
      console.log(err);
    }
  }
};

seedData();
