module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('clients', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    affiliate_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referrer_client_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parentPath: {
      type: DataTypes.STRING(10000),
      allowNull: true,
    },
    root_client_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    actived_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  Client.associate = (models) => {
    // associations can be defined here
    Client.belongsTo(models.affiliate_types);
  };

  return Client;
};
