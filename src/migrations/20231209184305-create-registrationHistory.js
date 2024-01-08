"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("RegistrationHistories", {
      registrationHistoryId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      registrationStatus: {
        type: Sequelize.STRING,
      },
      approvedBy: {
        type: Sequelize.STRING,
      },
      registrationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Registrations",
          key: "registrationId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("RegistrationHistories");
  },
};
