module.exports = (sequelize, DataTypes) => {
  const ClientPolicy = sequelize.define('client_policies', {
    client_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    policy_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
  });

  ClientPolicy.associate = async (models) => {
    // associations can be defined here
    ClientPolicy.belongsTo(models.clients);
    ClientPolicy.belongsTo(models.policies);

    // await sequelize.query(
    //   `
    //   ALTER TABLE IF EXISTS "public.client_policies" DROP CONSTRAINT IF EXISTS "client_policies_fkey";
    //   ALTER TABLE public.client_policies ADD PRIMARY KEY (client_id, policy_id);
    //   `
    // );

  };

  return ClientPolicy;
};
