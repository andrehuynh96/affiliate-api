'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('clients')
          .then(async (tableDefinition) => {
            if (tableDefinition['membership_type_id']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('clients', 'membership_type_id', {
              type: Sequelize.DataTypes.STRING(50),
              allowNull: true,
            }, { transaction: t });

            await queryInterface.removeColumn('clients', 'membership_type', { transaction: t });

            return Promise.resolve();
          })
      ]);
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('clients', 'membership_type_id', { transaction: t }),
      ]);
    });
  }
};
