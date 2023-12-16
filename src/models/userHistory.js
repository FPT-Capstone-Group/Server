module.exports = (sequelize, DataTypes) => {
  const UserHistory = sequelize.define("UserHistory", {
    userHistoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    eventName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  UserHistory.associate = function (models) {
    UserHistory.belongsTo(models.User, { foreignKey: "userId" });
  };
  return UserHistory;
};
