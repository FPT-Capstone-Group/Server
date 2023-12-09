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
      {
        roleId: 0,
        name: "Staff",
        description: "Staff role",
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};
