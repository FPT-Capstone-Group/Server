const { FeeHistory } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");

// Sub func
const formatFeeHistory = (feeHistory) => {
  const formattedFeeHistory = {
    ...feeHistory.toJSON(),
    createdAt: formatToMoment(feeHistory.createdAt),
    updatedAt: formatToMoment(feeHistory.updatedAt),
  };

  return formattedFeeHistory;
};
// Main func
const getFeeHistory = async (req, res) => {
  try {
    const { feeId } = req.params;

    // Retrieve the fee history for the given feeId
    const feeHistories = await FeeHistory.findAll({
      where: { feeId },
      order: [["createdAt", "DESC"]],
    });

    // Check if there are fee history records
    if (feeHistories.length === 0) {
      return successResponse(req, res, "No fee history found");
    }
    const formattedFeeHistory = feeHistories.map((feeHistory) =>
      formatFeeHistory(feeHistory)
    );
    return successResponse(req, res, {
      feeHistories: formattedFeeHistory,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  getFeeHistory,
};
