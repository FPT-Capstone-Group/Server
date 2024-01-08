const { Payment, Registration, ParkingOrder } = require("../../models");
const {autoAssignCard} = require("../../controllers/card/card.controller");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");
const sequelize = require("../../config/sequelize");

// Sub function
const formatPayment = (payment) => {
  return {
    ...payment.toJSON(),
    createdAt: formatToMoment(payment.createdAt),
    updatedAt: formatToMoment(payment.updatedAt),
  };
};

// Main function
const processParkingOrderPayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { transactionId, paymentMethod, parkingOrderId, paymentAmount } = req.body;
    if (!parkingOrderId || !paymentAmount) {
      return errorResponse(
        req,
        res,
        "parkingOrderId and amount are required",
        400
      );
    }

    const parkingOrder = await ParkingOrder.findByPk(parkingOrderId);
    if (!parkingOrder) {
      return errorResponse(req, res, "Invalid parkingOrderId", 400);
    }

    // Parking Order is already completed, do not allow new payment
    if (parkingOrder.status !== "pending") {
      return errorResponse(req, res, "Parking Order is already completed", 400);
    }

    // Create a payment associated with the current user's registration
    const newPayment = await Payment.create(
      {
        transactionId,
        paymentAmount,
        paymentStatus: "success", // Assuming it's successful since it's a third-party payment
        paymentMethod,
        parkingOrderId,
      },
      { transaction: t }
    );

    parkingOrder.parkingOrderStatus = "active";
    await autoAssignCard(parkingOrder.bikeId);

    await parkingOrder.save({ transaction: t });
    await t.commit();

    const formattedPayment = formatPayment(newPayment);
    return successResponse(req, res, { payment: formattedPayment }, 200);
  } catch (error) {
    console.error(error);

    // Rollback the transaction in case of an error
    await t.rollback();

    // Handle errors
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Function to get all payments for an admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({ order: [["createdAt", "DESC"]] });
    const formattedPayments = payments.map((payment) => formatPayment(payment));

    return successResponse(req, res, formattedPayments, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Function to get payments for a specific registration ID
const getPaymentsForParkingOrder = async (req, res) => {
  try {
    const { parkingOrderId } = req.params;
    const payments = await Payment.findAll({
      where: { parkingOrderId },
      order: [["createdAt", "DESC"]],
    });

    if (!payments) {
      return errorResponse(req, res, "Payments not found", 404);
    }

    const formattedPayments = payments.map((payment) => formatPayment(payment));
    return successResponse(req, res, formattedPayments, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  processParkingOrderPayment,
  getAllPayments,
  getPaymentsForParkingOrder,
};
