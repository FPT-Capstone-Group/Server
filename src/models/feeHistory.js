module.exports = (sequelize, DataTypes) => {
  const FeeHistory = sequelize.define("FeeHistory", {
    // Define attributes for FeeHistory
    feeHistoryId: {
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
  FeeHistory.associate = function (models) {
    FeeHistory.belongsTo(models.Fee, { foreignKey: "feeId" });
  };
  return FeeHistory;
};
