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
      manufacture: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Active",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Adjust the table name if needed
          key: "userId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      cardId: {
        type: Sequelize.STRING,
        references: {
          model: "Cards", // Adjust the table name if needed
          key: "cardId",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // or 'CASCADE' depending on your use case
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
