// controllers/parkingTypeController.js
const { ParkingType } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");

// Sub function
const formatParkingType = (parkingType) => {
  const formattedParkingType = {
    ...parkingType.toJSON(),
    createdAt: formatToMoment(parkingType.createdAt),
    updatedAt: formatToMoment(parkingType.updatedAt),
  };
  return formattedParkingType;
};

// Main functions
const createParkingType = async (req, res) => {
  try {
    const { name, description } = req.body;

    const newParkingType = await ParkingType.create({
      name,
      description,
    });

    const formattedParkingType = formatParkingType(newParkingType);

    return successResponse(
      req,
      res,
      { parkingType: formattedParkingType },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

const getAllParkingTypes = async (req, res) => {
  try {
    const parkingTypes = await ParkingType.findAll();

    if (!parkingTypes || parkingTypes.length === 0) {
      return successResponse(req, res, "No parking types available");
    }

    const formattedParkingTypes = parkingTypes.map((parkingType) =>
      formatParkingType(parkingType)
    );

    return successResponse(
      req,
      res,
      { parkingTypes: formattedParkingTypes },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

const getParkingTypeById = async (req, res) => {
  try {
    const { parkingTypeId } = req.params;

    const parkingType = await ParkingType.findByPk(parkingTypeId);

    if (!parkingType) {
      return errorResponse(req, res, "Parking type not found", 404);
    }

    const formattedParkingType = formatParkingType(parkingType);

    return successResponse(
      req,
      res,
      { parkingType: formattedParkingType },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

const updateParkingTypeById = async (req, res) => {
  try {
    const { parkingTypeId } = req.params;
    const { name, description } = req.body;

    const parkingType = await ParkingType.findByPk(parkingTypeId);

    if (!parkingType) {
      return errorResponse(req, res, "Parking type not found", 404);
    }

    // Update parkingType attributes
    parkingType.name = name;
    parkingType.description = description;

    await parkingType.save();

    const formattedParkingType = formatParkingType(parkingType);

    return successResponse(
      req,
      res,
      { parkingType: formattedParkingType },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  createParkingType,
  getAllParkingTypes,
  getParkingTypeById,
  updateParkingTypeById,
};
