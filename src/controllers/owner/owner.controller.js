// owner.controller.js
const { Owner, Bike } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");
// Sub function
const formatOwner = (owner) => {
  const formattedOwner = {
    ...owner.toJSON(),
    createdAt: formatToMoment(owner.createdAt),
    updatedAt: formatToMoment(owner.updatedAt),
  };
  return formattedOwner;
};
const createOwner = async (req, res) => {
  const { fullName, plateNumber, ownerFaceImage, relationship, gender } =
    req.body;
  try {
    if (!plateNumber) {
      return errorResponse(req, res, "Plate number is required", 400);
    }
    // Check if the plateNumber already exists in the Bike model
    const existingBike = await Bike.findOne({
      where: { plateNumber },
    });
    if (!existingBike || existingBike.status !== "Active") {
      return errorResponse(
        req,
        res,
        "Cannot create owner. Invalid plateNumber or bike is not active",
        400
      );
    }
    // Check if the plateNumber is already associated with an owner
    let existingOwner = await Owner.findOne({
      where: { bikeId: existingBike.bikeId },
    });
    if (existingOwner) {
      // If an existing owner is found and check if req.body.relationship is "Owner"
      // Otherwise, the relationship can be anything you want
      if (
        existingOwner.relationship === "owner" &&
        req.body.relationship === "owner"
      ) {
        return errorResponse(
          req,
          res,
          "Cannot create owner. Existing owner is already marked as 'owner'",
          400
        );
      }
    }

    // Create a new owner and associate it with the existing bike
    const newOwner = await Owner.create({
      fullName,
      ownerFaceImage,
      relationship: relationship || "owner",
      gender,
      bikeId: existingBike.bikeId,
    });

    const formattedOwner = formatOwner(newOwner);

    return successResponse(req, res, { owner: formattedOwner }, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Security, admin
const getOwnersByPlateNumber = async (req, res) => {
  try {
    const { plateNumber } = req.query;
    const bike = await Bike.findOne({
      where: { plateNumber },
    });
    if (!bike) {
      return errorResponse(req, res, "No Bike Found", 404);
    }
    const owners = await Owner.findAll({
      where: { bikeId: bike.bikeId },
    });
    if (!owners || owners.length === 0) {
      return errorResponse(req, res, "No Owners found", 404);
    }
    // Format dates in each owner before sending the response
    const formattedOwner = owners.map((owner) => formatOwner(owner));
    return successResponse(req, res, { owners: formattedOwner }, 200);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// User
const getOwnersByUsersPlateNumber = async (req, res) => {
  try {
    const { plateNumber } = req.query;
    const user = req.user; 

    // Check if the user owns the bike with the provided plate number
    const bike = await Bike.findOne({
      where: { plateNumber, userId: user.userId },
    });

    if (!bike) {
      return errorResponse(
        req,
        res,
        "The bike is invalid or is not associated with the user",
        404
      );
    }

    const owners = await Owner.findAll({
      where: { bikeId: bike.bikeId },
    });

    if (!owners || owners.length === 0) {
      return errorResponse(req, res, "No Owners found", 404);
    }

    // Format dates in each owner before sending the response
    const formattedOwner = owners.map((owner) => formatOwner(owner));

    return successResponse(req, res, { owners: formattedOwner }, 200);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  createOwner,
  getOwnersByPlateNumber,
  getOwnersByUsersPlateNumber,
};
