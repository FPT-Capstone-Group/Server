"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const Cards = queryInterface.sequelize.define('Cards', {
            cardId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING,
            },
            cardStatus: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
            bikeId: Sequelize.INTEGER
        });
        await Cards.bulkCreate([
                {
                    cardId: "15A6D93D",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                },
                {
                    cardId: "4B52D93D",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                },
                {
                    cardId: "0406DF2B",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                },
                {
                    cardId: "BEF7D83D",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                },
                {
                    cardId: "4D09D93D",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                },
                {
                    cardId: "A38BD93D",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                },
                {
                    cardId: "0415918A",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                },
                {
                    cardId: "B709D93D",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                },
                {
                    cardId: "036F890A",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                },
                {
                    cardId: "0DF3D83D",
                    cardStatus: "active",
                    createdAt: "2024-01-04 09:49:33.532000 +00:00",
                    updatedAt: "2024-01-04 09:49:33.532000 +00:00",
                    bikeId: null
                }
            ],
            {
                updateOnDuplicate: ["cardId", "cardStatus", "createdAt", "updatedAt", "bikeId"]
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Cards", null, {});
    },
};
