// controllers/feeController.js
const admin = require('firebase-admin')
const {Notification, User} = require("../../models");
const {
    successResponse,
    errorResponse,
    formatToMoment,
} = require("../../helpers");


const sendNotificationMessage = async (userId, title, body) => {
    try {
        const associatedUser = await User.findOne({
            where: {userId},
            attributes: ["firebaseToken"],
        });

        const notificationMessage = {
            notification: {
                title: title,
                body: body,
            },
            token: associatedUser.firebaseToken,
        };

        return await admin.messaging().send(notificationMessage)
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

const sendNotification = async (req, res) => {
    try {
        const {userId, title, body} = req.body
        const response = sendNotificationMessage(userId, title, body);
        return successResponse(req, res, { response: response }, 201);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};


module.exports = {
    sendNotificationMessage,
    sendNotification
};
