module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('clients', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ext_client_id: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    membership_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  }, {
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'ext_client_key',
        unique: true,
        fields: ['ext_client_id', 'organization_id']
      },
    ]
  });

  Client.associate = (models) => {
    Client.belongsTo(models.organizations);

    Client.hasMany(models.client_affiliates, {
      as: 'ClientAffiliates',
    });

  };

  return Client;
};
