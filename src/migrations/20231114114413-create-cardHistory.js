"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("CardHistories", {
      cardHistoryId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      eventType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      eventTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      cardId: {
        type: Sequelize.STRING,
        references: {
          model: "Cards",
          key: "cardId",
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
    await queryInterface.dropTable("CardHistories");
  },
};
