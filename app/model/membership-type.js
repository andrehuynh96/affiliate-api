module.exports = (sequelize, DataTypes) => {
    const MembershipType = sequelize.define('membership_types', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4(),
      },
      name: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      currency_symbol: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        default: false,
      },
      deleted_flg: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        default: false,
      },
    }, {
      underscored: true,
      timestamps: true,
    });

    MembershipType.associate = (models) => { };

    return MembershipType;
  };
