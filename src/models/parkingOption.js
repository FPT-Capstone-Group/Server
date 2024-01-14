module.exports = (sequelize, DataTypes) => {
  const ParkingOption = sequelize.define("ParkingOption", {
    // Define attributes for ParkingOption
    parkingOptionKey: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    parkingOptionValue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.STRING,
    },
  });
  ParkingOption.associate = function (models) {
    // Define associations here, if any
  };
  return ParkingOption;
};
