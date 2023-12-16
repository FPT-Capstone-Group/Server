const admin = require("firebase-admin");
const { Notification, User } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");

// Sub function
const formatNotification = (notification) => {
  const formattedNotification = {
    ...notification.toJSON(),
    createdAt: formatToMoment(notification.createdAt),
    updatedAt: formatToMoment(notification.updatedAt),
  };
  return formattedNotification;
};

const sendNotificationMessage = async (userId, title, body) => {
  try {
    const associatedUser = await User.findOne({
      where: { userId },
      attributes: ["firebaseToken"],
    });

    const notificationMessage = {
      notification: {
        title: title,
        body: body,
      },
      token: associatedUser.firebaseToken,
    };

    return await admin.messaging().send(notificationMessage);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const sendNotification = async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    const response = sendNotificationMessage(userId, title, body);
    return successResponse(req, res, { response: response }, 201);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
// Admin Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll();
    if (!notifications || notifications.length === 0) {
      return successResponse(req, res, "No notifications available");
    }
    const formattedNotifications = notifications.map((notification) =>
      formatNotification(notification)
    );
    return successResponse(
      req,
      res,
      { notifications: formattedNotifications },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Admin Get notifications for a specific user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.findAll({ where: { userId } });
    if (!notifications || notifications.length === 0) {
      return successResponse(
        req,
        res,
        "No notifications available for the user"
      );
    }
    const formattedNotifications = notifications.map((notification) =>
      formatNotification(notification)
    );
    return successResponse(
      req,
      res,
      { notifications: formattedNotifications },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// User Get notifications for the current user
const getUserAssociatedNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.findAll({ where: { userId } });
    if (!notifications || notifications.length === 0) {
      return successResponse(
        req,
        res,
        "No notifications available for the user"
      );
    }
    const formattedNotifications = notifications.map((notification) =>
      formatNotification(notification)
    );
    return successResponse(
      req,
      res,
      { notifications: formattedNotifications },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// User Get a specific notification for the current user by ID
const getSpecificUserNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      where: { notificationId, userId },
    });

    if (!notification) {
      return errorResponse(
        req,
        res,
        "Notification not found for the user",
        404
      );
    }

    const formattedNotification = formatNotification(notification);
    return successResponse(
      req,
      res,
      { notification: formattedNotification },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
module.exports = {
  sendNotificationMessage,
  sendNotification,
  getAllNotifications,
  getUserNotifications,
  getUserAssociatedNotifications,
  getSpecificUserNotification,
};
