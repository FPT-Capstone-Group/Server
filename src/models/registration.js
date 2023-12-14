// models/Registration.js

module.exports = (sequelize, DataTypes) => {
  const Registration = sequelize.define("Registration", {
    registrationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
    },
    approvedBy: {
      type: DataTypes.STRING,
    },
    expiredDate: {
      type: DataTypes.DATE,
    },
    faceImage: {
      type: DataTypes.TEXT,
    },
    plateNumber: {
      type: DataTypes.STRING,
    },
    model: {
      type: DataTypes.STRING,
    },
    registrationNumber: {
      type: DataTypes.STRING,
    },
    manufacture: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
  });

  Registration.associate = function (models) {
    Registration.belongsTo(models.User, { foreignKey: "userId" });
    Registration.hasMany(models.RegistrationHistory, {
      foreignKey: "registrationId",
    });
  };

  return Registration;
};
