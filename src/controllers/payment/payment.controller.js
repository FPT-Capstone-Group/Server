const { Payment, Registration } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");
const sequelize = require("../../config/sequelize");

// Sub function
const formatPayment = (payment) => {
  const formattedPayment = {
    ...payment.toJSON(),
    createdAt: formatToMoment(payment.createdAt),
    updatedAt: formatToMoment(payment.updatedAt),
  };
  return formattedPayment;
};

// Main function
const processPayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { paymentMethod, registrationId, amount } = req.body;
    if (!registrationId || !amount) {
      return errorResponse(
        req,
        res,
        "registrationId and amount are required",
        400
      );
    }

    // Check if the registration is already completed
    const registration = await Registration.findByPk(registrationId);
    // Registration is already completed, do not allow new payment
    if (registration.status === "active") {
      return errorResponse(req, res, "Registration is already completed", 400);
    }

    // Set feeId appropriately based on the amount for now
    let feeId = null;
    if (amount === 300000) {
      feeId = 1; // Set the appropriate feeId based on the amount
    }

    // Create a payment associated with the current user's registration
    const newPayment = await Payment.create(
      {
        amount,
        status: "success", // Assuming it's successful since it's a third-party payment
        paymentMethod,
        registrationId,
      },
      { transaction: t }
    );

    registration.status = "paid";
    await registration.save({ transaction: t });
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
const getPaymentsForRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const payments = await Payment.findAll({
      where: { registrationId },
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
  processPayment,
  getAllPayments,
  getPaymentsForRegistration,
};
