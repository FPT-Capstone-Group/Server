"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ParkingSessions", {
      parkingSessionId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      checkinTime: {
        type: Sequelize.DATE,
      },
      checkoutTime: {
        type: Sequelize.DATE,
      },
      checkinFaceImage: {
        type: Sequelize.TEXT,
      },
      checkinPlateNumberImage: {
        type: Sequelize.TEXT,
      },
      checkoutFaceImage: {
        type: Sequelize.TEXT,
      },
      checkoutPlateNumberImage: {
        type: Sequelize.TEXT,
      },
      approvedBy: {
        type: Sequelize.STRING,
      },
      plateNumber: {
        type: Sequelize.STRING,
      },
      parkingFee: {
        type: Sequelize.FLOAT,
      },
      parkingTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "ParkingTypes",
          key: "parkingTypeId",
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
    await queryInterface.dropTable("ParkingSessions");
  },
};
