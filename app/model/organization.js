
module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('organizations', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4(),
    },
    name: {
      type: DataTypes.STRING(256),
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

  return Organization;
};
