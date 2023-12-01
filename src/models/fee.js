module.exports = (sequelize, DataTypes) => {
  const Fee = sequelize.define("Fee", {
    // Define attributes for Fee
    feeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    feeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    concurrency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "VND",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feeDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    feeMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  Fee.associate = function (models) {
    Fee.hasOne(models.Payment, { foreignKey: "feeId" });
  };
  return Fee;
};
