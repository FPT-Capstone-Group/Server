module.exports = (sequelize, DataTypes) => {
    const ParkingSession = sequelize.define("ParkingSession", {
        // Define attributes for ParkingSession
        parkingSessionId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        checkinTime: {
            type: DataTypes.DATE,
        },
        checkinCardId: {
            type: DataTypes.STRING,
        },
        checkoutCardId: {
            type: DataTypes.STRING,
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
        parkingTypeGroup: {
            type: DataTypes.STRING,
        },
        parkingFee: {
            type: DataTypes.FLOAT,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    });

    ParkingSession.associate = function (models) {
    };

    return ParkingSession;
};
