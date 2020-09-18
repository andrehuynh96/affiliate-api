const objectMapper = require('object-mapper');

const destObject = {
  array: {
    '[].id': '[].id',
    '[].currency_symbol': '[].currency_symbol',
    '[].amount': '[].amount',
    '[].network_fee': '[].network_fee?',
    '[].status': '[].status',
    '[].latest_id': '[].latest_id?',
    '[].createdAt': '[].created_at',
    '[].updatedAt': '[].updated_at',
    '[].created_by': '[].created_by',
    '[].updated_by': '[].updated_by'
  },
  single: {
    id: 'id',
    currency_symbol: 'currency_symbol',
    amount: 'amount',
    network_fee: 'network_fee?',
    status: 'status',
    latest_id: 'latest_id?',
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
