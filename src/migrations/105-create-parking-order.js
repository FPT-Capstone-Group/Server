"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(
            "ParkingOrders",
            {
                parkingOrderId: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                parkingOrderStatus: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                parkingOrderType: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                parkingOrderAmount: {
                    type: Sequelize.FLOAT,
                    allowNull: false,
                },
                expiredDate: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                description: {
                    type: Sequelize.STRING,
                    allowNull: true,
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
                bikeId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Bikes",
                        key: "bikeId",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                parkingTypeId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: "ParkingTypes",
                        key: "parkingTypeId",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
            },
            {
                paranoid: true, // Enable soft deletion
            }
        );
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("ParkingOrders");
    },
};
