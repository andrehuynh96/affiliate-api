const config = require('app/config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  config.db.postpres.database,
  config.db.postpres.username,
  config.db.postpres.password,
  config.db.postpres.options
);
module.exports = {
  init: async callback => {
    try { 
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      callback(null);
    } catch (err) {
      callback(err);
    }
  },
  instanse: sequelize
};
