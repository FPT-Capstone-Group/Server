const { errorResponse } = require("../helpers");
const { Role, User } = require("../models");

const securityAuth = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Check if the user has the 'Admin' role directly
    const isSecurity = await Role.findOne({
      where: { name: "security" },
      include: [
        {
          model: User,
          where: { userId },
        },
      ],
    });

    if (isSecurity) {
      return next(); // Call the next middleware
    }

    // If the user doesn't have the 'Admin' role, send an error response
    return errorResponse(req, res, "You don't have Security access", 401);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = securityAuth