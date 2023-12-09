// controllers/paymentHistoryController.js
const { PaymentHistory, Payment, Registration } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");

// Sub func
const formatPaymentHistory = (paymentHistory) => {
  const formattedPaymentHistory = {
    ...paymentHistory.toJSON(),
    createdAt: formatToMoment(paymentHistory.createdAt),
    updatedAt: formatToMoment(paymentHistory.updatedAt),
  };
  return formattedPaymentHistory;
};

// Main func
const getAllPaymentHistoryForCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch payment history based on the user ID
    const paymentHistory = await PaymentHistory.findAll({
      include: [
        {
          model: Payment,
          include: [
            {
              model: Registration,
              where: { userId: userId },
            },
          ],
        },
      ],
    });
    const formattedPaymentHistory = paymentHistory.map((history) =>
      formatPaymentHistory(history)
    );
    return successResponse(
      req,
      res,
      { paymentHistories: formattedPaymentHistory },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Admin get payment history
const getPaymentHistoryById = async (req, res) => {
  try {
    const { paymentHistoryId } = req.params;

    // Fetch a specific payment history based on the ID
    const paymentHistory = await PaymentHistory.findByPk(paymentHistoryId);

    if (!paymentHistory) {
      return errorResponse(req, res, "Payment history not found", 404);
    }
    const formattedPaymentHistory = formatPaymentHistory(paymentHistory);
    return successResponse(
      req,
      res,
      { paymentHistory: formattedPaymentHistory },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Admin get all payment history
const getAllPaymentHistories = async (req, res) => {
  try {
    // Fetch payment history
    const paymentHistories = await PaymentHistory.findAll({});
    const formattedPaymentHistory = paymentHistories.map((history) =>
      formatPaymentHistory(history)
    );
    return successResponse(
      req,
      res,
      { paymentHistories: formattedPaymentHistory },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
module.exports = {
  getAllPaymentHistoryForCurrentUser,
  getPaymentHistoryById,
  getAllPaymentHistories,
};
