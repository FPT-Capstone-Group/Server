"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("ParkingOptions",
            [
                {
                    "parkingOptionKey": "maximumOwnerLimit",
                    "parkingOptionValue": "4",
                    "notes": "The maximum number of active owners allowed",
                    "createdAt": "2024-01-04 09:56:17.377000 +00:00",
                    "updatedAt": "2024-01-04 09:56:18.522000 +00:00"
                },
                {
                    "parkingOptionKey": "daysBeforeExpired",
                    "parkingOptionValue": "3",
                    "notes": "The number of days before the parking order is expired, to perform the renewal process",
                    "createdAt": "2024-01-04 09:56:17.377000 +00:00",
                    "updatedAt": "2024-01-04 09:56:18.522000 +00:00"
                }
            ]
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("ParkingOptions", null, {});
    },
};
