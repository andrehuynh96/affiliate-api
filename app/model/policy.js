module.exports = (sequelize, DataTypes) => {
  const Policy = sequelize.define('policies', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    max_levels: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rates: {
      type: DataTypes.ARRAY(DataTypes.DECIMAL),
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  return Policy;
};
