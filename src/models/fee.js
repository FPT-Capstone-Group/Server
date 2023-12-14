module.exports = (sequelize, DataTypes) => {
  const Fee = sequelize.define(
    "Fee",
    {
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
    },
    {
      paranoid: true, // Enable soft deletion
      // Define a global scope to exclude 'deletedAt'
      defaultScope: {
        attributes: {
          exclude: ["deletedAt"],
        },
      },
    }
  );

  Fee.associate = function (models) {
    Fee.hasMany(models.FeeHistory, { foreignKey: "feeId" });
  };

  return Fee;
};
