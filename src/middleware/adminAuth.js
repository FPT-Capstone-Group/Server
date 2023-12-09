import { errorResponse } from "../helpers";
import { Role, User } from "../models";

const adminAuth = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Check if the user has the 'Admin' role directly
    const isAdmin = await Role.findOne({
      where: { name: "admin" },
      include: [
        {
          model: User,
          where: { userId },
        },
      ],
    });

    if (isAdmin) {
      return next(); // Call the next middleware
    }

    // If the user doesn't have the 'Admin' role, send an error response
    return errorResponse(req, res, "You don't have admin access", 401);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

export default adminAuth;
