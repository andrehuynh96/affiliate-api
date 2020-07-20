'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('policies')
          .then(async (tableDefinition) => {
            if (tableDefinition['is_membership_system']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('policies', 'is_membership_system', {
              type: Sequelize.DataTypes.BOOLEAN,
              allowNull: true,
              default: false,
            });

            const sql = 'UPDATE public.policies SET is_membership_system=true where id=4;';
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
        queryInterface.removeColumn('policies', 'is_membership_system', { transaction: t }),
      ]);
    });
  }
};
