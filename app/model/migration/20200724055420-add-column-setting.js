'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('rewards')
          .then(async (tableDefinition) => {
            if (tableDefinition['setting']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('rewards', 'setting', {
              type: Sequelize.DataTypes.JSON,
              allowNull: true,
              default: null
            });

            return Promise.resolve();
          })
      ]);
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('rewards', 'setting', { transaction: t }),
      ]);
    });
  }
};


