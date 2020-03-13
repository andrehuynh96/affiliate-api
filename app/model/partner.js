const PartnerType = require("./value-object/partner-type");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("partners", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4(),
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    partner_type: {
      type: DataTypes.STRING(16),
      allowNull: false,
      default: PartnerType.CHILD
    },
    actived_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    },
    deleted_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0
    }
  }, {
      underscored: true,
      timestamps: true,
    });
}

