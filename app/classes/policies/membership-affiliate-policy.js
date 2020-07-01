const PolicyType = require('../../model/value-object/policy-type');
const BasePolicy = require('./base-policy');

class MembershipAffiliatePolicy extends BasePolicy {

  constructor(data) {
    super(data);

    if (data) {
      Object.assign(this, data);
    }

    this.type = PolicyType.MEMBERSHIP_AFFILIATE;
    this.rates = this.rates || [];
    this.membership_rate = this.membership_rates.reduce((result, item) => {
      result[item.membership_type_id] = item.rate;

      return result;
    }, {});
  }

}

module.exports = MembershipAffiliatePolicy;
