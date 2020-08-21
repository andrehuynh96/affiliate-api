'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('affiliate_codes')
          .then(async (tableDefinition) => {
            if (tableDefinition['max_references']) {
              return Promise.resolve();
            }

            await queryInterface.addColumn('affiliate_codes', 'max_references', {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              default: 0,
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
        queryInterface.removeColumn('affiliate_codes', 'max_references', { transaction: t }),
      ]);
    });
  }
};


