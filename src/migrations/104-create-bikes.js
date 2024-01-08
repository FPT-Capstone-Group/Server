"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Bikes", {
      bikeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      registrationNumber: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      plateNumber: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      manufacturer: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bikeStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      registrationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Registrations", // Adjust the table name if needed
          key: "registrationId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("Bikes");
  },
};
