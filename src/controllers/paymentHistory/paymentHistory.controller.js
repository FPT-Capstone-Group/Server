// controllers/paymentHistoryController.js
const { PaymentHistory, Payment, Registration } = require("../../models");
const { successResponse, errorResponse } = require("../../helpers");

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

    return successResponse(req, res, paymentHistory, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
const getPaymentHistoryById = async (req, res) => {
  try {
    const { paymentHistoryId } = req.params;

    // Fetch a specific payment history based on the ID
    const paymentHistory = await PaymentHistory.findByPk(paymentHistoryId);

    if (!paymentHistory) {
      return errorResponse(req, res, "Payment history not found", 404);
    }

    return successResponse(req, res, paymentHistory, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
module.exports = {
  getAllPaymentHistoryForCurrentUser,
  getPaymentHistoryById,
};
