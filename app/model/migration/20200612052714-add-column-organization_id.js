'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('policies')
          .then(async (tableDefinition) => {
            if (tableDefinition['organization_id']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('policies', 'organization_id', {
              type: Sequelize.DataTypes.UUID,
              allowNull: true,
            });

            const sql = 'UPDATE public.policies SET organization_id=\'69366383-b9c2-497c-1111-391b017772ba\' where organization_id is null;';
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
        queryInterface.removeColumn('policies', 'organization_id', { transaction: t }),
      ]);
    });
  }
};
