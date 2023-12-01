// controllers/feeController.js
const { Fee } = require("../../models");
const { successResponse, errorResponse } = require("../../helpers");

// Create a new fee
const createFee = async (req, res) => {
  try {
    const { feeName, amount, description, feeDate, feeMethod } = req.body;

    const newFee = await Fee.create({
      feeName,
      amount,
      description,
      feeDate: new Date().toISOString(),
      feeMethod,
    });

    return successResponse(req, res, newFee, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Get all fees
const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.findAll();
    return successResponse(req, res, fees, 200);
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

    return successResponse(req, res, fee, 200);
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

    return successResponse(req, res, fee, 200);
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
