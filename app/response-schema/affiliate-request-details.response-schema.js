const objectMapper = require('object-mapper');

const destObject = {
  array: {
    '[].id': '[].id',
    '[].client_affiliate_id': '[].client_affiliate_id',
    '[].extClientId': '[].ext_client_id',
    '[].status': '[].status',
    '[].amount': '[].amount',
    '[].currency_symbol': '[].currency_symbol',
    '[].createdAt': '[].created_at',
    '[].updatedAt': '[].updated_at',
    '[].created_by': '[].created_by',
    '[].updated_by': '[].updated_by'
  },
  single: {
    id: 'id',
    client_affiliate_id: 'client_affiliate_id',
    extClientId: 'ext_client_id',
    status: 'status',
    amount: 'amount',
    currency_symbol: 'currency_symbol',
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
