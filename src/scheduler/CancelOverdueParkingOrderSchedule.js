const sequelize = require("../config/sequelize");
const {ParkingOrder, Bike, User, ParkingOption, Registration} = require("../models");
const notificationController = require("../controllers/notification/notification.controller");
const cron = require("node-cron");
const {Op} = require("sequelize");
const {createRenewalParkingOrder} = require("../controllers/parkingOrder/parkingOrder.controller");
const {successResponse, errorResponse} = require("../helpers");


const cancelOverdueParkingOrderSchedule =
    cron.schedule('0 9 * * *', async () => {

        const gmtOffset = 7 * 60; // GMT+7
        const now = new Date(new Date().getTime() + gmtOffset * 60000);

        // Check if correct timezone GMT +7
        if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
            await autoCancelOverdueParkingOrder()
        }
    });


const autoCancelOverdueParkingOrder = async () => {
    const t = await sequelize.transaction();

    try {
        const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
        const daysAfterExpired = await ParkingOption.findByPk('daysAfterExpired')
        const overdueParkingOrders = await ParkingOrder.findAll({
            where: {
                parkingOrderStatus: 'pending',
                parkingOrderType: 'auto_renewal',
                expiredDate: {
                    [Op.between]: [currentDate, new Date(currentDate.getTime() - daysAfterExpired.parkingOptionValue * 24 * 60 * 60 * 1000)]
                }
            }
        });
        for (const parkingOrder of overdueParkingOrders) {
            const bike = await Bike.findByPk(parkingOrder.bikeId,
                {
                    include: [
                        {
                            model: Registration,
                            attributes: ["userId"],
                        },
                    ],
                });
            const user = await User.findByPk(bike.Registration.userId);
            parkingOrder.parkingOrderStatus = 'canceled'
            await parkingOrder.save({transaction: t});
            await t.commit();
            const notificationBody = `The auto renewal parking order of plate number: ${bike.plateNumber} is canceled due to overdue. Please create the new parking order for using parking service!`

            const notificationTitle = "Parking Order Auto Renewal Canceled";
            await notificationController.sendNotificationMessage(
                user.userId,
                notificationTitle,
                notificationBody
            );
        }

    } catch (error) {
        t.rollback();
        console.error(error);
    }
}

const triggerCancelOverdueParkingOrder = async (req, res) => {

    try {
        await autoCancelOverdueParkingOrder();
        return successResponse(req, res, "Cancel overdue parking order schedule triggered!", 200);

    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};


module.exports = {
    autoCancelOverdueParkingOrder,
    cancelOverdueParkingOrderSchedule,
    triggerCancelOverdueParkingOrder
}
