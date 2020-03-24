
module.exports = (sequelize, DataTypes) => {
  const MembershipType = sequelize.define('membership_types', {
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
    rate: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  MembershipType.associate = (models) => {
    MembershipType.belongsTo(models.policies);
  };

  return MembershipType;
};
