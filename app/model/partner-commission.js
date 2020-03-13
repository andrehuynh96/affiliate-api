const { Temporalize } = require('sequelize-temporalize');

module.exports = (sequelize, DataTypes) => {
  const partner_commission = sequelize.define("partner_commissions", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4(),
    },
    partner_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    commission: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    platform: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    reward_address: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
      underscored: true,
      timestamps: true,
    });

  Temporalize({
    model: partner_commission,
    sequelize,
    temporalizeOptions: {
      blocking: false,
      full: false,
      modelSuffix: "_his"
    }
  });
  return partner_commission;
}