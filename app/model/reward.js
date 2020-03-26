module.exports = (sequelize, DataTypes) => {
  const Reward = sequelize.define('rewards', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    client_affiliate_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    affiliate_request_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    policy_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  Reward.associate = async (models) => {
    Reward.belongsTo(models.client_affiliates);
    Reward.belongsTo(models.affiliate_requests);
    Reward.belongsTo(models.policies);
  };

  return Reward;
};
