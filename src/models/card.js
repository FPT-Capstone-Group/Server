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
      allowNull: false,
    },
    expiredDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    currentStatus: {
      type: DataTypes.STRING,
      defaultValue: "Active",
    },
    cardType: {
      type: DataTypes.STRING,
    },
    bikeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  Card.associate = function (models) {
    Card.hasMany(models.CardHistory, { foreignKey: "cardId" });
    Card.belongsTo(models.Bike, { foreignKey: "bikeId" });
  };
  return Card;
};
