const PolicyType = require('../../model/value-object/policy-type');
const BasePolicy = require('./base-policy');

class MembershipPolicy extends BasePolicy {

  constructor(data) {
    super(data);

    if (data) {
      Object.assign(this, data);
    }

    this.type = PolicyType.MEMBERSHIP;
    this.max_levels = this.max_levels || 0;
    this.membership_rate = this.membership_rate || {};
  }

}

module.exports = MembershipPolicy;
