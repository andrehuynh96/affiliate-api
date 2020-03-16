const config = require('app/config');

if (config.enableSeed) {
  try {
    require('./organization');
    require('./affiliate-type');
    require('./app');
  }
  catch (err) {
    console.log(err);
  }
}
