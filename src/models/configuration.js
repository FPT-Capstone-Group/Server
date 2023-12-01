module.exports = (sequelize, DataTypes) => {
  const Configuration = sequelize.define("Configuration", {
    // Define attributes for Configuration
    configurationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    settingName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    settingValue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.STRING,
    },
  });
  Configuration.associate = function (models) {
    // Define associations here, if any
  };
  return Configuration;
};
