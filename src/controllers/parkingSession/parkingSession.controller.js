const { Fee, ParkingSession, ParkingType } = require("../../models");
const { successResponse, errorResponse, calculateParkingFee } = require("../../helpers");
const moment = require('moment');

// Create a new parking session
const createParkingSession = async (req, res) => {
  const {
    cardId,
    checkinTime,
    checkinFaceImage,
    checkinPlateNumberImage,
    plateNumber,
    parkingFee,
    parkingTypeId,
  } = req.body;

  try {
    const newParkingSession = await ParkingSession.create({
      cardId,
      checkinTime,
      checkinFaceImage,
      checkinPlateNumberImage,
      plateNumber,
      parkingFee,
      parkingTypeId,
    });

    return successResponse(req, res, newParkingSession, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Get all parking sessions
const getAllParkingSessions = async (req, res) => {
  try {
    const parkingSessions = await ParkingSession.findAll({
      include: ParkingType,
    });

    return successResponse(req, res, parkingSessions, 200);
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

    return successResponse(req, res, parkingSession, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Update a parking session by ID
const updateParkingSession = async (req, res) => {
  const { parkingSessionId } = req.params;

  try {
    const parkingSession = await ParkingSession.findByPk(parkingSessionId);

    if (!parkingSession) {
      return errorResponse(req, res, "Parking Session not found", 404);
    }

    // Perform the update based on your requirements
    // For example, updating checkoutTime, checkoutFaceImage, checkoutPlateNumberImage, approvedBy

    // Save the changes
    await parkingSession.save();

    return successResponse(req, res, parkingSession);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Delete a parking session by ID
const deleteParkingSession = async (req, res) => {
  const { parkingSessionId } = req.params;

  try {
    const parkingSession = await ParkingSession.findByPk(parkingSessionId);

    if (!parkingSession) {
      return errorResponse(req, res, "Parking Session not found", 404);
    }

    // Perform any additional cleanup or validations before deleting

    // Delete the parking session
    await parkingSession.destroy();

    return successResponse(req, res, "Parking Session deleted successfully");
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

const getParkingDataForEvaluate = async (req, res) => {
  const { cardId } = req.query;

  try {

    let parkingSession = await ParkingSession.findOne({
      where: { cardId: cardId },
      order: [['checkinTime', 'DESC']] // Get the latest checkin
    });

    if (!parkingSession) {
      return errorResponse(req, res, "Parking Session not found", 404);
    }
    const dayFee = await Fee.findOne({
      where: {feeName: 'day'}
    })
    const nightFee = await Fee.findOne({
      where: {feeName: 'night'}
    })
    // parkingSession.checkoutTime = moment.tz.zonesForCountry('VN').format('YYYY-MM-DD:HH:mm:ss');
    parkingSession.checkoutTime = moment().format('YYYY-MM-DD:HH:mm:ss');
    // Calculate parking fee
    parkingSession.parkingFee = calculateParkingFee(parkingSession.checkinTime, parkingSession.checkoutTime, dayFee.amount, nightFee.amount)
    return successResponse(req, res, parkingSession, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Create new parking session aka Checkin
const checkIn = async (req, res) => {
  const {
    cardId,
    checkinFaceImage,
    checkinPlateNumberImage,
    plateNumber,
  } = req.body;
  const checkinTime = moment().format('YYYY-MM-DD:HH:mm:ss');

  try {
    const parkingTypeId = 1
    const newParkingSession = await ParkingSession.create({
      cardId,
      checkinTime,
      checkinFaceImage,
      checkinPlateNumberImage,
      plateNumber,
      parkingTypeId,
    });

    return successResponse(req, res, newParkingSession, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Checkout by session ID
const checkOut = async (req, res) => {
  const {
    parkingSessionId,
    checkoutFaceImage,
    checkoutPlateNumberImage,
    parkingFee
  } = req.body;

  try {
    let parkingSession = await ParkingSession.findByPk(parkingSessionId)
    parkingSession.checkoutFaceImage = checkoutFaceImage
    parkingSession.checkoutPlateNumberImage = checkoutPlateNumberImage
    parkingSession.parkingFee = parkingFee
    parkingSession.checkoutTime = moment().format('YYYY-MM-DD:HH:mm:ss');


    await parkingSession.save();
    return successResponse(req, res, parkingSession, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  createParkingSession,
  getAllParkingSessions,
  getParkingSessionById,
  updateParkingSession,
  deleteParkingSession,
  checkIn,
  getParkingDataForEvaluate,
  checkOut
};
