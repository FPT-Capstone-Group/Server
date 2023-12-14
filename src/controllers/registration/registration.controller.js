const {
  Registration,
  Bike,
  Owner,
  Payment,
  RegistrationHistory,
  Fee,
  User,
  Card,
} = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");
const fs = require("fs");
const sequelize = require("../../config/sequelize");

// Sub func
const createRegistrationHistory = async (
  status,
  approvedBy,
  registrationId,
  t
) => {
  return RegistrationHistory.create(
    {
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedBy,
      registrationId,
    },
    { transaction: t }
  );
};
const formatRegistration = (registration) => {
  const formattedRegistration = {
    ...registration.toJSON(),
    createdAt: formatToMoment(registration.createdAt),
    updatedAt: formatToMoment(registration.updatedAt),
  };

  return formattedRegistration;
};
const createBikeFromRegistration = async (registration, transaction) => {
  return await Bike.create(
    {
      plateNumber: registration.plateNumber,
      model: registration.model,
      manufacture: registration.manufacture,
      registrationNumber: registration.registrationNumber,
      userId: registration.userId,
    },
    { transaction }
  );
};
const createOwnerFromRegistration = async (
  registration,
  bike,
  transaction,
  ownerFaceImage
) => {
  const associatedUser = await User.findByPk(registration.userId);
  return await Owner.create(
    {
      fullName: associatedUser.fullName,
      gender: registration.gender,
      relationship: "owner", // Default to owner when created
      ownerFaceImage,
      bikeId: bike.bikeId,
    },
    { transaction }
  );
};

