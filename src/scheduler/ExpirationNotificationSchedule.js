const sequelize = require("../config/sequelize");
const {Registration, Notification, User} = require("../models");
const notificationController = require("../controllers/notification/notification.controller");

const createNotification = async (userId, message, notificationType, t) => {
    return Notification.create(
        {
            userId,
            message,
            notificationType,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {transaction: t}
    );
};

const sendExpirationNotification = async () => {
    console.log("Sending Notification")
    try {
        const t = await sequelize.transaction();
        const expiredRegistrations = await Registration.findAll({
            where: {status: 'expired'}
        })
        if (!expiredRegistrations || expiredRegistrations.length === 0) return
        for (const registration of expiredRegistrations) {
            const user = await User.findByPk(registration.userId);

            const expiredDate = registration.expiredDate
            const dateDiff = new Date().getDate() - expiredDate.getDate()
            const notificationTitle = "Registration Expired";
            const notificationBody = `Your registration of plate number: ${registration.plateNumber} has been expired for ${dateDiff} day(s).`;
            console.log(notificationBody)
            await notificationController.sendNotificationMessage(
                user.userId,
                notificationTitle,
                notificationBody
            );
            await createNotification(
                user.userId,
                notificationBody,
                notificationTitle,
                t
            );

            await t.commit()
        }
    } catch (error) {
        console.error("Error sending notification in schedule:", error);
    }
}


module.exports = {
    sendExpirationNotification
}
