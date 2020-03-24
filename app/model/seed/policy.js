const Model = require('app/model').policies;
const MembershipType = require('app/model').membership_types;
const PolicyType = require('app/model/value-object/policy-type');

module.exports = async () => {
  const count = await Model.count();

  if (count === 0) {
    await Model.bulkCreate([
      {
        id: 1,
        name: 'AffiliateSystem - Membership Policy',
        max_levels: 4,
        type: PolicyType.MEMBERSHIP,
      },
      {
        id: 2,
        name: 'AffiliateSystem - Membership Affiliate Policy',
        max_levels: 4,
        rates: [10, 8, 6, 4, 2],
        type: PolicyType.MEMBERSHIP_AFFILIATE,
      },
      {
        id: 3,
        name: 'AffiliateSystem - Affiliate Policy',
        max_levels: null,
        rates: [50, 35, 10, 5],
        type: PolicyType.AFFILIATE,
      },
      {
        id: 4,
        name: 'MembershipSystem - Affiliate Policy',
        max_levels: 4,
        rates: [50, 30, 15, 5],
        type: PolicyType.AFFILIATE,
      },
    ], {
      returning: true
    });

    // Create Membership types
    await MembershipType.bulkCreate([
      {
        id: 1,
        name: 'Silver',
        rate: 2,
        policy_id: 1,
      },
      {
        id: 2,
        name: 'Gold',
        rate: 5,
        policy_id: 1,
      },
      {
        id: 3,
        name: 'Diamond',
        rate: 10,
        policy_id: 1,
      },
    ], {
      returning: true
    });

  }
};
