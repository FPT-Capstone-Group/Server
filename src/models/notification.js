module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    // Define attributes for Notification
    notificationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notificationType: {
      type: DataTypes.STRING,
    },
  });
  Notification.associate = function (models) {
    Notification.belongsTo(models.User, { foreignKey: "userId" });
  };
  return Notification;
};
