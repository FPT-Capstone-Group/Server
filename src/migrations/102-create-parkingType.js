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
      parkingTypeName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        parkingTypeStatus: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'active',
        },
        parkingTypeGroup: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        parkingTypeFee: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true,
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
