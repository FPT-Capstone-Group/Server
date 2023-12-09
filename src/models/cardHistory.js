module.exports = (sequelize, DataTypes) => {
  const CardHistory = sequelize.define("CardHistory", {
    // Define attributes for CardHistory
    cardHistoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    approvedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  CardHistory.associate = function (models) {
    CardHistory.belongsTo(models.Card, { foreignKey: "cardId" });
  };
  return CardHistory;
};
