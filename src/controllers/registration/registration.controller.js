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
const createOwnerFromRegistration = async (registration, bike, transaction) => {
  const associatedUser = await User.findByPk(registration.userId);
  return await Owner.create(
    {
      fullName: associatedUser.fullName,
      gender: registration.gender,
      relationship: "Owner", // Default to owner when created
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
        registrationStatus: "Created",
        expiredDate,
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
      "Created",
      "none",
      newRegistration.registrationId,
      t
    );

    const amount = fee.amount;
    await t.commit();
    const formattedRegistration = formatRegistration(newRegistration);
    return successResponse(
      req,
      res,
      {
        registration: formattedRegistration,
        amount,
      },
      201
    );
  } catch (error) {
    console.error(error);
    await t.rollback();
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

//  Verify registration, change status pending to verified,wait to payment....
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
    if (registration.registrationStatus === "Verified") {
      return errorResponse(req, res, "Registration is already verified", 400);
    }

    // Update registration status to "verified"
    registration.registrationStatus = "Verified";
    await registration.save({ transaction: t });

    // Create Registration History
    await createRegistrationHistory(
      "Verified",
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
    if (!successfulPayment) {
      return errorResponse(req, res, "Payment not successful", 400);
    }
    registration.registrationStatus = "Active";
    // Update the approvedBy to the current user's id - Is admin Id since admin is the one who accesses this route
    registration.approvedBy = `${req.user.fullName}`;
    await registration.save({ transaction: t });

    // Create a registration history
    await createRegistrationHistory(
      "Active",
      req.user.fullName,
      registration.registrationId,
      t
    );
    //Create owner and bike related to the registration
    const newBike = await createBikeFromRegistration(registration, t);
    const newOwner = await createOwnerFromRegistration(
      registration,
      newBike,
      req.body.ownerFaceImage,
      t
    );
    // Assign Card for bike missing
    // ...

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
    // Check if the registration is already verified
    if (registration.registrationStatus === "Disable") {
      return errorResponse(req, res, "Registration is already Disabled", 400);
    }
    // Update the registrationStatus to "Disable"
    registration.registrationStatus = "Disable";
    await registration.save({ transaction: t });
    // Create Registration History
    await createRegistrationHistory(
      "Disable",
      req.user.fullName,
      registration.registrationId
    );
    // Create Registration History for the verification
    await createRegistrationHistory(
      "Verified",
      req.user.userId,
      registrationId,
      t
    );
    await t.commit();
    const formattedRegistration = formatRegistration(registration);
    return successResponse(req, res, { registration: formattedRegistration });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Admin - User view a specific registration (Need to check admin role and user role here)
// need to display if have payment or not, if have payment we get amount in payment, if not have payment we get amount in fee
const getUserRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = await Registration.findByPk(registrationId);

    if (!registration) {
      return errorResponse(req, res, "Registration not found", 404);
    }
    const formattedRegistration = formatRegistration(registration);
    return successResponse(req, res, { registration: formattedRegistration });
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
  verifyRegistration,
};
