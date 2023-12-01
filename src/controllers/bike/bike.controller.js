// bike.controller.js
const { Bike } = require("../../models");
const { successResponse, errorResponse } = require("../../helpers");

const createBike = async (req, res) => {
  try {
    const { plateNumber } = req.body;
    const newBike = await Bike.create({ plateNumber });
    return successResponse(req, res, newBike, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

const getPlateNumberByCardId = async (req, res) => {
  try {
    const { cardId } = req.query;
    const bike = await Bike.findOne({
      where : { cardId: cardId },
      attributes: ['plateNumber']
    });
    return successResponse(req, res, bike.plateNumber, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

const getAllBikesForUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Retrieve all bikes associated with the user
    const userBikes = await Bike.findAll({
      where: { userId },
    });

    return successResponse(req, res, userBikes, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = { getAllBikesForUser, createBike, getPlateNumberByCardId };
