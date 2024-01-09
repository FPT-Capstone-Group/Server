// models/Registration.js

module.exports = (sequelize, DataTypes) => {
  const Registration = sequelize.define("Registration", {
    registrationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    registrationStatus: {
      type: DataTypes.STRING,
    },
    approvedBy: {
      type: DataTypes.STRING,
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
    manufacturer: {
      type: DataTypes.STRING,
    },
        createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });

  Registration.associate = function (models) {
    Registration.belongsTo(models.User, { foreignKey: "userId" });
    Registration.hasMany(models.RegistrationHistory, {
      foreignKey: "registrationId",
    });
    Registration.hasOne(models.Bike, { foreignKey: "registrationId" });
  };

  return Registration;
};
