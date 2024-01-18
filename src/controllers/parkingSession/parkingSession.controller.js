const {
    ParkingSession,
    ParkingType,
    Bike,
    Card,
    Owner,
} = require("../../models");
const {
    successResponse,
    errorResponse,
    calculateParkingFee,
    formatToMoment,
    compareFaces,
} = require("../../helpers");
const moment = require("moment-timezone");
const {Op} = require("sequelize");
moment.tz.setDefault("Asia/Saigon");
// Sub function
const formatParkingSession = (parkingSession) => {
    return {
        ...parkingSession.toJSON(),
        checkinTime: formatToMoment(parkingSession.checkinTime),
        checkoutTime: formatToMoment(parkingSession.checkoutTime),
        createdAt: formatToMoment(parkingSession.createdAt),
        updatedAt: formatToMoment(parkingSession.updatedAt),
    };
};

const checkoutDataEvaluateResponseObject = (
    parkingSession,
    detectedRiderName
) => {
    return {
        ...parkingSession.toJSON(),
        detectedRiderName: detectedRiderName,
    };
};

// Admin get all parking sessions
const getAllParkingSessions = async (req, res) => {
    try {
        const {dateStart, dateEnd} = req.query;
        const limit = parseInt(req.query.limit) || 10; // number of records per page
        const offset = parseInt(req.query.offset) || 0; // number of records to skip
        const parkingSessions = await ParkingSession.findAll({
            where: {
                updatedAt: {[Op.between]: [dateStart, dateEnd]},
            },
            attributes: {
                exclude: [
                    "checkinFaceImage",
                    "checkinPlateNumberImage",
                    "checkoutFaceImage",
                    "checkoutPlateNumberImage",
                ],
            },
            limit: limit,
            offset: offset
        });
        if (parkingSessions.length === 0) {
            return successResponse(req, res, {parkingSessions: []}, 204); // Avoid dateStart, dateEnd return 500 when nothing in range
        }
        const formattedParkingSessions = parkingSessions.map((parkingSession) =>
            formatParkingSession(parkingSession)
        );
        return successResponse(
            req,
            res,
            {parkingSessions: formattedParkingSessions},
            200
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Get a specific parking session by ID
const getParkingSessionById = async (req, res) => {
    const {parkingSessionId} = req.params;

    try {
        const limit = parseInt(req.query.limit) || 10; // number of records per page
        const offset = parseInt(req.query.offset) || 0; // number of records to skip
        const parkingSession = await ParkingSession.findByPk(parkingSessionId, {
            limit: limit,
            offset: offset
        });
        if (!parkingSession) {
            return errorResponse(req, res, "Parking Session not found", 404);
        }
        const formattedParkingSession = formatParkingSession(parkingSession);
        return successResponse(
            req,
            res,
            {parkingSession: formattedParkingSession},
            200
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const getParkingDataForEvaluateGuest = async (req, res) => {
        const {cardId, riderFaceImage} = req.body;

        try {
            let parkingSession = await ParkingSession.findOne({
                where: {checkinCardId: cardId},
                order: [["checkinTime", "DESC"]], // Get the latest checkin
            });

            if (!parkingSession) {
                return errorResponse(req, res, "Parking Session not found", 404);
            }
            if (parkingSession.checkoutTime) {
                return errorResponse(req, res, "Latest checkin already checked out", 404);
            }
            const dayFee = await ParkingType.findOne({
                attributes: ["parkingTypeFee"],
                where: {
                    parkingTypeName: "guest_day",
                    parkingTypeStatus: "active"
                },
            });
            console.log(dayFee.parkingTypeFee)
            const nightFee = await ParkingType.findOne({
                attributes: ["parkingTypeFee"],
                where: {
                    parkingTypeName: "guest_night",
                    parkingTypeStatus: "active"
                },
            });
            console.log(nightFee.parkingTypeFee)

            const checkoutTime = moment().format("YYYY-MM-DD HH:mm:ss");

            console.log(`Checkin: ${parkingSession.checkinTime}`)
            console.log(`Checkout: ${checkoutTime}`)

            // Calculate parking fee
            parkingSession.parkingFee = calculateParkingFee(
                parkingSession.checkinTime,
                checkoutTime,
                parseInt(dayFee.parkingTypeFee) ,
                parseInt(nightFee.parkingTypeFee),
            );


            const candidateFaceImage = riderFaceImage;
            const targetFaceImage = parkingSession.checkinFaceImage;
            const samePerson = await compareFaces(candidateFaceImage, targetFaceImage);

            if (samePerson === true) {
                return successResponse(
                    req,
                    res,
                    checkoutDataEvaluateResponseObject(parkingSession, "Guest"),
                    200
                );
            } else {
                return successResponse(
                    req,
                    res,
                    checkoutDataEvaluateResponseObject(parkingSession, "Unknown"),
                    200
                );
            }
        } catch
            (error) {
            console.error(error);
            return errorResponse(req, res, "Internal Server Error", 500, error);
        }
    }
;

const getParkingDataForEvaluateNotGuest = async (req, res) => {
    const {cardId, riderFaceImage} = req.body;

    try {
        const card = await Card.findByPk(cardId);
        if (!card) {
            return errorResponse(req, res, "No Card Found", 404);
        }
        const bike = await Bike.findByPk(card.bikeId);
        if (!bike) {
            return errorResponse(req, res, "No Bike Found", 404);
        }
        const owners = await Owner.findAll({
            where: {
                ownerStatus: "active",
                bikeId: bike.bikeId,
            },
        });
        if (!owners || owners.length === 0) {
            return errorResponse(req, res, "No Owners found", 404);
        }

        let parkingSession = await ParkingSession.findOne({
            where: {plateNumber: bike.plateNumber},
            order: [["checkinTime", "DESC"]], // Get the latest checkin
        });

        if (!parkingSession) {
            return errorResponse(req, res, "Parking Session not found", 404);
        }
        if (parkingSession.checkoutTime) {
            return errorResponse(req, res, "Latest checkin already checked out", 404);
        }

        // Calculate parking fee
        parkingSession.parkingFee = 0;
        let samePerson = null;
        for (const owner of owners) {
            samePerson = await compareFaces(riderFaceImage, owner.ownerFaceImage);
            if (samePerson === true) {
                return successResponse(
                    req,
                    res,
                    checkoutDataEvaluateResponseObject(parkingSession, owner.fullName),
                    200
                );
            }
        }
        return successResponse(
            req,
            res,
            checkoutDataEvaluateResponseObject(parkingSession, "Unknown"),
            200
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Create new parking session aka Checkin
const checkIn = async (req, res) => {
    const {
        checkinCardId,
        checkinFaceImage,
        checkinPlateNumberImage,
        plateNumber,
        parkingTypeGroup,
    } = req.body;
    const checkinTime = moment().format("YYYY-MM-DD HH:mm:ss");
    try {
        const security = req.user.userFullName;
        const newParkingSession = await ParkingSession.create({
            checkinCardId,
            checkinTime,
            checkinFaceImage,
            checkinPlateNumberImage,
            plateNumber,
            approvedBy: security,
            parkingTypeGroup: parkingTypeGroup
        });

        return successResponse(
            req,
            res,
            {
                cardId: newParkingSession.checkinCardId,
                plateNumber: newParkingSession.plateNumber,
            },
            201
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Checkout by session ID
const checkOut = async (req, res) => {
    const {
        parkingSessionId,
        checkoutCardId,
        checkoutFaceImage,
        checkoutPlateNumberImage,
        parkingFee,
    } = req.body;

    try {
        let parkingSession = await ParkingSession.findByPk(parkingSessionId);
        const security = req.user.userFullName;
        parkingSession.checkoutCardId = checkoutCardId;
        parkingSession.checkoutFaceImage = checkoutFaceImage;
        parkingSession.checkoutPlateNumberImage = checkoutPlateNumberImage;
        parkingSession.parkingFee = parkingFee;
        parkingSession.approvedBy = security;
        parkingSession.checkoutTime = moment().format("YYYY-MM-DD:HH:mm:ss");

        await parkingSession.save();
        return successResponse(req, res, parkingSession, 201);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Admin get parking Session by plateNumber
const getParkingSessionsByPlateNumber = async (req, res) => {
    try {
        const {plateNumber, dateStart, dateEnd} = req.query;
        const limit = parseInt(req.query.limit) || 10; // number of records per page
        const offset = parseInt(req.query.offset) || 0; // number of records to skip
        // Fetch all parking sessions for the given plate number
        const parkingSessions = await ParkingSession.findAll({
            where: {
                plateNumber,
                updatedAt: {[Op.between]: [dateStart, dateEnd]},
            },
            limit: limit,
            offset: offset
        });

        if (!parkingSessions || parkingSessions.length === 0) {
            return errorResponse(
                req,
                res,
                "No parking sessions found for the given plate number",
                404
            );
        }

        // Format the response or perform additional operations if needed
        const formattedParkingSessions = parkingSessions.map((session) =>
            formatParkingSession(session)
        );

        return successResponse(
            req,
            res,
            {parkingSessions: formattedParkingSessions},
            200
        );
    } catch (error) {
        console.error("Internal Server Error:", error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};
// User get parking session by their plateNumber
const getParkingSessionsByUsersPlateNumber = async (req, res) => {
    try {
        const {plateNumber, dateStart, dateEnd} = req.query;
        const limit = parseInt(req.query.limit) || 10; // number of records per page
        const offset = parseInt(req.query.offset) || 0; // number of records to skip
        const user = req.user;

        // Check if the user owns the bike with the provided plate number
        const bike = await Bike.findOne({
            where: {plateNumber, userId: user.userId},
        });

        if (!bike) {
            return errorResponse(
                req,
                res,
                "The bike is invalid or is not associated with the user",
                404
            );
        }

        // If the user owns the bike, fetch the parking sessions for that bike
        const parkingSessions = await ParkingSession.findAll({
            where: {
                plateNumber,
                updatedAt: {[Op.between]: [dateStart, dateEnd]},
            },
            limit: limit,
            offset: offset
        });

        if (!parkingSessions || parkingSessions.length === 0) {
            return errorResponse(
                req,
                res,
                "No parking sessions found for the given plate number",
                404
            );
        }

        // Format the response or perform additional operations if needed
        const formattedParkingSessions = parkingSessions.map((session) =>
            formatParkingSession(session)
        );

        return successResponse(
            req,
            res,
            {parkingSessions: formattedParkingSessions},
            200
        );
    } catch (error) {
        console.error("Internal Server Error:", error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

module.exports = {
    getAllParkingSessions,
    getParkingSessionById,
    checkIn,
    getParkingDataForEvaluateGuest,
    getParkingDataForEvaluateNotGuest,
    checkOut,
    getParkingSessionsByPlateNumber,
    getParkingSessionsByUsersPlateNumber,
};
