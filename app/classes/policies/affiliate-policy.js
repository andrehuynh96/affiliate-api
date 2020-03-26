const PolicyType = require('../../model/value-object/policy-type');
const BasePolicy = require('./base-policy');

class AffiliatePolicy extends BasePolicy {

  constructor(data) {
    super(data);

    if (data) {
      Object.assign(this, data);
    }

    this.type = PolicyType.AFFILIATE;
    this.rates = this.rates || [];
  }

}

module.exports = AffiliatePolicy;
