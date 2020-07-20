require('dotenv').config();

module.exports = {
  username: process.env.POSTPRES_DB_USER,
  password: process.env.POSTPRES_DB_PASS,
  database: process.env.POSTPRES_DB_NAME,
  host: process.env.POSTPRES_DB_HOST,
  port: process.env.POSTPRES_DB_PORT,
  dialect: 'postgres',
  operatorsAliases: 0,
  define: {
    underscored: true,
    underscoredAll: true
  }
};
