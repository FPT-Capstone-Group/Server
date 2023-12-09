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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  Fee.associate = function (models) {
    Fee.hasMany(models.FeeHistory, { foreignKey: "feeId" });
  };
  return Fee;
};
