// controllers/feeController.js
const admin = require('firebase-admin')
const {Notification, User} = require("../../models");
const {
    successResponse,
    errorResponse,
    formatToMoment,
} = require("../../helpers");


const notificationMessage = {
    notification: {
        title: 'DCMM Title',
        body: 'DCMM Body',
    },
    token: 'eL8QEzXvTNSgNJTSgjVYCk:APA91bGa1arFFrwUeBMGSspVaWs7Tz2AaFjIKYvb-96J8nwo5YrtfbaM6kuNhD9HmUBB5KCDCO_71oeDHQIOXS8j-Dpihek4ASqou_SP_FutMywCixIjCyHFGE1soQODrrfYFC5RXDNB',
};

const sendNotificationMessage = async (userId, title, body) => {
    try {
        const associatedUser = await User.findOne({
            where: {userId},
            attributes: ["firebaseToken"],
        });

        console.log(`TOKEN : ${associatedUser.firebaseToken}`)
        const notificationMessage = {
            notification: {
                title: title,
                body: body,
            },
            token: associatedUser.firebaseToken,
        };
        console.log(`TITLE : ${title}`)
        console.log(`BODY : ${body}`)

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
