const AffiliateRequestStatus = require('./value-object/affiliate_request_status');

module.exports = (sequelize, DataTypes) => {
  const AffiliateRequest = sequelize.define('affiliate_requests', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: AffiliateRequestStatus.PENDING,
    },
    currency_symbol: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fromDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    toDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  AffiliateRequest.associate = (models) => {
    // associations can be defined here
    AffiliateRequest.belongsTo(models.affiliate_types);
  };

  return AffiliateRequest;
};
