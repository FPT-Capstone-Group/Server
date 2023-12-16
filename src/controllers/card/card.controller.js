// controllers/cardController.js

const { Card, CardHistory, ParkingType } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");
const sequelize = require("../../config/sequelize");

// Sub func
const formatCard = (card) => {
  const formattedCard = {
    ...card.toJSON(),
    createdAt: formatToMoment(card.createdAt),
    updatedAt: formatToMoment(card.updatedAt),
  };
  return formattedCard;
};
// Create a new card
const createCard = async (req, res) => {
  const t = await sequelize.transaction();
  const newCards = [];
  try {
    const parkingType = await ParkingType.findOne({ where: { name: "guest" } });
    console.log(parkingType);
    for (const { cardId } of req.body) {
      const currentDate = new Date();
      const newCard = await Card.create(
        {
          cardId: cardId,
          startDate: currentDate,
          status: "active",
          createdAt: currentDate,
          updatedAt: currentDate,
          parkingTypeId: parkingType.parkingTypeId,
        },
        { transaction: t, ignoreDuplicates: true } // Use for ignore duplicate card
      );
      newCards.push(newCard);
      if (newCard) {
        await CardHistory.create(
          {
            eventType: "Card Created",
            cardId: newCard.cardId,
            updatedAt: currentDate,
            approvedBy: "auto",
          },
          { transaction: t }
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
    const allCards = await Card.findAll();

    if (!allCards || allCards.length === 0) {
      return errorResponse(req, res, "No Cards", 404);
    }
    const formattedCards = allCards.map((card) => formatCard(card));
    return successResponse(req, res, { cards: formattedCards }, 200);
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
        status: "active",
      },
    });

    if (!activeCards || activeCards.length === 0) {
      return errorResponse(req, res, "No Active Cards", 404);
    }

    const formattedActiveCards = activeCards.map((card) => formatCard(card));
    return successResponse(
      req,
      res,
      { activeCards: formattedActiveCards },
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
      where: { userId },
    });

    if (!userCards) {
      return errorResponse(req, res, "Cards not found", 404);
    }
    const formattedCards = userCards.map((card) => formatCard(card));
    return successResponse(req, res, { cards: formattedCards }, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Admin get details of a specific card
const getCardDetails = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findByPk(cardId);
    if (!card) {
      return errorResponse(req, res, "Card not found", 404);
    }
    const parkingType = await ParkingType.findByPk(card.parkingTypeId);
    // const formattedCard = formatCard(card);
    return successResponse(
      req,
      res,
      {
        cardId: cardId,
        status: card.status,
        parkingTypeName: parkingType.name,
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
    const { cardId } = req.params;
    const { expiredDate, cardType } = req.body;

    const card = await Card.findByPk(cardId);

    if (!card) {
      return errorResponse(req, res, "Card not found", 404);
    }

    card.expiredDate = expiredDate;
    card.cardType = cardType;

    await card.save({ transaction: t });

    await CardHistory.create(
      {
        eventType: "Card Updated",
        eventTime: new Date().toISOString(),
        details: "Card updated successfully",
        cardId: card.cardId,
        status: card.status,
      },
      { transaction: t }
    );

    await t.commit();
    const formattedCard = formatCard(card);
    return successResponse(req, res, { card: formattedCard }, 200);
  } catch (error) {
    console.error(error);
    await t.rollback();
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Delete a card
const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findByPk(cardId);

    if (!card) {
      return errorResponse(req, res, "Card not found", 404);
    }

    await card.destroy();

    return successResponse(req, res, "Card deleted successfully", 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  createCard,
  getAllUserCards,
  getCardDetails,
  updateCard,
  deleteCard,
  getAllCards,
  getAllActiveCards,
};
