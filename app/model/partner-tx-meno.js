
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("partner_tx_memos", {
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
    platform: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    memo: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    default_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0
    },
  }, {
      underscored: true,
      timestamps: true,
    });
} 