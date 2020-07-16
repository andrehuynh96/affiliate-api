'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('claim_rewards')
          .then(async (tableDefinition) => {
            if (tableDefinition['latest_id']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('claim_rewards', 'latest_id', {
              type: Sequelize.DataTypes.BIGINT,
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
        queryInterface.removeColumn('claim_rewards', 'latest_id', { transaction: t }),
      ]);
    });
  }
};


