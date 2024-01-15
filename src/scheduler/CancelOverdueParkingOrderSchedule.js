const sequelize = require("../config/sequelize");
const {ParkingOrder, Bike, User, ParkingOption} = require("../models");
const notificationController = require("../controllers/notification/notification.controller");
const cron = require("node-cron");
const {Op} = require("sequelize");
const {createRenewalParkingOrder} = require("../controllers/parkingOrder/parkingOrder.controller");


const cancelOverdueParkingOrderSchedule =
    cron.schedule('0 9 * * *', async () => {

        const gmtOffset = 7 * 60; // GMT+7
        const now = new Date(new Date().getTime() + gmtOffset * 60000);

        // Check if correct timezone GMT +7
        if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
            await createRenewalParkingOrder()
        }
    });


const autoCancelOverdueParkingOrder = async () => {
    const t = await sequelize.transaction();

    try {
        const currentDate = new Date().setHours(0, 0, 0, 0);
        const daysAfterExpired = await ParkingOption.findByPk('daysAfterExpired')
        const overdueParkingOrders = await ParkingOrder.findAll({
            where: {
                parkingOrderStatus: 'pending',
                parkingOrderType: 'auto_renewal',
                expiredDate: {
                    [Op.eq]: [currentDate, new Date(currentDate.getTime() - daysAfterExpired.parkingOptionValue * 24 * 60 * 60 * 1000)]
                }
            }
        });
        for (const parkingOrder of overdueParkingOrders) {
            parkingOrder.parkingOrderStatus = 'expired'
            await parkingOrder.save({transaction: t});
            await t.commit();
        }

    } catch (error) {
        t.rollback();
        console.error(error);
    }
}


module.exports = {
    autoCancelOverdueParkingOrder,
    cancelOverdueParkingOrderSchedule
}
