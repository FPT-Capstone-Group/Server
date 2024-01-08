"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const ParkingTypes = queryInterface.sequelize.define('ParkingTypes', {
            parkingTypeId: {
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            parkingTypeName: Sequelize.STRING,
            parkingTypeStatus: Sequelize.STRING,
            parkingTypeGroup: Sequelize.STRING,
            parkingTypeFee: Sequelize.INTEGER,
            description: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });
        await ParkingTypes.bulkCreate(
            [
                {
                    "parkingTypeId": 1,
                    "parkingTypeName": "guest_day",
                    "parkingTypeStatus": "active",
                    "parkingTypeGroup": "guest",
                    "parkingTypeFee": 5000,
                    "description": "guest day",
                    "createdAt": "2024-01-04 10:55:46.428000 +00:00",
                    "updatedAt": "2024-01-04 10:55:47.363000 +00:00"
                },
                {
                    "parkingTypeId": 2,
                    "parkingTypeName": "guest_night",
                    "parkingTypeStatus": "active",
                    "parkingTypeGroup": "guest",
                    "parkingTypeFee": 10000,
                    "description": "guest night",
                    "createdAt": "2024-01-04 10:55:46.428000 +00:00",
                    "updatedAt": "2024-01-04 10:55:46.428000 +00:00"
                },
                {
                    "parkingTypeId": 3,
                    "parkingTypeName": "resident_monthly",
                    "parkingTypeStatus": "active",
                    "parkingTypeGroup": "resident",
                    "parkingTypeFee": 300000,
                    "description": "monthly resident",
                    "createdAt": "2024-01-04 10:55:46.428000 +00:00",
                    "updatedAt": "2024-01-04 10:55:46.428000 +00:00"
                }
            ],
            {
                updateOnDuplicate: ["parkingTypeId", "parkingTypeName", "parkingTypeStatus", "parkingTypeGroup", "parkingTypeFee", "description", "createdAt", "updatedAt"]
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("ParkingTypes", null, {});
    },
};
