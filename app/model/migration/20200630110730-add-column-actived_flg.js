'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('clients')
          .then(async (tableDefinition) => {
            if (tableDefinition['actived_flg']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('clients', 'actived_flg', {
              type: Sequelize.DataTypes.BOOLEAN,
              allowNull: true,
              default: true,
            });

            const sql = 'UPDATE public.clients SET actived_flg=true where actived_flg is null;';
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
        queryInterface.removeColumn('clients', 'actived_flg', { transaction: t }),
      ]);
    });
  }
};


