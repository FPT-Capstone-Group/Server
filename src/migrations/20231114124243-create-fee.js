"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Fees", {
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
      concurrency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "VND",
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      feeDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      feeMethod: {
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Fees");
  },
};
