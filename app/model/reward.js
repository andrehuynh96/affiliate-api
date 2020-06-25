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
    affiliate_request_detail_id: {
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
    currency_symbol: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    commisson_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      default: '',
    },
  }, {
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'rewards_reward_client_per_policy_key',
        unique: true,
        fields: ['client_affiliate_id', 'policy_id', 'affiliate_request_detail_id']
      },
      {
        name: 'rewards_amount_reward',
        fields: ['client_affiliate_id', 'currency_symbol', 'amount']
      },
    ]
  });

  Reward.associate = async (models) => {
    Reward.belongsTo(models.client_affiliates);
    Reward.belongsTo(models.affiliate_request_details);
    Reward.belongsTo(models.policies);
  };

  return Reward;
};
