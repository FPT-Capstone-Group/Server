"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "Fees",
      {
        feeId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        feeName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        amount: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        deletedAt: {
          allowNull: true,
          type: Sequelize.DATE,
        },
      },
      {
        paranoid: true, // Enable soft deletion
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Fees");
  },
};
