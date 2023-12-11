const { RegistrationHistory } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");
const sequelize = require("../../config/sequelize");
// Sub func
const formatRegistrationHistory = (registrationHistory) => {
  const formattedRegistrationHistory = {
    ...registrationHistory.toJSON(),
    createdAt: formatToMoment(registrationHistory.createdAt),
    updatedAt: formatToMoment(registrationHistory.updatedAt),
  };

  return formattedRegistrationHistory;
};
// Main func
const getRegistrationHistory = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Retrieve the registration history for the given registrationId
    const registrationHistories = await RegistrationHistory.findAll({
      where: { registrationId },
      order: [["createdAt", "DESC"]],
    });

    // Check if there are registration history records
    if (registrationHistories.length === 0) {
      return successResponse(req, res, "No registration history found");
    }
    const formattedRegistrationHistory = registrationHistories.map(
      (registrationHistory) => formatRegistrationHistory(registrationHistory)
    );
    return successResponse(req, res, {
      registrationHistories: formattedRegistrationHistory,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  getRegistrationHistory,
};
