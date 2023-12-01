module.exports = (sequelize, DataTypes) => {
  const ParkingSession = sequelize.define("ParkingSession", {
    // Define attributes for ParkingSession
    parkingSessionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    cardId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    checkinTime: {
      type: DataTypes.DATE,
    },
    checkoutTime: {
      type: DataTypes.DATE,
    },
    checkinFaceImage: {
      type: DataTypes.TEXT,
    },
    checkinPlateNumberImage: {
      type: DataTypes.TEXT,
    },
    checkoutFaceImage: {
      type: DataTypes.TEXT,
    },
    checkoutPlateNumberImage: {
      type: DataTypes.TEXT,
    },
    approvedBy: {
      type: DataTypes.STRING,
    },
    plateNumber: {
      type: DataTypes.STRING,
    },
    parkingFee: {
      type: DataTypes.FLOAT,
    },
  });

  ParkingSession.associate = function (models) {
    ParkingSession.belongsTo(models.ParkingType, {
      foreignKey: "parkingTypeId",
    });
    ParkingSession.belongsTo(models.Card, {
      foreignKey: "cardId",
    });
  };

  return ParkingSession;
};
