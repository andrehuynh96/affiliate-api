'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('claim_rewards')
          .then(async (tableDefinition) => {
            if (tableDefinition['network_fee']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('claim_rewards', 'network_fee', {
              type: Sequelize.DataTypes.DECIMAL,
              allowNull: true,
              default: 0,
            });

            const sql = 'UPDATE public.claim_rewards SET network_fee=0 WHERE network_fee is null;';
            await queryInterface.sequelize.query(sql, {}, {});

            return Promise.resolve();
          })
      ]);
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('claim_rewards', 'network_fee', { transaction: t }),
      ]);
    });
  }
};


