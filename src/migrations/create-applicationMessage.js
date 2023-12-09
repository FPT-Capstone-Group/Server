"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ApplicationMessages", {
      messageID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      messageCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      messageType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicationType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.TIMESTAMP,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.TIMESTAMP,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ApplicationMessages");
  },
};
