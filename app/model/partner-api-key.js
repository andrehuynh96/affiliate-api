const ApiKeyStatus = require("./value-object/api-key-status");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("partner_api_keys", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4(),
    },
    partner_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    api_key: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    secret_key: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: ApiKeyStatus.NOT_CONNECT
    },
    actived_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0
    },
  }, {
      underscored: true,
      timestamps: true,
    });
} 