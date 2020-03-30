const Model = require('app/model').affiliate_types;

module.exports = async () => {
  const count = await Model.count();

  if (count === 0) {
    await Model.bulkCreate([
      {
        // id: 1,
        name: 'Membership System',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
      },
      {
        // id: 2,
        name: 'Affiliate System',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
        DefaultPolicies: [
          { policy_id: 1 },
          { policy_id: 2 },
          { policy_id: 3 }
        ]
      },
    ], {
      returning: true
    });
  }
};
