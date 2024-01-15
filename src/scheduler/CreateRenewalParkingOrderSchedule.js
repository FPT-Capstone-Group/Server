const sequelize = require("../config/sequelize");
const {ParkingOrder, Bike, User, ParkingOption} = require("../models");
const notificationController = require("../controllers/notification/notification.controller");
const cron = require("node-cron");
const {Op} = require("sequelize");
const {createRenewalParkingOrder} = require("../controllers/parkingOrder/parkingOrder.controller");


const createRenewalParkingOrderSchedule =
    cron.schedule('0 9 * * *', async () => {

        const gmtOffset = 7 * 60; // GMT+7
        const now = new Date(new Date().getTime() + gmtOffset * 60000);

        // Check if correct timezone GMT +7
        if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
            await autoCreateRenewalParkingOrder()
        }
    });


const autoCreateRenewalParkingOrder = async () => {
    try {
        const t = await sequelize.transaction();
        const currentDate = new Date().setHours(0, 0, 0, 0);
        const daysBeforeExpired = await ParkingOption.findByPk('daysBeforeExpired')
        const nearExpiredParkingOrders = await ParkingOrder.findAll({
            where: {
                parkingOrderStatus: 'active',
                expiredDate: {
                    [Op.between]: [currentDate, new Date(currentDate.getTime() + daysBeforeExpired.parkingOptionValue * 24 * 60 * 60 * 1000) ]
                }
            }
        });
        for (const parkingOrder of nearExpiredParkingOrders) {
            const bike = await Bike.findByPk(parkingOrder.bikeId);
            const user = await User.findByPk(bike.userId);

            const renewalParkingOrder = await ParkingOrder.findOne({
                where: {
                    bikeId: parkingOrder.bikeId,
                    parkingOrderStatus: 'pending'
                }
            })
            // Already create renewal parking order
            if (renewalParkingOrder) {
                return;
            }

            await createRenewalParkingOrder(parkingOrder.parkingOrderId)

            const notificationBody = `The renewal parking order of plate number: ${bike.plateNumber} is created. Please proceed your renewal order for continue parking!`

            const notificationTitle = "Parking Order Renewal Created";
            await notificationController.sendNotificationMessage(
                user.userId,
                notificationTitle,
                notificationBody
            );
        }

    } catch
        (error) {
        console.error(error);
    }
}


module.exports = {
    autoCreateRenewalParkingOrder,
    createRenewalParkingOrderSchedule
}
