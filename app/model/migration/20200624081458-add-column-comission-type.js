'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('rewards')
          .then(async (tableDefinition) => {
            if (tableDefinition['commisson_type']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('rewards', 'commisson_type', {
              type: Sequelize.DataTypes.STRING(50),
              allowNull: true,
              default: '',
            });

            const sql = 'UPDATE public.rewards SET commisson_type=\'\' where commisson_type is null;';
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
        queryInterface.removeColumn('rewards', 'commisson_type', { transaction: t }),
      ]);
    });
  }
};


