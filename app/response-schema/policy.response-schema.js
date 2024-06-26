const objectMapper = require('object-mapper');

const destObject = {
  array: {
    '[].id': '[].id',
    '[].name': '[].name',
    '[].description': '[].description',
    '[].type': '[].type',
    '[].currency_symbol': '[].currency_symbol?',
    '[].proportion_share': '[].proportion_share',
    '[].max_levels': '[].max_levels',
    '[].rates': '[].rates',
    '[].membership_rate': '[].membership_rate',
    '[].is_membership_system': '[].is_membership_system',
    '[].createdAt': '[].created_at',
    '[].updatedAt': '[].updated_at',
    '[].created_by': '[].created_by',
    '[].updated_by': '[].updated_by'
  },
  single: {
    id: 'id',
    name: 'name',
    description: 'description',
    type: 'type',
    currency_symbol: 'currency_symbol?',
    proportion_share: 'proportion_share',
    max_levels: '.max_levels',
    rates: 'rates',
    membership_rate: 'membership_rate',
    is_membership_system: 'is_membership_system',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    created_by: 'created_by',
    updated_by: 'updated_by'
  }
};

module.exports = srcObject => {
  if (Array.isArray(srcObject)) {
    if (!srcObject || srcObject.length == 0) {
      return [];
    } else {
      return objectMapper(srcObject, destObject.array);
    }
  } else {
    return objectMapper(srcObject, destObject.single);
  }
};
