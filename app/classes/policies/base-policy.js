const PolicyType = require('../../model/value-object/policy-type');

class BasePolicy {

  constructor(data) {
    this.id = null;
    this.name = '';
    this.description = '';
    this.currency_symbol = null;
    this.type = PolicyType.UNKNOWN;
    this.max_levels = null;
    this.proportion_share = 0;
    this.deleted_flg = false;
    this.is_membership_system = false;

    if (data) {
      Object.assign(this, data);
    }
  }

}

module.exports = BasePolicy;
