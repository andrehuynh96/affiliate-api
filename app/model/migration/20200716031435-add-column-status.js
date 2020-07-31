'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('rewards')
          .then(async (tableDefinition) => {
            if (tableDefinition['status']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('rewards', 'status', {
              type: Sequelize.DataTypes.STRING(50),
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
        queryInterface.removeColumn('rewards', 'status', { transaction: t }),
      ]);
    });
  }
};


