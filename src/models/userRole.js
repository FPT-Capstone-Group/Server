// models/userRole.js
module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define("UserRole", {});

  UserRole.associate = function (models) {
    UserRole.belongsTo(models.User, { foreignKey: 'userId' });
    UserRole.belongsTo(models.Role, { foreignKey: 'roleId' });
  };

  return UserRole;
};
