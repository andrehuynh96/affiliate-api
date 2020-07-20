'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('rewards')
          .then(async (tableDefinition) => {
            if (tableDefinition['membership_order_id']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('rewards', 'membership_order_id', {
              type: Sequelize.DataTypes.STRING(50),
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
        queryInterface.removeColumn('rewards', 'membership_order_id', { transaction: t }),
      ]);
    });
  }
};


