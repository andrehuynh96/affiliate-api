const AffiliateRequestStatus = require('./value-object/affiliate-request-status');

module.exports = (sequelize, DataTypes) => {
  const AffiliateRequest = sequelize.define('affiliate_requests', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4(),
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
    from_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    to_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    affiliate_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    job_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    error_message: {
      type: DataTypes.STRING(10000),
      allowNull: true,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  AffiliateRequest.associate = (models) => {
    AffiliateRequest.belongsTo(models.affiliate_types, {
      as: 'AffiliateType',
      foreignKey: 'affiliate_type_id',
    });

    AffiliateRequest.hasMany(models.affiliate_request_details, {
      as: 'RequestDetailsList',
      foreignKey: 'affiliate_request_id',
      sourceKey: 'id',
    });
  };

  return AffiliateRequest;
};
