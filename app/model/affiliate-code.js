module.exports = (sequelize, DataTypes) => {
  const AffiliateCode = sequelize.define('affiliate_codes', {
    code: {
      type: DataTypes.STRING(32),
      primaryKey: true,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  AffiliateCode.associate = (models) => {
    AffiliateCode.belongsTo(models.clients, {
      as: 'owner',
      foreignKey: 'client_id',
    });
  };

  return AffiliateCode;
};
