// Inside the ParkingType migration file
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ParkingTypes", {
      parkingTypeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      feeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Fees",
          key: "feeId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // or 'CASCADE' depending on your use case
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ParkingTypes");
  },
};
