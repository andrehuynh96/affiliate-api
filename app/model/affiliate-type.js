
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
    default_policy_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  AffiliateType.associate = (models) => {
    AffiliateType.belongsTo(models.organizations);
    AffiliateType.belongsTo(models.policies, {
      as: 'policy',
      foreignKey: 'default_policy_id',
    });
  };

  return AffiliateType;
};
