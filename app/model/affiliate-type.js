
module.exports = (sequelize, DataTypes) => {
  const AffiliateType = sequelize.define('affiliate_types', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  AffiliateType.associate = (models) => {
    AffiliateType.belongsTo(models.organizations);

    AffiliateType.belongsToMany(models.policies, {
      as: 'DefaultPolicies',
      through: 'default_policies',
      foreignKey: 'affiliate_type_id',
    });

    // AffiliateType.hasMany(models.policies, {
    //   as: 'policies',
    //   // through: 'affiliate_type_details',
    //   // foreignKey: 'affiliate_type_id',
    // });
  };

  return AffiliateType;
};
