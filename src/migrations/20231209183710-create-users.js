"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Users", {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fullName: {
        type: Sequelize.STRING,
      },
      username: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true, // admin also a user
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true, // admin also a user
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true, // admin also a user
      },
      firebaseToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Roles",
          key: "roleId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // or 'CASCADE' depending on your use case
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Users");
  },
};
