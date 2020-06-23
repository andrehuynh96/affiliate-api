const objectMapper = require('object-mapper');

const destObject = {
  array: {
    '[].id': '[].id',
    '[].status': '[].status',
    '[].currency_symbol': '[].currency_symbol',
    '[].from_date': '[].from_date',
    '[].to_date': '[].to_date',
    '[].affiliateType': '[].affiliate_type',
    '[].createdAt': '[].created_at',
    '[].updatedAt': '[].updated_at',
    '[].created_by': '[].created_by',
    '[].updated_by': '[].updated_by'
  },
  single: {
    id: 'id',
    status: 'status',
    currency_symbol: 'currency_symbol',
    from_date: 'from_date',
    to_date: 'to_date',
    affiliateType: 'affiliate_type',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    created_by: 'created_by',
    updated_by: 'updated_by'
  }
};

module.exports = srcObject => {
  if (Array.isArray(srcObject)) {
    if (!srcObject || srcObject.length == 0) {
      return srcObject;
    } else {
      return objectMapper(srcObject, destObject.array);
    }
  } else {
    return objectMapper(srcObject, destObject.single);
  }
};
