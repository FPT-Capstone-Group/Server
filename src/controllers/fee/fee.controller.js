// controllers/feeController.js
const { Fee } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");

// Sub function
const formatFee = (fee) => {
  const formattedFee = {
    ...fee.toJSON(),
    createdAt: formatToMoment(fee.createdAt),
    updatedAt: formatToMoment(fee.updatedAt),
  };
  return formattedFee;
};
// Main function
// Create a new fee
const createFee = async (req, res) => {
  try {
    const { feeName, amount, description, feeMethod } = req.body;

    const newFee = await Fee.create({
      feeName,
      amount,
      description,
      feeDate: new Date().toISOString(),
      feeMethod,
    });
    const formattedFee = formatFee(newFee);
    return successResponse(req, res, formattedFee, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Get all fees
const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.findAll();
    const formattedFees = fees.map((fee) => formatFee(fee));
    return successResponse(req, res, formattedFees, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Get a specific fee by ID
const getFeeById = async (req, res) => {
  try {
    const { feeId } = req.params;
    const fee = await Fee.findByPk(feeId);

    if (!fee) {
      return errorResponse(req, res, "Fee not found", 404);
    }
    const formattedFee = formatFee(fee);
    return successResponse(req, res, formattedFee, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Update a fee by ID
const updateFeeById = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { feeName, amount, description, feeMethod } = req.body;

    const fee = await Fee.findByPk(feeId);

    if (!fee) {
      return errorResponse(req, res, "Fee not found", 404);
    }

    // Update fee attributes
    fee.feeName = feeName;
    fee.amount = amount;
    fee.description = description;
    fee.feeDate = new Date().toISOString();
    fee.feeMethod = feeMethod;

    await fee.save();
    const formattedFee = formatFee(fee);
    return successResponse(req, res, formattedFee, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Delete a fee by ID
const deleteFeeById = async (req, res) => {
  try {
    const { feeId } = req.params;
    const fee = await Fee.findByPk(feeId);
    if (!fee) {
      return errorResponse(req, res, "Fee not found", 404);
    }
    await fee.destroy();
    return successResponse(req, res, "Fee deleted successfully", 200);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  createFee,
  getAllFees,
  getFeeById,
  updateFeeById,
  deleteFeeById,
};
