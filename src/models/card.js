module.exports = (sequelize, DataTypes) => {
    const Card = sequelize.define("Card", {
        // Define attributes for Card
        cardId: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        cardStatus: {
            type: DataTypes.STRING,
            defaultValue: "active",
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    });
    Card.associate = function (models) {
        Card.hasMany(models.CardHistory, {foreignKey: "cardId"});
        Card.belongsTo(models.Bike, {foreignKey: "bikeId"});
    };
    return Card;
};
