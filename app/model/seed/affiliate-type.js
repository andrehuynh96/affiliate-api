const Model = require('app/model').affiliate_types;

module.exports = async () => {
  const count = await Model.count();

  if (count === 0) {
    await Model.bulkCreate([
      {
        id: 100,
        name: 'Membership',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
        default_policy_id: 1000,
      },
      {
        id: 101,
        name: 'Affiliate',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
        default_policy_id: 1001,
      },
    ], {
      returning: true
    });
  }
};
