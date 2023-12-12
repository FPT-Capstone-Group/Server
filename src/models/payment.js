module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define("Payment", {
    // Define attributes for Payment
    paymentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    registrationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Processing",
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  Payment.associate = function (models) {
    Payment.belongsTo(models.Registration, { foreignKey: "registrationId" });
  };
  return Payment;
};
