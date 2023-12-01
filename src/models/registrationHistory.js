// models/RegistrationsHistory.js

module.exports = (sequelize, DataTypes) => {
  const RegistrationHistory = sequelize.define("RegistrationHistory", {
    // Define attributes for RegistrationsHistory
    registrationHistoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    approvedBy: {
      type: DataTypes.STRING,
    },
  });

  RegistrationHistory.associate = function (models) {
    RegistrationHistory.belongsTo(models.Registration, {
      foreignKey: "registrationId",
    });
  };

  return RegistrationHistory;
};
