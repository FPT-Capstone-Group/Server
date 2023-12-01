// model/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
      },
      verifyToken: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      defaultScope: {
        attributes: { exclude: ["password", "verifyToken"] },
      },
      scopes: {
        withSecretColumns: {
          attributes: { include: ["password", "verifyToken"] },
        },
      },
    }
  );
  User.associate = function (models) {
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: "userId",
    });
    User.hasMany(models.Bike, { foreignKey: "userId" });
  };
  return User;
};
