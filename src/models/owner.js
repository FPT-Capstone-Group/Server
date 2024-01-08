module.exports = (sequelize, DataTypes) => {
    const Owner = sequelize.define("Owner", {
        // Define attributes for Owner
        ownerId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        ownerFullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ownerStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active'
        },
        gender: {
            type: DataTypes.STRING,
        },
        relationship: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ownerFaceImage: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });
    Owner.associate = function (models) {
        // Define Associations for Owner
        Owner.belongsTo(models.Bike, {foreignKey: "bikeId"});
    };
    return Owner;
};
