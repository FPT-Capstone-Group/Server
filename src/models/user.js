// model/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    firebaseToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });
  User.associate = function (models) {
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: "userId",
    });
    User.hasMany(models.Bike, { foreignKey: "userId" });
    User.hasMany(models.Notification, { foreignKey: "userId" });
  };
  return User;
};
