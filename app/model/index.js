const database = require('app/lib/database');
const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const db = {};
const sequelize = database.instanse;

fs.readdirSync(__dirname)
  .filter(file => {
    return file !== basename && file.endsWith('.js');
  })
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
module.exports = db;
