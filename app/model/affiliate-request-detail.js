const AffiliateRequestStatus = require('./value-object/affiliate_request_status');

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

  AffiliateRequestDetails.associate = (models) => {
    // associations can be defined here
    AffiliateRequestDetails.belongsTo(models.clients);
    AffiliateRequestDetails.belongsTo(models.affiliate_requests);
  };

  return AffiliateRequestDetails;
};
