module.exports = (sequelize, DataTypes) => {
  const Policy = sequelize.define('policies', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    proportion_share: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_levels: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rates: {
      type: DataTypes.ARRAY(DataTypes.DECIMAL),
      allowNull: true,
    },
    membership_rate: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  Policy.associate = (models) => {
    Policy.belongsToMany(models.affiliate_types, {
      as: 'AffiliateTypes',
      through: 'default_policies',
      foreignKey: 'policy_id',
    });

    Policy.belongsToMany(models.client_affiliates, {
      as: 'ClientAffiliates',
      through: 'client_policies',
      foreignKey: 'policy_id',
    });
  };

  return Policy;
};
