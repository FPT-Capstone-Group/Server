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
    createdAt: {
      type: DataTypes.DATE,
    },
  });
  Notification.associate = function (models) {
    Notification.belongsTo(models.User, { foreignKey: "userId" });
  };
  return Notification;
};
