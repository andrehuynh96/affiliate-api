module.exports = (sequelize, DataTypes) => {
  const ClaimReward = sequelize.define('claim_rewards', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4(),
    },
    client_affiliate_id: {
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
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    latest_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      default: null,
    },
  }, {
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'client_affiliates_amount_reward',
        fields: ['client_affiliate_id', 'currency_symbol', 'amount', 'status']
      },
    ]
  });

  ClaimReward.associate = async (models) => {
    ClaimReward.belongsTo(models.client_affiliates);
  };

  return ClaimReward;
};


