const objectMapper = require('object-mapper');

const destObject = {
  array: {
    '[].ext_client_id': '[].ext_client_id',
    '[].createdAt': '[].created_at',
    '[].updatedAt': '[].updated_at',
    '[].created_by': '[].created_by',
    '[].updated_by': '[].updated_by'
  },
  single: {
    ext_client_id: 'ext_client_id',
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
