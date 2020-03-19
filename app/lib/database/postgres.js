const config = require('app/config');
const Sequelize = require('sequelize');

const postpresOptions = config.db.postpres;
const options = Object.assign({}, postpresOptions.options, {
  logging: postpresOptions.options.logging ? console.log : false,
});

const sequelize = new Sequelize(
  postpresOptions.database,
  postpresOptions.username,
  postpresOptions.password,
  options,
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
