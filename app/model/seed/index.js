const config = require('app/config');

const seedData = async () => {
  if (config.db.enableSeed) {
    try {
      await require('./organization')();
      await require('./policy')();
      await require('./affiliate-type')();
      await require('./app')();

      console.log('Seed data completed.');
    }
    catch (err) {
      console.log(err);
    }
  }
};

seedData();
