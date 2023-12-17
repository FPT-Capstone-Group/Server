// bike.controller.js
const { Bike, Card } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");

// Sub func
const formatBike = (bike) => {
  const formattedBike = {
    ...bike.toJSON(),
    createdAt: formatToMoment(bike.createdAt),
    updatedAt: formatToMoment(bike.updatedAt),
  };
  return formattedBike;
};
const createBike = async (req, res) => {
  try {
    const { plateNumber } = req.body;
    const newBike = await Bike.create({ plateNumber });
    const formattedBike = formatBike(newBike);
    return successResponse(req, res, { bike: formattedBike }, 201);
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
    const formattedBikes = userBikes.map((bike) => formatBike(bike));
    return successResponse(req, res, { bikes: formattedBikes }, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
const getAllBikesByCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findOne({
      where: { cardId, userId: req.user.userId },
    });
    if (!card) {
      return errorResponse(
        req,
        res,
        "Card not found or not associated with the user",
        404
      );
    }
    const bikes = await Bike.findAll({
      where: { cardId },
    });
    if (!bikes || bikes.length === 0) {
      return errorResponse(req, res, "No bikes found for the card", 404);
    }
    const formattedBikes = bikes.map((bike) => formatBike(bike));
    return successResponse(req, res, { bikes: formattedBikes }, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const getPlateNumberByCard = async (req, res) => {
  try {
    const { cardId } = req.query;
    const card = await Card.findByPk(cardId);
    console.log(card)
    if (!card) {
      return errorResponse(req, res, `No card found with ID: ${cardId}`, 404);
    }
    const bike = await Bike.findByPk(card.bikeId)
    if (!bike) {
      return errorResponse(req, res, `No plate number found for the card ${cardId}`, 404);
    }

    if(bike.status === 'inactive') return errorResponse(req, res, "inactive bike", 404);
    return successResponse(req, res, bike.plateNumber, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

module.exports = { getAllBikesForUser, createBike, getAllBikesByCard, getPlateNumberByCard };
