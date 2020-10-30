'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // eslint-disable-next-line no-unused-vars
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.describeTable('membership_types')
          .then(async (tableDefinition) => {
            const getGoldMembershipTypeSQL = 'SELECT * FROM membership_types WHERE name =\'Gold\'';
            const [membershipTypes] = await queryInterface.sequelize.query(getGoldMembershipTypeSQL, {}, {});
            const membershipTypeId = membershipTypes[0].id;

            console.log('membershipTypeId',membershipTypeId);
            // const updateGoldMembershipType = `
            //   UPDATE membership_types SET type='Free' WHERE id='${membershipTypeId}'
            // `;
            // await queryInterface.sequelize.query(updateGoldMembershipType, {}, {});

            const getMembershipPolicies = 'SELECT * FROM policies WHERE type = \'MEMBERSHIP\' ';
            const [policies] = await queryInterface.sequelize.query(getMembershipPolicies, {}, {});
            for (const item of policies) {
              item.membership_rate[membershipTypeId] = 20;
              await queryInterface.sequelize.query(`UPDATE policies SET membership_rate = '${JSON.stringify(item.membership_rate)}' WHERE type = 'MEMBERSHIP' AND id = '${item.id}' `, {}, {});
            }

            const updateAffiliatePolicyForMembershipSystemSql = 'UPDATE policies SET is_membership_system=true WHERE id=4';
            await queryInterface.sequelize.query(updateAffiliatePolicyForMembershipSystemSql, {}, {});

            return Promise.resolve();
          })
      ]);
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {

  }
};
