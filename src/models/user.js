// model/user.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        fullName: {
            type: DataTypes.STRING,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: true, // admin also a user
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true, // admin also a user
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true, // admin also a user
        },
        firebaseToken: {
            type: DataTypes.STRING,
            allowNull: true, // admin also a user
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    });
    User.associate = function (models) {
        User.belongsTo(models.Role, {foreignKey: "roleId"});
        User.hasMany(models.Bike, {foreignKey: "userId"});
        User.hasMany(models.UserHistory, {foreignKey: "userId"});
        User.hasMany(models.Notification, {foreignKey: "userId"});
        User.hasMany(models.Registration, {foreignKey: "userId"});
    };
    return User;
};
