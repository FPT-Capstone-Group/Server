const { User, UserHistory } = require("../../models");
const {
  successResponse,
  errorResponse,
  formatToMoment,
} = require("../../helpers");

// Sub func
const formatUserHistory = (userHistory) => {
  const formattedUserHistory = {
    ...userHistory.toJSON(),
    createdAt: formatToMoment(userHistory.createdAt),
    updatedAt: formatToMoment(userHistory.updatedAt),
  };
  return formattedUserHistory;
};

// Admin get All User History for a User
const getAllUserHistoryForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Retrieve the user
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(req, res, "No user found", 404);
    }

    // Retrieve all user history for the user
    const userHistory = await UserHistory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    const formattedUserHistory = userHistory.map((history) =>
      formatUserHistory(history)
    );

    return successResponse(
      req,
      res,
      { userHistories: formattedUserHistory },
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  getAllUserHistoryForUser, // Add this line to export the new function
};
