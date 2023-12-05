// models/role.js

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false, // Disable timestamps
    }
  );

  Role.associate = function (models) {
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: "roleId",
    });
  };
  return Role;
};