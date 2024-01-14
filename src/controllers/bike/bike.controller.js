// bike.controller.js
const {Bike, Card, Registration} = require("../../models");
const {
    successResponse,
    errorResponse,
    formatToMoment,
} = require("../../helpers");

// Sub func
const formatBike = (bike) => {
    return {
        ...bike.toJSON(),
        createdAt: formatToMoment(bike.createdAt),
        updatedAt: formatToMoment(bike.updatedAt),
    };
};
const createBike = async (req, res) => {
    try {
        const {plateNumber} = req.body;
        const newBike = await Bike.create({plateNumber});
        const formattedBike = formatBike(newBike);
        return successResponse(req, res, {bike: formattedBike}, 201);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const getAllBikesForUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Retrieve all bikes associated with the user
        const userRegistrations = await Registration.findAll({
            include: {
                model: Bike,
            },
            where: {
                userId,
                registrationStatus: "verified",
            },
        });
        const formattedBikes = userRegistrations.map((registration) => formatBike(registration.Bike));
        return successResponse(req, res, {bikes: formattedBikes}, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const getAllBikesByCard = async (req, res) => {
    try {
        const {cardId} = req.query;
        const card = await Card.findOne({
            where: {cardId, userId: req.user.userId},
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
            where: {cardId},
        });
        if (!bikes || bikes.length === 0) {
            return errorResponse(req, res, "No bikes found for the card", 404);
        }
        const formattedBikes = bikes.map((bike) => formatBike(bike));
        return successResponse(req, res, {bikes: formattedBikes}, 200);
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

const getPlateNumberByCard = async (req, res) => {
    try {
        const {cardId} = req.query;
        const card = await Card.findByPk(cardId);
        if (!card) {
            return errorResponse(req, res, `No card found with ID: ${cardId}`, 404);
        }
        const bike = await Bike.findByPk(card.bikeId);
        if (!bike) {
            return errorResponse(
                req,
                res,
                `No plate number found for the card ${cardId}`,
                404
            );
        }

        if (bike.status === "inactive")
            return errorResponse(req, res, "inactive bike", 404);
        return successResponse(req, res, bike.plateNumber, 200);
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

// Admin get All cards
const getAllBikes = async (req, res) => {
    try {
        // Retrieve all bikes
        const allBikes = await Bike.findAll();

        if (!allBikes || allBikes.length === 0) {
            return errorResponse(req, res, "No bikes found", 404);
        }

        const formattedBikes = allBikes.map((bike) => formatBike(bike));
        return successResponse(req, res, {bikes: formattedBikes}, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};
const getBikeInfo = async (req, res) => {
    try {
        const {bikeId} = req.params;

        // Retrieve the bike
        const bike = await Bike.findByPk(bikeId);

        if (!bike) {
            return errorResponse(req, res, `No bike found with ID: ${bikeId}`, 404);
        }

        const formattedBike = formatBike(bike);

        return successResponse(req, res, {bike: formattedBike}, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const updateBike = async (req, res) => {
    try {
        const {bikeId} = req.params;
        const {plateNumber, bikeStatus, model, registrationNumber, manufacturer} = req.body;

        // Retrieve the bike
        const bike = await Bike.findByPk(bikeId);

        if (!bike) {
            return errorResponse(req, res, `No bike found with ID: ${bikeId}`, 404);
        }

        // Update the bike
        await bike.update({plateNumber, bikeStatus, model, registrationNumber, manufacturer});

        const formattedBike = formatBike(bike);

        return successResponse(req, res, {bike: formattedBike}, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
}

const activateBike = async (req, res) => {
    try {
        const {bikeId} = req.params;
        const bike = await Bike.findByPk(bikeId);
        if (!bike) {
            return errorResponse(req, res, `No bike found with ID: ${bikeId}`, 404);
        }
        // Update the bike
        await bike.update({bikeStatus: "active"});
        const formattedBike = formatBike(bike);
        return successResponse(req, res, {bike: formattedBike}, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }

}

const deactivateBike = async (req, res) => {
    try {
        const {bikeId} = req.params;
        const bike = await Bike.findByPk(bikeId);
        if (!bike) {
            return errorResponse(req, res, `No bike found with ID: ${bikeId}`, 404);
        }
        // Update the bike
        await bike.update({bikeStatus: "inactive"});
        const formattedBike = formatBike(bike);
        return successResponse(req, res, {bike: formattedBike}, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
}

module.exports = {
    getAllBikesForUser,
    createBike,
    getAllBikesByCard,
    getPlateNumberByCard,
    getAllBikes,
    getBikeInfo,
    updateBike,
    activateBike,
    deactivateBike,
};
