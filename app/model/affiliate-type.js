
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
      type: DataTypes.STRING(64),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    default_policy_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

  }, {
    underscored: true,
    timestamps: true,
  });

  AffiliateType.associate = (models) => {
    // associations can be defined here
    AffiliateType.belongsTo(models.organizations);

    // AffiliateType.hasMany(models.user_roles, { foreignKey: 'user_id' })
  };

  return AffiliateType;
};
