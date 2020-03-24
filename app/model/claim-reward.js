module.exports = (sequelize, DataTypes) => {
  const ClaimReward = sequelize.define('claim_rewards', {
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
    currency_symbol: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  ClaimReward.associate = async (models) => {
    ClaimReward.belongsTo(models.clients);
  };

  return ClaimReward;
};
