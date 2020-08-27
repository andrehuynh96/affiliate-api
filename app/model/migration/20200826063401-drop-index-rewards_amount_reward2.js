'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('rewards')
          .then(async (tableDefinition) => {
            await queryInterface.removeIndex('rewards', 'rewards_amount_reward', { transaction: t });
            await queryInterface.removeIndex('rewards', 'rewards_amount_reward2', { transaction: t });
            await queryInterface.removeIndex('rewards', 'rewards_reward_client_per_policy_key', { transaction: t });

            return Promise.resolve();
          })
      ]);
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};


