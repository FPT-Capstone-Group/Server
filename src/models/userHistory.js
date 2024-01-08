module.exports = (sequelize, DataTypes) => {
    const UserHistory = sequelize.define("UserHistory", {
        userHistoryId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        event: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    });
    UserHistory.associate = function (models) {
        UserHistory.belongsTo(models.User, {foreignKey: "userId"});
    };
    return UserHistory;
};
