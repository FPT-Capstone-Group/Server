module.exports = (sequelize, DataTypes) => {
  const PaymentHistory = sequelize.define("PaymentHistory", {
    // Define attributes for PaymentHistory
    paymentHistoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  PaymentHistory.associate = function (models) {
    PaymentHistory.belongsTo(models.Payment, { foreignKey: "paymentId" });
  };
  return PaymentHistory;
};
