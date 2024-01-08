module.exports = (sequelize, DataTypes) => {
    const ParkingType = sequelize.define("ParkingType", {
        // Define attributes for parkingType
        parkingTypeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        parkingTypeName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        parkingTypeStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active',
        },
        parkingTypeGroup: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        parkingTypeFee: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    });

    ParkingType.associate = function (models) {
        ParkingType.hasMany(models.ParkingSession, {foreignKey: "parkingTypeId"});
        ParkingType.hasMany(models.ParkingOrder, {foreignKey: "parkingTypeId"});
    };

    return ParkingType;
};
