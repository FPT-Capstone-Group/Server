"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Registrations", {
      registrationId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
      },
      approvedBy: {
        type: Sequelize.STRING,
      },
      expiredDate: {
        type: Sequelize.DATE,
      },
      faceImage: {
        type: Sequelize.TEXT,
      },
      plateNumber: {
        type: Sequelize.STRING,
      },
      model: {
        type: Sequelize.STRING,
      },
      registrationNumber: {
        type: Sequelize.STRING,
      },
      manufacture: {
        type: Sequelize.STRING,
      },
      gender: {
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
    await queryInterface.dropTable("Registrations");
  },
};
