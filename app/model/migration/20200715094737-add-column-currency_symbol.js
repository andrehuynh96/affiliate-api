'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('policies')
          .then(async (tableDefinition) => {
            if (tableDefinition['currency_symbol']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('policies', 'currency_symbol', {
              type: Sequelize.DataTypes.STRING(100),
              allowNull: true,
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
        queryInterface.removeColumn('policies', 'currency_symbol', { transaction: t }),
      ]);
    });
  }
};


