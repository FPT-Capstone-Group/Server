module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define("Payment", {
        // Define attributes for Payment
        paymentId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        paymentAmount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        paymentStatus: {
            type: DataTypes.STRING,
            defaultValue: "success",
            allowNull: false,
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    });
    Payment.associate = function (models) {
        Payment.belongsTo(models.ParkingOrder, {foreignKey: "parkingOrderId"});
    };
    return Payment;
};
