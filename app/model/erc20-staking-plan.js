
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("erc20_staking_plans", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4(),
    },
    staking_platform_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    duration_type: {
      type: DataTypes.STRING(16),
      defaultValue: 'DAY',
      allowNull: false
    },
    reward_percentage: {
      type: DataTypes.DECIMAL(4,3),
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reward_diff_token_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    erc20_staking_payout_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    diff_token_rate: {
      type: DataTypes.DECIMAL(4,3),
      allowNull: false
    },
    tx_id: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    wait_blockchain_confirm_status_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: true
    }

  }, {
    underscored: true,
    timestamps: true,
  });
}

