module.exports = (sequelize, DataTypes) => {
  const UserHistory = sequelize.define("UserHistory", {
    userHistoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    eventTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    event: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  UserHistory.associate = function (models) {
    // associations can be defined here
  };
  return UserHistory;
};
