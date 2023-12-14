module.exports = (sequelize, DataTypes) => {
  const Bike = sequelize.define("Bike", {
    // Define attributes for Bike
    bikeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registrationNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    plateNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    manufacture: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
    }
  });
  Bike.associate = function (models) {
    Bike.belongsTo(models.User, { foreignKey: "userId" });
    Bike.hasMany(models.Owner, { foreignKey: "bikeId" });
    Bike.hasMany(models.Card, { foreignKey: "bikeId" });
  };
  return Bike;
};
