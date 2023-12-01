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
        allowNull: false,
      },
      currentStatus: {
        type: Sequelize.STRING,
        defaultValue: "Active",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      cardType: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userId",
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
