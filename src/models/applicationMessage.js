module.exports = (sequelize, DataTypes) => {
  const ApplicationMessage = sequelize.define("ApplicationMessage", {
    messageID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    messageCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    applicationType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  // Add any associations if needed

  return ApplicationMessage;
};
