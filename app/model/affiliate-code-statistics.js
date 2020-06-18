module.exports = (sequelize, DataTypes) => {
  const AffiliateCodeStatistics = sequelize.define('affiliate_code_statistics', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    affiliate_code: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    num_of_clicks: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    deleted_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  AffiliateCodeStatistics.associate = (models) => {
    AffiliateCodeStatistics.belongsTo(models.affiliate_codes, {
      as: 'AffiliateCode',
      foreignKey: 'affiliate_code',
    });
  };

  return AffiliateCodeStatistics;
};
