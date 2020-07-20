'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('rewards')
          .then(async (tableDefinition) => {
            if (tableDefinition['from_client_affiliate_id']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('rewards', 'from_client_affiliate_id', {
              type: Sequelize.DataTypes.BIGINT,
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
        queryInterface.removeColumn('rewards', 'from_client_affiliate_id', { transaction: t }),
      ]);
    });
  }
};


