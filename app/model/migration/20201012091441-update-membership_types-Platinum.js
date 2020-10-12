'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // eslint-disable-next-line no-unused-vars
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('membership_types')
          .then(async (tableDefinition) => {
            const updatePriceSQL = `UPDATE membership_types SET (price,is_enabled) = (100,true) WHERE name= 'Platinum';
            UPDATE membership_types Set (price,type) = (0,'Free') Where name= 'Gold'`;
            await queryInterface.sequelize.query(updatePriceSQL, {}, {});

            const getPlatinumSQL = `SELECT id FROM membership_types WHERE name ='Platinum'`;
            const [ platinums] = await queryInterface.sequelize.query(getPlatinumSQL, {}, {});
            const membership_type_id = platinums[0].id;

            const getMembershipPolicies = `SELECT * FROM policies WHERE type = 'MEMBERSHIP' `;
            const [ policies ] = await queryInterface.sequelize.query(getMembershipPolicies, {}, {});
            for (const item of policies) {
              item.membership_rate[membership_type_id] = 15;
              await queryInterface.sequelize.query(`UPDATE policies SET membership_rate = '${JSON.stringify(item.membership_rate)}' WHERE type = 'MEMBERSHIP' AND id = '${item.id}' `, {}, {});
            }
            // throw new Error('Abc');
            return Promise.resolve();
          })
      ]);
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {

  }
};
