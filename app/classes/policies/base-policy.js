const PolicyType = require('../../model/value-object/policy-type');

class BasePolicy {

  constructor(data) {
    this.id = 0;
    this.name = '';
    this.description = '';
    this.type = PolicyType.UNKNOWN;
    this.max_levels = null;
    this.proportion_share = 0;
    this.deleted_flg = false;

    if (data) {
      Object.assign(this, data);
    }
  }

}

module.exports = BasePolicy;
