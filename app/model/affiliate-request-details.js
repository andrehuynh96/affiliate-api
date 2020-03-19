const AffiliateRequestDetailsStatus = require('./value-object/affiliate-request-details-status');

module.exports = (sequelize, DataTypes) => {
  const AffiliateRequestDetails = sequelize.define('affiliate_request_details', {
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
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: AffiliateRequestDetailsStatus.PENDING,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  AffiliateRequestDetails.associate = (models) => {
    // associations can be defined here
    AffiliateRequestDetails.belongsTo(models.clients);
    AffiliateRequestDetails.belongsTo(models.affiliate_requests);
  };

  return AffiliateRequestDetails;
};
