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
    name: {
      type: DataTypes.STRING(256),
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
    App.belongsTo(models.organizations);
  };

  return App;
};
