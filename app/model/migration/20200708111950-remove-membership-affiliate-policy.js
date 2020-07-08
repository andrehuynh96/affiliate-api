'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('clients')
          .then(async (tableDefinition) => {
            const sql = `
                DELETE FROM public.default_policies WHERE policy_id= (SELECT id FROM public.policies where "type" ='MEMBERSHIP_AFFILIATE');
                DELETE FROM public.policies where "type" ='MEMBERSHIP_AFFILIATE';
            `;
            await queryInterface.sequelize.query(sql, {}, {});

            return Promise.resolve();
          })
      ]);
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {

  }
};


