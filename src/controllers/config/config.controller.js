const {
    successResponse,
    errorResponse,
    formatToMoment,
} = require("../../helpers");
const sequelize = require("../../config/sequelize");
const {Application} = require("../../models");

//Get all application message
const getAllApplicationMessages = async (req, res) => {
    try {
        const {applicationType} = req.query
        const allMessages = await A.findAll();

        if (!allCards || allCards.length === 0) {
            return errorResponse(req, res, "No Cards", 404);
        }
        const formattedCards = allCards.map((card) => formatCard(card));
        return successResponse(req, res, formattedCards, 200);
    } catch (error) {
        console.error("Internal Server Error:", error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};