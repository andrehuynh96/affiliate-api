module.exports = (sequelize, DataTypes) => {
  const ClientAffiliate = sequelize.define('client_affiliates', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    client_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    affiliate_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referrer_client_affiliate_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parent_path: {
      type: DataTypes.STRING(10000),
      allowNull: true,
    },
    root_client_affiliate_id: {
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
    indexes: [
      {
        name: 'client_affiliate_key',
        unique: true,
        fields: ['client_id', 'affiliate_type_id']
      },
    ]
  });

  ClientAffiliate.associate = (models) => {
    ClientAffiliate.belongsTo(models.affiliate_types);
    ClientAffiliate.hasMany(models.affiliate_codes, {
      as: 'AffiliateCodes',
      foreignKey: 'client_affiliate_id',
      sourceKey: 'id',
    });

    ClientAffiliate.belongsToMany(models.policies, {
      as: 'ClientPolicies',
      through: 'client_policies',
      foreignKey: 'client_affiliate_id',
    });
  };

  return ClientAffiliate;
};
