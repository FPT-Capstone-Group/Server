module.exports = (sequelize, DataTypes) => {
    const Bike = sequelize.define("Bike", {
        // Define attributes for Bike
        bikeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        registrationNumber: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        plateNumber: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        manufacturer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bikeStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "active",
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    });
    Bike.associate = function (models) {
        Bike.belongsTo(models.Registration, {foreignKey: "registrationId"});
        Bike.hasMany(models.Owner, {foreignKey: "bikeId"});
        Bike.hasMany(models.Card, {foreignKey: "bikeId"});
        Bike.hasMany(models.ParkingOrder, {foreignKey: "bikeId"});
    };
    return Bike;
};
