"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Users",
            [
                {
                    "userId": 1,
                    "userFullName": "Tuan Admin",
                    "username": "tuan_admin",
                    "password": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    "userStatus": "active",
                    "age": 29,
                    "gender": "Male",
                    "address": "HCMC",
                    "firebaseToken": null,
                    "roleId": 1,
                    "createdAt": "2024-01-04 09:56:17.377000 +00:00",
                    "updatedAt": "2024-01-04 09:56:18.522000 +00:00"
                },
                {
                    "userId": 2,
                    "userFullName": "Tuan Security",
                    "username": "tuan_security",
                    "password": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    "userStatus": "active",
                    "age": 29,
                    "gender": "Male",
                    "address": "HCMC",
                    "firebaseToken": null,
                    "roleId": 2,
                    "createdAt": "2024-01-04 09:56:17.377000 +00:00",
                    "updatedAt": "2024-01-04 09:56:17.377000 +00:00"
                }
            ]
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Users", null, {});
    },
};
