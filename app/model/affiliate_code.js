module.exports = (sequelize, DataTypes) => {
  const AffiliateCode = sequelize.define('affiliate_codes', {
    code: {
      type: DataTypes.STRING(64),
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
    // associations can be defined here
    AffiliateCode.belongsTo(models.clients);
  };

  return AffiliateCode;
};
