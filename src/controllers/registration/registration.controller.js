const {
    Registration,
    Bike,
    RegistrationHistory,
    User,
    Notification,
} = require("../../models");
const notificationController = require("../notification/notification.controller");
const {
    successResponse,
    errorResponse,
    formatToMoment,
} = require("../../helpers");
const sequelize = require("../../config/sequelize");
const Op = require("sequelize").Op;
// Sub func
const createRegistrationHistory = async (
    registrationStatus,
    approvedBy,
    registrationId,
    t
) => {
    return RegistrationHistory.create(
        {
            registrationStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
            approvedBy,
            registrationId,
        },
        {transaction: t}
    );
};
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
const formatRegistration = (registration, username) => {
    return {
        ...registration.toJSON(),
        username,
        createdAt: formatToMoment(registration.createdAt),
        updatedAt: formatToMoment(registration.updatedAt),
    };
};
const createBikeFromRegistration = async (registration, transaction) => {
    return await Bike.create(
        {
            plateNumber: registration.plateNumber,
            model: registration.model,
            manufacturer: registration.manufacturer,
            registrationNumber: registration.registrationNumber,
            registrationId: registration.registrationId,
            userId: registration.userId,
        },
        {transaction}
    );
};
// Main func

// User create regis
const createRegistration = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {plateNumber, model, registrationNumber, manufacturer} =
            req.body;

        // Check if the plateNumber already exists in the Bike model redundant but guaranteed
        const existingBike = await Bike.findOne({
            where: {plateNumber},
        });

        if (existingBike) {
            return errorResponse(req, res, "Plate number already exists", 400);
        }

        // Check if there is an existing registration with the same plateNumber and not rejected
        const existingRegistration = await Registration.findOne({
            where: {
                plateNumber,
                registrationStatus: {
                    [Op.notIn]: ["rejected", "canceled"],
                },
            },
        });

        if (existingRegistration) {
            return errorResponse(req, res, "Plate number already exists", 400);
        }
        //Check registrationNumber
        const existingRegistrationNumber = await Registration.findOne({
            where: {
                registrationNumber
            },
        });
        if (existingRegistrationNumber) {
            return errorResponse(req, res, "Registration number already exists", 400);
        }


        // Create a new registration
        const newRegistration = await Registration.create(
            {
                registrationStatus: "pending",
                approvedBy: "none",
                plateNumber,
                model,
                registrationNumber,
                manufacturer,
                userId: req.user.userId,
            },
            {transaction: t}
        );

        // Create Registration History
        await createRegistrationHistory(
            "pending",
            "none",
            newRegistration.registrationId,
            t
        );

        // Commit the transaction
        await t.commit();

        // Set the amount to 0 (or the desired value) for the response
        const formattedRegistration = formatRegistration(newRegistration, req.user.username);

        return successResponse(
            req,
            res,
            {
                registration: formattedRegistration,
            },
            201
        );
    } catch (error) {
        console.error(error);
        await t.rollback();
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Admin Verify registration, change status pending to verified,wait to payment....
const verifyRegistration = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {registrationId} = req.params;
        // Find the registration by ID
        const registration = await Registration.findByPk(registrationId);

        if (!registration) {
            return errorResponse(req, res, "Registration not found", 404);
        }

        // Check if the registration is already verified
        // Need to check more like rejected status,...
        if (registration.registrationStatus === "verified") {
            return errorResponse(req, res, "Registration is already verified", 400);
        }

        // Update registration status to "verified"
        registration.registrationStatus = "verified";
        registration.approvedBy = `${req.user.userFullName}`;
        await registration.save({transaction: t});
        await createBikeFromRegistration(registration, t);

        // Create Registration History
        await createRegistrationHistory(
            "verified",
            req.user.userFullName,
            registrationId,
            t
        );

        // Send notification
        const user = await User.findByPk(registration.userId);
        if (user) {
            const notificationTitle = "Bike Registration Verified";
            const notificationBody = `Congratulation! Your registration for the bike ${registration.model} - Plate Number: ${registration.plateNumber} - has been verified!`;
            await notificationController.sendNotificationMessage(
                user.userId,
                notificationTitle,
                notificationBody
            );

            // Save Notification
            await createNotification(
                user.userId,
                notificationBody, //message
                notificationTitle, //notiType
                t
            );
        }

        await t.commit();
        const formattedRegistration = formatRegistration(registration);
        return successResponse(
            req,
            res,
            {registration: formattedRegistration},
            200
        );
    } catch (error) {
        console.error(error);
        await t.rollback();
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// User View all their registration
const getAllUserRegistration = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch all registrations for the user
        const userRegistrations = await Registration.findAll({
            where: {userId},
        });

        if (!userRegistrations || userRegistrations.length === 0) {
            return errorResponse(req, res, "No registrations found!", 404);
        }

        // Create a new array to store the formatted registrations
        const formattedRegistrations = [];

        // Iterate through userRegistrations to check each registration
        for (let registration of userRegistrations) {

            // Format each registration and include the amount
            const formattedRegistration = formatRegistration(registration);

            // Push the formatted registration to the new array
            formattedRegistrations.push(formattedRegistration);
        }

        return successResponse(
            req,
            res,
            {registrations: formattedRegistrations},
            200
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// User cancels their registration
const cancelRegistration = async (req, res) => {
    try {
        const {registrationId} = req.query;
        const userId = req.user.userId;

        // Find the registration by ID and user ID
        const registration = await Registration.findOne({
            where: {registrationId, userId},
        });

        if (!registration) {
            return errorResponse(req, res, "Registration not found", 404);
        }

        // Check if the registration is in a cancellable state
        if (registration.registrationStatus !== "pending") {
            return errorResponse(
                req,
                res,
                "Registration cannot be canceled",
                400
            );
        }

        // Update the registration status to "Canceled"
        registration.registrationStatus = "canceled";
        await registration.save();

        // Create Registration History
        await createRegistrationHistory(
            "canceled",
            req.user.userFullName,
            registrationId,
            t
        );

        return successResponse(req, res, {
            message: "Registration canceled successfully",
        });
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};


// Admin rejects a user registration with message in UI
const rejectRegistration = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {registrationId} = req.params;
        const {message} = req.body;

        // Find the registration by ID
        const registration = await Registration.findByPk(registrationId);

        if (!registration) {
            return errorResponse(req, res, "Registration not found", 404);
        }
        // Check if the registration is already rejected
        if (registration.registrationStatus !== "pending") {
            return errorResponse(
                req,
                res,
                "Registration is can not be rejected if not pending for action",
                400
            );
        }
        // Update the registration status to "rejected"
        registration.registrationStatus = "rejected";
        registration.approvedBy = `${req.user.userFullName}`;

        await registration.save({transaction: t});
        // Create Registration History
        await createRegistrationHistory(
            "canceled",
            req.user.userFullName,
            registrationId,
            t
        );
        // Store the rejection message in a variable
        const rejectionMessage = message || `Your registration for the bike ${registration.model} - Plate Number: ${registration.plateNumber} - has been rejected!`;
        // Send notification to user
        const user = await User.findByPk(registration.userId);
        if (user) {
            const notificationTitle = "Bike Registration Rejected";
            const notificationBody = rejectionMessage;
            await notificationController.sendNotificationMessage(
                user.userId,
                notificationTitle,
                notificationBody
            );
            await createNotification(
                user.userId,
                notificationBody, //message
                notificationTitle, //notiType
                t
            );
        }
        await t.commit();

        return successResponse(req, res, {
            message: rejectionMessage,
        });

    } catch (error) {
        console.error(error);
        await t.rollback();
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// User view a specific registration
const getUserRegistration = async (req, res) => {
    try {
        const {registrationId} = req.params;
        const userId = req.user.userId;
        const registration = await Registration.findOne({
            where: {registrationId, userId},
        });
        if (!registration) {
            return errorResponse(req, res, "Registration not found", 404);
        }

        const formattedRegistration = formatRegistration(registration, amount);

        return successResponse(req, res, {
            registration: formattedRegistration,
        });
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};
// Admin get a user registration
const adminGetUserRegistration = async (req, res) => {
    try {
        const {registrationId} = req.params;
        const registration = await Registration.findByPk(registrationId);
        if (!registration) {
            return errorResponse(req, res, "Registration not found", 404);
        }

        const formattedRegistration = formatRegistration(registration);

        return successResponse(req, res, {
            registration: formattedRegistration,
        });
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

//Admin view all
const allRegistration = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10; // number of records per page
    const offset = parseInt(req.query.offset) || 0; // number of records to skip
    try {
        // Retrieve all registrations
        const registrations = await Registration.findAll({
            include: [
                {
                    model: User,
                    attributes: ["username", "userFullName"],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit: limit,
            offset: offset
        });
        // Check if there are registrations
        if (registrations.length === 0) {
            return successResponse(req, res, "No registrations found");
        }
        const formattedRegistrations = registrations.map((registration) =>
            formatRegistration(registration)
        );
        return successResponse(req, res, formattedRegistrations);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

//Admin search Registration
const searchRegistration = async (req, res) => {
    const {plateNumber} = req.query;

    try {
        const registrations = await Registration.findAll({
            where: {
                plateNumber: {
                    [Op.like]: `%${String(plateNumber)}%`, // Convert to string explicitly
                },
            },
        });
        return successResponse(req, res, registrations);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};
module.exports = {
    createRegistration,
    rejectRegistration,
    getAllUserRegistration,
    allRegistration,
    getUserRegistration,
    createRegistrationHistory,
    verifyRegistration,
    cancelRegistration,
    adminGetUserRegistration,
    searchRegistration,
};
