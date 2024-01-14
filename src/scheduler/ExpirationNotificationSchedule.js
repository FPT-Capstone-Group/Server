const sequelize = require("../config/sequelize");
const {ParkingOrder, Bike, User, ParkingOption} = require("../models");
const notificationController = require("../controllers/notification/notification.controller");
const cron = require("node-cron");
const {Op} = require("sequelize");

const sendExpirationNotificationSchedule =
    cron.schedule('0 9 * * *', async () => {
        const gmtOffset = 7 * 60; // GMT+7
        const now = new Date(new Date().getTime() + gmtOffset * 60000);

        // Check if correct timezone GMT +7
        if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
            await sendExpirationNotification()
        }
    });


const sendExpirationNotification = async () => {
    console.log("Sending Notification")
    try {
        const t = await sequelize.transaction();
        const currentDate = new Date().setHours(0, 0, 0, 0);
        const daysAfterExpired = await ParkingOption.findByPk('daysAfterExpired')
        const daysBeforeExpired = await ParkingOption.findByPk('daysBeforeExpired')
        const expiredParkingOrders = await ParkingOrder.findAll({
            where: {
                expiredDate: {
                    [Op.lt]: [currentDate, new Date(currentDate.getTime() - daysAfterExpired.parkingOptionValue * 24 * 60 * 60 * 1000)]
                }
            }
        })
        const nearExpiredParkingOrders = await ParkingOrder.findAll({
            where: {
                expiredDate: {
                    [Op.between]: [currentDate, new Date(currentDate.getTime() + daysBeforeExpired.parkingOptionValue * 24 * 60 * 60 * 1000) ]
                }
            }
        });


        for (const parkingOrder of expiredParkingOrders) {
            const bike = await Bike.findByPk(parkingOrder.bikeId);
            const user = await User.findByPk(bike.userId);
            const expiredDate = new Date(parkingOrder.expiredDate).setHours(0, 0, 0, 0);

            const diffInMs = expiredDate - currentDate;
            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
            let notificationBody;
            if (diffInDays < 0 && diffInDays >= -daysBeforeExpired.parkingOptionValue) {
                notificationBody = `Your parking order of plate number: ${bike.plateNumber} has been expired for ${diffInDays} day(s). Please proceed your renewal order for continue parking!`;
            } else if (diffInDays === 0) {
                notificationBody = `Your parking order of plate number: ${bike.plateNumber} is expired today. Please proceed your renewal order for continue parking!`;
            }
            const notificationTitle = "Parking Order Expired";

            await notificationController.sendNotificationMessage(
                user.userId,
                notificationTitle,
                notificationBody
            );
            await notificationController.createNotification(
                user.userId,
                notificationBody,
                notificationTitle,
                t
            );

            await t.commit()
        }

        for (const parkingOrder of nearExpiredParkingOrders) {
            const bike = await Bike.findByPk(parkingOrder.bikeId);
            const user = await User.findByPk(bike.userId);

            const expiredDate = new Date(parkingOrder.expiredDate).setHours(0, 0, 0, 0);
            const diffInMs = expiredDate - currentDate;
            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
            let notificationBody;
            if (diffInDays > 0 && diffInDays <= daysAfterExpired.parkingOptionValue) {
                notificationBody = `Your parking order of plate number: ${bike.plateNumber} will expire in ${diffInDays} day(s). Please proceed your renewal order for continue parking!`;
            }
            const notificationTitle = "Parking Order Expired Soon";

            await notificationController.sendNotificationMessage(
                user.userId,
                notificationTitle,
                notificationBody
            );
            await notificationController.createNotification(
                user.userId,
                notificationBody,
                notificationTitle,
                t
            );

            await t.commit()
        }

    } catch
        (error) {
        console.error("Error sending notification in schedule:", error);
    }
}


module.exports = {
    sendExpirationNotificationSchedule
}
