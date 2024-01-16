// controllers/cardController.js

const {Card, CardHistory, ParkingType, Bike, ParkingOrder} = require("../../models");
const {
    successResponse,
    errorResponse,
    formatToMoment,
} = require("../../helpers");
const sequelize = require("../../config/sequelize");
const {Op} = require("sequelize");

// Sub func
const formatCard = (card, plateNumber) => {
    return {
        ...card.toJSON(),
        plateNumber: plateNumber,
        createdAt: formatToMoment(card.createdAt),
        updatedAt: formatToMoment(card.updatedAt),
    };
};

const formatCardHitory = (cardHistory) => {
    return {
        ...cardHistory.toJSON(),
        createdAt: formatToMoment(cardHistory.createdAt),
        updatedAt: formatToMoment(cardHistory.updatedAt),
    };
};
// Create a new card
const createCard = async (req, res) => {
    const t = await sequelize.transaction();
    const newCards = [];
    try {
        for (const {cardId} of req.body) {
            const currentDate = new Date();
            const newCard = await Card.create(
                {
                    cardId: cardId,
                    cardStatus: "active",
                    createdAt: currentDate,
                    updatedAt: currentDate,
                },
                {transaction: t, ignoreDuplicates: true} // Use for ignore duplicate card
            );
            newCards.push(newCard);
            if (newCard) {
                await CardHistory.create(
                    {
                        event: "Card Created",
                        cardId: newCard.cardId,
                        updatedAt: currentDate,
                        approvedBy: req.user.userFullName,
                    },
                    {transaction: t}
                );
            }
        }

        await t.commit();
        return successResponse(req, res, newCards.cardId, 201);
    } catch (error) {
        console.error(error);
        await t.rollback();
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Get all cards
const getAllCards = async (req, res) => {
    try {
        const allCards = await Card.findAll({
            include: {
                model: Bike,
                attributes: ["plateNumber"],
                order: [["updatedAt", "DESC"]],
            },
        });

        if (!allCards || allCards.length === 0) {
            return errorResponse(req, res, "No Cards", 404);
        }
        const formattedCards = [];
        for (const card of allCards) {
            let plateNumber = "";
            if (card.bikeId) {
                const bike = await Bike.findByPk(card.bikeId);
                plateNumber = bike.plateNumber;
            }
            const formattedCard = formatCard(card, plateNumber);
            formattedCards.push(formattedCard);
        }
        return successResponse(req, res, {cards: formattedCards}, 200);
    } catch (error) {
        console.error("Internal Server Error:", error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};
// Get all cards active
const getAllActiveCards = async (req, res) => {
    try {
        const activeCards = await Card.findAll({
            where: {
                cardStatus: "active",
            },
        });

        if (!activeCards || activeCards.length === 0) {
            return errorResponse(req, res, "No Active Cards", 404);
        }

        const formattedActiveCards = activeCards.map((card) => formatCard(card));
        return successResponse(
            req,
            res,
            {activeCards: formattedActiveCards},
            200
        );
    } catch (error) {
        console.error("Internal Server Error:", error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Get all cards for a user
const getAllUserCards = async (req, res) => {
    try {
        const userId = req.user.userId;

        const userCards = await Card.findAll({
            where: {userId},
        });

        if (!userCards) {
            return errorResponse(req, res, "Cards not found", 404);
        }
        const formattedCards = userCards.map((card) => formatCard(card));
        return successResponse(req, res, {cards: formattedCards}, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Admin get details of a specific card
const getCardDetails = async (req, res) => {
    try {
        const {cardId} = req.query;
        const card = await Card.findByPk(cardId);
        if (!card) {
            return errorResponse(req, res, "Card not found", 404);
        }

        if (card.cardStatus === "assigned") {
            const bike = await Bike.findByPk(card.bikeId);
            const parkingOrder = await ParkingOrder.findOne({
                where: {
                    bikeId: bike.bikeId,
                    parkingOrderStatus: {
                        [Op.or]: ["active", "pending"]
                    },
                },
            });

            const parkingType = await ParkingType.findByPk(parkingOrder.parkingTypeId);
            return successResponse(
                req,
                res,
                {
                    cardId: cardId,
                    cardStatus: card.cardStatus,
                    parkingTypeGroup: parkingType.parkingTypeGroup,
                },
                200
            );

        }

        // const formattedCard = formatCard(card);
        return successResponse(
            req,
            res,
            {
                cardId: cardId,
                cardStatus: card.cardStatus,
                parkingTypeGroup: "guest",
            },
            200
        );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Update card details
const updateCard = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {cardId} = req.params;
        const {cardStatus} = req.body;

        const card = await Card.findByPk(cardId);

        if (!card) {
            return errorResponse(req, res, "Card not found", 404);
        }

        card.cardStatus = cardStatus

        await card.save({transaction: t});

        await CardHistory.create(
            {
                event: "Card status updated to : " + cardStatus,
                cardId: card.cardId,
                approvedBy: req.user.userFullName,
            },
            {transaction: t}
        );

        await t.commit();
        const formattedCard = formatCard(card);
        return successResponse(req, res, {card: formattedCard}, 200);
    } catch (error) {
        console.error(error);
        await t.rollback();
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

// Delete a card
const revokeCardByPlateNumber = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {plateNumber} = req.query;
        const bike = await Bike.findOne({
            where: {plateNumber: plateNumber},
        });

        const cards = await Card.findAll({
            where: {bikeId: bike.bikeId},
        });
        if (!cards || cards.length === 0) {
            return errorResponse(req, res, "No cards found", 404);
        }

        for (const card of cards) {
            card.bikeId = null;
            card.cardStatus = "active";
            await card.save({transaction: t});

            await CardHistory.create(
                {
                    event: "Card Revoked",
                    cardId: card.cardId,
                    approvedBy: req.user.userFullName,
                },
                {transaction: t}
            );
        }

        await t.commit();

        return successResponse(req, res, "Cards revoked successfully", 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const revokeCardByCardId = async (req, res) => {

    const t = await sequelize.transaction();

    try {
        const {cardId} = req.query;

        const card = await Card.findByPk(cardId);
        if (!card) {
            return errorResponse(req, res, "Card not found", 404);
        }
        card.bikeId = null;
        card.cardStatus = "active";

        await card.save({transaction: t});

        await CardHistory.create(
            {
                event: "Card Revoked",
                cardId: card.cardId,
                approvedBy: req.user.userFullName,
            },
            {transaction: t}
        );

        await t.commit();

        return successResponse(req, res, "Cards revoked successfully", 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const autoAssignCard = async (bikeId) => {
    const t = await sequelize.transaction();

    try {

        const existingAssignedCard = await Card.findOne({
            where: {
                bikeId: bikeId
            },
        });

        if (existingAssignedCard) {
            return;
        }

        const card = await Card.findOne({
            where: {
                cardStatus: "active",
                bikeId: null
            },
        });

        if (!card) {
            throw new Error("No card available");
        }
        card.bikeId = bikeId;
        card.cardStatus = "assigned";

        await card.save({transaction: t});

        const bike = await Bike.findByPk(bikeId);

        await CardHistory.create(
            {
                event: "Card Assigned to Bike with Plate Number: " + bike.plateNumber,
                cardId: card.cardId,
                approvedBy: "auto",
            },
            {transaction: t}
        );
        await t.commit();

    } catch (error) {
        console.error(error);
    }
};

// Admin Assign Card - for user, list bike they own, then assign card
const assignCardToBike = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {plateNumber, cardId} = req.body;

        // Find the bike by plateNumber
        const bike = await Bike.findOne({where: {plateNumber}});
        if (!bike) {
            return errorResponse(req, res, "Bike not found", 404);
        }

        const parkingOrder = await ParkingOrder.findOne({
            where: {
                bikeId: bike.bikeId,
            },
        });

        if (!parkingOrder) {
            return errorResponse(req, res, "Can not assign card. Bike has no parking order", 404);
        }

        // Find the card by ID
        const card = await Card.findByPk(cardId);
        if (!card) {
            return errorResponse(req, res, "Card not found", 404);
        }

        // Check if the card is already assigned to another bike
        if (card.bikeId !== null) {
            return errorResponse(
                req,
                res,
                "Card is already assigned to another bike",
                400
            );
        }

        // Assign the card to the bike
        card.bikeId = bike.bikeId;
        card.cardStatus = "assigned";
        await card.save({transaction: t});
        await CardHistory.create(
            {
                event: "Card assigned to Bike with Plate Number: " + bike.plateNumber,
                cardId: card.cardId,
                approvedBy: req.user.userFullName,
            },
            {transaction: t}
        );

        t.commit();

        return successResponse(req, res, "Card assigned to bike successfully", 200);
    } catch (error) {
        console.error(error);
        t.rollback();
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const getAllCardsByBikeId = async (req, res) => {
    try {
        const {bikeId} = req.query;
        const bike = await Bike.findByPk(bikeId);
        if (!bike) {
            return errorResponse(req, res, `No bike id ${bikeId} found`, 404);
        }
        const cards = await Card.findAll({
            where: {bikeId: bikeId},
        });

        return successResponse(req, res, cards, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};

const getCardHistory = async (req, res) => {
    try {
        const {cardId} = req.params;
        const card = await Card.findByPk(cardId);
        if (!card) {
            return errorResponse(req, res, `No card id ${cardId} found`, 404);
        }
        const cardHistories = await CardHistory.findAll({
            where: {cardId: cardId},
        });
        const formattedCardHistories = cardHistories.map((cardHistory) => formatCardHitory(cardHistory));

        return successResponse(req, res, formattedCardHistories, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, "Internal Server Error", 500, error);
    }
};


module.exports = {
    createCard,
    getAllUserCards,
    getAllCardsByBikeId,
    getCardDetails,
    updateCard,
    revokeCardByPlateNumber,
    revokeCardByCardId,
    getAllCards,
    getAllActiveCards,
    assignCardToBike,
    autoAssignCard,
    getCardHistory
};
