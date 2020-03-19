module.exports = (sequelize, DataTypes) => {
  const Reward = sequelize.define('rewards', {
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
    affiliate_request_id: {
      type: DataTypes.BIGINT,
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

  Reward.associate = async (models) => {
    // associations can be defined here
    Reward.belongsTo(models.clients);
    Reward.belongsTo(models.affiliate_requests);
  };

  return Reward;
};
