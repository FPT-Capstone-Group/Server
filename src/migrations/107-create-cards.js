"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Cards", {
            cardId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING,
            },
            cardStatus: {
                type: Sequelize.STRING,
                defaultValue: "active",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            bikeId: {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: "Bikes",
                    key: "bikeId",
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