// Main func
const createRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { plateNumber, model, registrationNumber, manufacture, gender } =
      req.body;
    // Check if the plateNumber already exists in the Bike model (thats mean bike associate with regis active)
    const existingBike = await Bike.findOne({
      where: { plateNumber },
    });
    if (existingBike) {
      return errorResponse(req, res, "Plate number already exists", 400);
    }

    let faceImageBase64 = "";
    if (req.file && req.file.buffer) {
      faceImageBase64 = req.file.buffer.toString("base64");
    } else {
      console.log("No file received or buffer is undefined");
    }

    // Create a new registration
    const newRegistration = await Registration.create(
      {
        registrationStatus: "created",
        approvedBy: "none",
        plateNumber,
        model,
        registrationNumber,
        manufacture,
        gender,
        faceImage: faceImageBase64,
        userId: req.user.userId,
      },
      { transaction: t }
    );

    // Create Registration History
    await createRegistrationHistory(
      "created",
      "none",
      newRegistration.registrationId,
      t
    );
    await t.commit();
    const formattedRegistration = formatRegistration(newRegistration);
    return successResponse(
      req,
      res,
      {
        registration: formattedRegistration,
      },
      201
    );
  } catch (error) {
    console.error(error);
    await t.rollback();
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Admin Verify registration, change status pending to verified,wait to payment....
const verifyRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { registrationId } = req.params;
    const { feeId } = req.body;
    // Find the registration by ID
    const registration = await Registration.findByPk(registrationId);

    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }

    // Check if the registration is already verified
    // Need to check more like rejected status,...
    if (registration.registrationStatus === "verified") {
      return errorResponse(req, res, "Registration is already verified", 400);
    }

    // Update registration status to "verified"
    registration.registrationStatus = "verified";
    await registration.save({ transaction: t });

    // Create Registration History
    await createRegistrationHistory(
      "verified",
      req.user.userId,
      registrationId,
      t
    );
    const fee = await Fee.findOne({ where: { feeId: feeId } });
    if (!fee) {
      return errorResponse(req, res, "Fee not found", 404);
    }
    const amount = fee.amount;

    await t.commit();
    const formattedRegistration = formatRegistration(registration);
    return successResponse(
      req,
      res,
      { registration: formattedRegistration, amount },
      200
    );
  } catch (error) {
    console.error(error);
    await t.rollback();
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// User View all their registration
const getAllUserRegistration = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Fetch the user's registration
    const userRegistration = await Registration.findAll({
      where: { userId },
    });

    if (!userRegistration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    const formattedRegistrations = userRegistration.map((registration) =>
      formatRegistration(registration)
    );
    return successResponse(
      req,
      res,
      { registrations: formattedRegistrations },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// User cancels their registration
const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.query;
    const userId = req.user.userId;

    // Find the registration by ID and user ID
    const registration = await Registration.findOne({
      where: { registrationId, userId },
    });

    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }

    // Check if the registration is in a cancellable state
    if (
      registration.registrationStatus === "paid" ||
      registration.registrationStatus === "active"
    ) {
      return errorResponse(
        req,
        res,
        "Registration cannot be canceled in paid or active status",
        400
      );
    }

    // Update the registration status to "Canceled"
    registration.registrationStatus = "canceled";
    await registration.save();

    return successResponse(req, res, {
      message: "Registration canceled successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Admin tu di check, them notification o day
const activateRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { registrationId } = req.params;
    const { cardId } = req.body;
    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    const successfulPayment = await Payment.findOne({
      where: { registrationId, status: "success" },
    });
    if (!successfulPayment) {
      return errorResponse(req, res, "Payment not successful", 400);
    }
    registration.registrationStatus = "active";

    // Set the expiration date to one month from the current date
    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() + 1);
    registration.expiredDate = expiredDate;

    // Update the approvedBy to the current user's id - Is admin Id since admin is the one who accesses this route
    registration.approvedBy = `${req.user.fullName}`;
    await registration.save({ transaction: t });

    // Create a registration history
    await createRegistrationHistory(
      "active",
      req.user.fullName,
      registration.registrationId,
      t
    );

    // Create owner and bike related to the registration
    const newBike = await createBikeFromRegistration(registration, t);
    const newOwner = await createOwnerFromRegistration(
      registration,
      newBike,
      t,
      registration.faceImage
    );

    const card = await Card.findByPk(cardId);

    if (!card) {
      return errorResponse(req, res, "Card not found", 404);
    }

    if (card.currentStatus === "active") {
      await card.update(
        { currentStatus: "assigned", bikeId: newBike.bikeId },
        { transaction: t }
      );
    } else {
      return errorResponse(req, res, "Card is not active", 400);
    }

    await t.commit();
    const formattedRegistration = formatRegistration(registration);
    return successResponse(
      req,
      res,
      {
        registration: formattedRegistration,
        bike: newBike.toJSON(),
        owner: newOwner.toJSON(),
      },
      200
    );
  } catch (error) {
    console.error(error);
    await t.rollback();
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Admin disable a specific registration
const disableRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { registrationId } = req.params;
    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    // Check if the registration is already disable
    if (registration.registrationStatus === "disable") {
      return errorResponse(req, res, "Registration is already Disabled", 400);
    }
    // Update the registrationStatus to "Disable"
    registration.registrationStatus = "disable";
    await registration.save({ transaction: t });
    // Create Registration History
    await createRegistrationHistory(
      "disable",
      req.user.fullName,
      registration.registrationId
    );
    await t.commit();

    return successResponse(req, res, "Disable registration successfully");
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
const deactiveRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { registrationId } = req.params;
    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    // Check if the registration is already deactive
    if (registration.registrationStatus === "inactive") {
      return errorResponse(req, res, "Registration is already inactive", 400);
    }
    // Update the registrationStatus to "inactive"
    registration.registrationStatus = "inactive";
    await registration.save({ transaction: t });
    // Create Registration History
    await createRegistrationHistory(
      "inactive",
      req.user.fullName,
      registration.registrationId
    );
    // Create Registration History for the verification
    await t.commit();

    return successResponse(req, res, "Deactivated registration successfully");
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Admin rejects a user registration
const rejectRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { message } = req.body;

    // Find the registration by ID
    const registration = await Registration.findByPk(registrationId);

    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    // Check if the registration is already rejected
    if (registration.registrationStatus === "rejected") {
      return errorResponse(req, res, "Registration is already rejected", 400);
    }
    // Update the registration status to "rejected"
    registration.registrationStatus = "rejected";
    await registration.save();

    // Store the rejection message in a variable
    const rejectionMessage = message;
    await registration.save();

    // Store to notification instead return response
    return successResponse(req, res, {
      message: "Registration rejected successfully",
      rejectionMessage,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

//User view a specific registration
const getUserRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.userId;

    const registration = await Registration.findOne({
      where: { registrationId, userId },
    });
    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }

    // Check if there is a successful payment for this registration
    const successfulPayment = await Payment.findOne({
      where: { registrationId, status: "success" },
    });

    let amount = 0;

    if (successfulPayment) {
      // If there is a successful payment, use the payment amount
      amount = successfulPayment.amount;
    } else {
      // If there is no successful payment, use some other logic to determine the amount
      const residentFee = await Fee.findOne({ where: { feeName: "resident" } });
      if (residentFee) {
        // If a fee with the name "resident" is found, use its amount
        amount = residentFee.amount;
      } else {
        // If no "resident" fee is found, ...
        return errorResponse(
          req,
          res,
          "resident package not found",
          404,
          error
        );
      }
    }

    const formattedRegistration = formatRegistration(registration);

    return successResponse(req, res, {
      registration: formattedRegistration,
      amount,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
const AdminGetUserRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }

    // Check if there is a successful payment for this registration
    const successfulPayment = await Payment.findOne({
      where: { registrationId, status: "success" },
    });

    let amount = 0;

    if (successfulPayment) {
      // If there is a successful payment, use the payment amount
      amount = successfulPayment.amount;
    } else {
      // If there is no successful payment, use some other logic to determine the amount
      const residentFee = await Fee.findOne({ where: { feeName: "resident" } });
      if (residentFee) {
        // If a fee with the name "resident" is found, use its amount
        amount = residentFee.amount;
      } else {
        // If no "resident" fee is found, ...
        return errorResponse(
          req,
          res,
          "resident package not found",
          404,
          error
        );
      }
    }

    const formattedRegistration = formatRegistration(registration);

    return successResponse(req, res, {
      registration: formattedRegistration,
      amount,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

//Admin view all
const allRegistration = async (req, res) => {
  try {
    // Retrieve all registrations
    const registrations = await Registration.findAll({
      order: [["createdAt", "DESC"]],
    });
    // Check if there are registrations
    if (registrations.length === 0) {
      return successResponse(req, res, "No active registrations found");
    }
    const formattedRegistrations = registrations.map((registration) =>
      formatRegistration(registration)
    );
    return successResponse(req, res, formattedRegistrations);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
module.exports = {
  createRegistration,
  activateRegistration,
  disableRegistration,
  rejectRegistration,
  getAllUserRegistration,
  allRegistration,
  getUserRegistration,
  createRegistrationHistory,
  verifyRegistration,
  cancelRegistration,
  deactiveRegistration,
  AdminGetUserRegistration,
};
