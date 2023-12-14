const {
  Fee,
  ParkingSession,
  ParkingType,
  Bike,
  Card,
} = require("../../models");
const {
  successResponse,
  errorResponse,
  calculateParkingFee,
  formatToMoment,
} = require("../../helpers");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Saigon")
// Sub function
const formatParkingSession = (parkingSession) => {
  return {
    ...parkingSession.toJSON(),
    checkinTime:formatToMoment(parkingSession.checkinTime),
    checkoutTime:formatToMoment(parkingSession.checkoutTime),
    createdAt: formatToMoment(parkingSession.createdAt),
    updatedAt: formatToMoment(parkingSession.updatedAt),
    checkinTime: formatToMoment(parkingSession.checkinTime),
    checkoutTime: formatToMoment(parkingSession.checkoutTime),
  };
};

// Admin get all parking sessions
const getAllParkingSessions = async (req, res) => {
  try {
    const parkingSessions = await ParkingSession.findAll({
      include: ParkingType,
    });
    const formattedParkingSessions = parkingSessions.map((parkingSession) =>
      formatParkingSession(parkingSession)
    );
    return successResponse(
      req,
      res,
      { parkingSessions: formattedParkingSessions },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Get a specific parking session by ID
const getParkingSessionById = async (req, res) => {
  const { parkingSessionId } = req.params;

  try {
    const parkingSession = await ParkingSession.findByPk(parkingSessionId, {
      include: ParkingType,
    });
    if (!parkingSession) {
      return errorResponse(req, res, "Parking Session not found", 404);
    }
    const formattedParkingSession = formatParkingSession(parkingSession);
    return successResponse(
      req,
      res,
      { parkingSession: formattedParkingSession },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

const getParkingDataForEvaluateGuest = async (req, res) => {
  const { cardId } = req.query;

  try {
    const card = await Card.findByPk(cardId, {
      include: [{ model: Bike, attributes: ["plateNumber"] }],
    });
    console.log(card);
    let parkingSession = await ParkingSession.findOne({
      where: { checkinCardId: cardId },
      order: [["checkinTime", "DESC"]], // Get the latest checkin
    });

    if (!parkingSession) {
      return errorResponse(req, res, "Parking Session not found", 404);
    }
    const dayFee = await Fee.findOne({
      where: { feeName: "guest_day" },
    });
    const nightFee = await Fee.findOne({
      where: { feeName: "guest_night" },
    });
    // parkingSession.checkoutTime = moment.tz.zonesForCountry('VN').format('YYYY-MM-DD:HH:mm:ss');
    parkingSession.checkoutTime = moment(new Date()).tz("Asia/Saigon").format('YYYY-MM-DD:HH:mm:ss');
    // Calculate parking fee
    parkingSession.parkingFee = calculateParkingFee(
      parkingSession.checkinTime,
      parkingSession.checkoutTime,
      dayFee.amount,
      nightFee.amount
    );
    return successResponse(req, res, parkingSession, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};


const getParkingDataForEvaluateNotGuest = async (req, res) => {
  const { cardId } = req.query;

  try {
    const card = await Card.findByPk(cardId, {
      include  : [{ model: Bike, attributes: ['plateNumber']}]
    })
    console.log(card)
    let parkingSession = await ParkingSession.findOne({
      where: { plateNumber: card.plateNumber },
      order: [["checkinTime", "DESC"]], // Get the latest checkin
    });

    if (!parkingSession) {
      return errorResponse(req, res, "Parking Session not found", 404);
    }

    // parkingSession.checkoutTime = moment.tz.zonesForCountry('VN').format('YYYY-MM-DD:HH:mm:ss');
    parkingSession.checkoutTime = moment().format("YYYY-MM-DD:HH:mm:ss");
    // Calculate parking fee
    parkingSession.parkingFee = 0
    return successResponse(req, res, parkingSession, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};


// Create new parking session aka Checkin
const checkIn = async (req, res) => {
  const { checkinCardId,checkinFaceImage, checkinPlateNumberImage, plateNumber, parkingTypeName } =
    req.body;
  const checkinTime = moment().format("YYYY-MM-DD:HH:mm:ss")
  try {
    const security = req.user.fullName;
    const parkingType = await ParkingType.findOne({
      where: { name: parkingTypeName },
    });
    const newParkingSession = await ParkingSession.create({
      checkinCardId,
      checkinTime,
      checkinFaceImage,
      checkinPlateNumberImage,
      plateNumber,
      approvedBy: security,
      parkingTypeId: parkingType.parkingTypeId,
    });

    return successResponse(
      req,
      res,
      { cardId: newParkingSession.checkinCardId, plateNumber: newParkingSession.plateNumber, parkingType: parkingType },
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
    parkingSession.checkoutCardId = checkoutCardId;
    parkingSession.checkoutFaceImage = checkoutFaceImage;
    parkingSession.checkoutPlateNumberImage = checkoutPlateNumberImage;
    parkingSession.parkingFee = parkingFee;
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
    const { plateNumber } = req.query;

    // Fetch all parking sessions for the given plate number
    const parkingSessions = await ParkingSession.findAll({
      where: { plateNumber },
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
      { parkingSessions: formattedParkingSessions },
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
    const { plateNumber } = req.query;
    const user = req.user;

    // Check if the user owns the bike with the provided plate number
    const bike = await Bike.findOne({
      where: { plateNumber, userId: user.userId },
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
      where: { plateNumber },
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
      { parkingSessions: formattedParkingSessions },
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
