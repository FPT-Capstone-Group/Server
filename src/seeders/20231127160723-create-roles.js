"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Roles", [
      {
        roleId: 1,
        name: "Admin",
        description: "Admin role",
      },
      {
        roleId: 0,
        name: "User",
        description: "User role",
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};
