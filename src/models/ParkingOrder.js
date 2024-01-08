module.exports = (sequelize, DataTypes) => {
    const ParkingOrder = sequelize.define("ParkingOrder", {
        // Define attributes for ParkingOption
        parkingOrderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        parkingOrderStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        parkingOrderAmount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        expiredDate: {
            type: DataTypes.DATE,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
        description: {
            type: DataTypes.STRING,
        },
    });
    ParkingOrder.associate = function (models) {
        ParkingOrder.belongsTo(
            models.ParkingType, {
                foreignKey: "parkingTypeId",
            });
        ParkingOrder.belongsTo(
            models.Bike, {
                foreignKey: "bikeId",
            });
        ParkingOrder.hasMany(
            models.Payment, {
                foreignKey: "paymentId",
            });
    };
    return ParkingOrder;
};
