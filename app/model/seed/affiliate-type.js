const Model = require('app/model').affiliate_types;
const AffiliateCategory = require('app/model/value-object/affiliate-category');

module.exports = async () => {
  const count = await Model.count();

  if (count === 0) {
    await Model.bulkCreate([
      {
        id: 1,
        name: 'Membership System',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
        category: AffiliateCategory.MembershipSystem,
      },
      {
        id: 2,
        name: 'Affiliate System',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
        category: AffiliateCategory.AffiliateSystem,
      },
    ], {
      returning: true
    });
  }
};
