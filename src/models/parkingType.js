module.exports = (sequelize, DataTypes) => {
  const ParkingType = sequelize.define("ParkingType", {
    // Define attributes for parkingType
    parkingTypeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  ParkingType.associate = function (models) {
    ParkingType.hasMany(models.ParkingSession, { foreignKey: "parkingTypeId" });
  };

  return ParkingType;
};
