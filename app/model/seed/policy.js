const Model = require('app/model').policies;
const MembershipType = require('app/model').membership_types;
const PolicyType = require('app/model/value-object/policy-type');
const {
  MembershipPolicy,
  MembershipAffiliatePolicy,
  AffiliatePolicy
} = require('app/classes/policies');

module.exports = async () => {
  const count = await Model.count();

  if (!count) {
    const models = [];

    models.push(new MembershipPolicy({
      id: 1,
      name: 'AffiliateSystem - Membership Policy',
      proportion_share: 10,
      max_levels: 4,
      membership_rate: {
        'SILVER': 2,
        'GOLD': 5,
        'DIAMIAD': 10,
      }
    }));

    models.push(new MembershipAffiliatePolicy({
      id: 2,
      name: 'AffiliateSystem - Membership Affiliate Policy',
      proportion_share: 20,
      max_levels: 4,
      rates: [10, 8, 6, 4, 2],
    }));

    models.push(new AffiliatePolicy({
      id: 3,
      name: 'AffiliateSystem - Affiliate Policy',
      max_levels: null,
      proportion_share: 20,
      rates: [10, 8, 6, 4, 2],
    }));

    models.push(new AffiliatePolicy({
      id: 4,
      name: 'MembershipSystem - Affiliate Policy',
      max_levels: 5,
      rates: [50, 30, 15, 5],
      proportion_share: 20,
    }));

    await Model.bulkCreate(models, {
      returning: true
    });



  }
};
