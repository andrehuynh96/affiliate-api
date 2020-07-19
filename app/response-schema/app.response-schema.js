const objectMapper = require('object-mapper');

const destObject = {
  array: {
    '[].id': '[].id',
    '[].organization_id': '[].organization_id',
    '[].name': '[].name',
    '[].api_key': '[].api_key',
    '[].secret_key': '[].secret_key',
    '[].actived_flg': '[].actived_flg',
    '[].createdAt': '[].created_at',
    '[].updatedAt': '[].updated_at',
    '[].created_by': '[].created_by',
    '[].updated_by': '[].updated_by'
  },
  single: {
    id: 'id',
    name: 'name',
    organization_id: 'organization_id',
    api_key: 'api_key',
    secret_key: 'secret_key',
    actived_flg: 'actived_flg',
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
