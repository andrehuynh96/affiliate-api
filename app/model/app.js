module.exports = (sequelize, DataTypes) => {
  const App = sequelize.define('apps', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4(),
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    affiliate_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    api_key: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    secret_key: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    actived_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  App.associate = (models) => {
    // associations can be defined here
    App.belongsTo(models.organizations);
    App.belongsTo(models.affiliate_types);

  };

  return App;
};
