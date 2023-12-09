module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define("Card", {
    // Define attributes for Card
    cardId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiredDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    currentStatus: {
      type: DataTypes.STRING,
      defaultValue: "Active",
    },
    cardType: {
      type: DataTypes.STRING,
      defaultValue: "Guest",
    },
    bikeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });
  Card.associate = function (models) {
    Card.hasMany(models.CardHistory, { foreignKey: "cardId" });
    Card.belongsTo(models.Bike, { foreignKey: "bikeId" });
  };
  return Card;
};
