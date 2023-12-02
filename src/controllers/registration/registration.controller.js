const {
  Registration,
  Bike,
  Owner,
  Payment,
  RegistrationHistory,
  Fee,
  User,
} = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");
const fs = require("fs");
const sequelize = require("../../config/sequelize");

//sub func
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

//main func
const createRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      plateNumber,
      feeId,
      model,
      registrationNumber,
      manufacture,
      gender,
    } = req.body;
    // Check if the plateNumber already exists in the Bike model
    const existingBike = await Bike.findOne({
      where: { plateNumber },
    });
    if (existingBike) {
      await t.rollback();
      return errorResponse(req, res, "Plate number already exists", 400);
    }

    let faceImageBase64 = "";
    if (req.file && req.file.buffer) {
      faceImageBase64 = req.file.buffer.toString("base64");
    } else {
      console.log("No file received or buffer is undefined");
    }

    // expireDate is in the current Date plus one year, renew every year
    const expiredDate = new Date();
    expiredDate.setFullYear(expiredDate.getFullYear() + 1);

    // Fetch the fee for the registration, if have many branch condition here
    const fee = await Fee.findOne({ where: { feeId: feeId } });
    if (!fee) {
      return errorResponse(req, res, "Fee not found", 404);
    }

    // Create a new registration
    const newRegistration = await Registration.create(
      {
        registrationStatus: "pending",
        expiredDate,
        approvedBy: "none",
        plateNumber,
        model,
        registrationNumber,
        manufacture,
        gender,
        faceImage: faceImageBase64,
        userId: req.user.userId,
        amount: fee.amount,
      },
      { transaction: t }
    );

    // Create Registration History
    await createRegistrationHistory(
      "pending",
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
        fee,
      },
      201
    );
  } catch (error) {
    console.error(error);
    await t.rollback();
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Approve registration, change status pending to verified,wait to payment....
const approveRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { registrationId } = req.params;
    // Find the registration by ID
    const registration = await Registration.findByPk(registrationId);

    if (!registration) {
      await t.rollback();
      return errorResponse(req, res, "Registration not found", 404);
    }

    // Check if the registration is already verified
    if (registration.registrationStatus === "verified") {
      await t.rollback();
      return errorResponse(req, res, "Registration is already verified", 400);
    }

    // Update registration status to "verified"
    registration.registrationStatus = "verified";
    await registration.save({ transaction: t });

    // Create Registration History for the verification
    await createRegistrationHistory(
      "verified",
      req.user.userId,
      registrationId,
      t
    );

    await t.commit();
    const formattedRegistration = formatRegistration(registration);
    return successResponse(
      req,
      res,
      { registration: formattedRegistration },
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
    return successResponse(req, res, formattedRegistrations, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Admin tu di check, them notification o day
const updateRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { registrationId } = req.params;
    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    const successfulPayment = await Payment.findOne({
      where: { registrationId, status: "Success" },
    });
    if (successfulPayment) {
      // Update the registrationStatus to "Active"
      registration.registrationStatus = "Active";
      // Update the approvedBy to the current user's id - Is admin Id since admin is the one who accesses this route
      registration.approvedBy = `${req.user.fullName}`;
      registration.hasPayment = true;
      await registration.save({ transaction: t });

      // Create a registration history
      await createRegistrationHistory(
        "Active",
        req.user.fullName,
        registration.registrationId,
        t
      );
      //Create owner and bike related to the registration
      const newBike = await Bike.create(
        {
          plateNumber: registration.plateNumber,
          model: registration.model,
          manufacture: registration.manufacture,
          registrationNumber: registration.registrationNumber,
          userId: registration.userId,
        },
        { transaction: t }
      );
      const associatedUser = await User.findByPk(registration.userId);
      const newOwner = await Owner.create(
        {
          fullName: associatedUser.fullName,
          gender: registration.gender,
          relationship: "Owner", // Default to owner when created
          // ownerFaceImage: registration.faceImage,
          ownerFaceImage: "Update later",
          bikeId: newBike.id,
        },

        { transaction: t }
      );

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
    } else {
      return errorResponse(req, res, "Payment not successful", 400);
    }
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Admin disable a specific registration
const disableRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    // Update the registrationStatus to "Disable"
    registration.registrationStatus = "Disable";

    await registration.save();
    await createRegistrationHistory(
      "Disable",
      req.user.fullName,
      registration.registrationId
    );
    const formattedRegistration = formatRegistration(registration);
    return successResponse(req, res, formattedRegistration);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Admin - User view a specific registration (Need to check admin role and user role here)
const getUserRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = await Registration.findByPk(registrationId);

    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    const formattedRegistration = formatRegistration(registration);
    return successResponse(req, res, formattedRegistration);
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
  updateRegistration,
  disableRegistration,
  getAllUserRegistration,
  allRegistration,
  getUserRegistration,
  createRegistrationHistory,
  approveRegistration,
};
