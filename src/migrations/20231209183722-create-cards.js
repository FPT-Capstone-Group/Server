"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Cards", {
      cardId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expiredDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      currentStatus: {
        type: Sequelize.STRING,
        defaultValue: "active",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      bikeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Bikes",
          key: "bikeId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      parkingTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "ParkingTypes",
          key: "parkingTypeId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Cards");
  },
};
