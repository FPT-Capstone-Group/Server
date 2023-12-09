"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("FeeHistories", {
      feeHistoryId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      eventType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      approvedBy: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      feeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Fees",
          key: "feeId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      updatedAt: {
        type: Sequelize.TIMESTAMP,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("FeeHistories");
  },
};
