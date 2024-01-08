"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Roles", [
            {
                roleId: 1,
                roleName: "admin",
                description: "Admin role",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 3,
                roleName: "user",
                description: "User role",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                roleId: 2,
                roleName: "security",
                description: "Security role",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Roles", null, {});
    },
};
