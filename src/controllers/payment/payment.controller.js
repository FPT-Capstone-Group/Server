const { Payment, PaymentHistory, Registration } = require("../../models");
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
const getAmountByRegistrationId = async (registrationId) => {
  const registration = await Registration.findOne({
    attributes: ["amount"],
    where: { registrationId },
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  return registration.amount;
};
// Main function
const processPayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { paymentMethod, registrationId } = req.body;
    if (!registrationId) {
      return errorResponse(req, res, "registrationId is required", 400);
    }

    // Fetch the fee amount based on the registrationId
    const amount = await getAmountByRegistrationId(registrationId);
    // Check if the registration is already completed
    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    // Registration is already completed, do not allow new payment
    if (registration.registrationStatus === "Active") {
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
        paymentDate: new Date().toISOString(),
        status: "Success", // Assuming it's successful since it's a third-party payment
        paymentMethod,
        registrationId,
        feeId,
      },
      { transaction: t }
    );

    // Create a payment history entry
    await PaymentHistory.create(
      {
        eventType: "Payment Success",
        eventTime: new Date().toISOString(),
        details: "Payment successfully",
        paymentId: newPayment.paymentId,
        status: "Success",
      },
      { transaction: t }
    );

    await t.commit();

    const formattedPayment = formatPayment(newPayment);
    return successResponse(req, res, formattedPayment, 200);
  } catch (error) {
    console.error(error);

    // Rollback the transaction in case of an error
    await t.rollback();

    // Handle errors
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  processPayment,
};
