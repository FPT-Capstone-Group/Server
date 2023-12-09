"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Owners", {
      ownerId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gender: {
        type: Sequelize.STRING,
      },
      relationship: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ownerFaceImage: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      bikeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Bikes",
          key: "bikeId",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // or 'CASCADE' depending on your use case
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.TIMESTAMP,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.TIMESTAMP,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Owners");
  },
};
