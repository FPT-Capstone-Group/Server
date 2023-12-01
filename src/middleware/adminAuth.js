import { errorResponse } from "../helpers";
import { UserRole, Role } from "../models";
const adminAuth = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Check if the user has the 'admin' role
    const isAdmin = await checkUserRole(userId, "Admin");

    if (isAdmin) {
      return next(); // Call the next middleware
    }

    // If the user doesn't have the 'admin' role, send an error response
    return errorResponse(req, res, "You don't have admin access", 401);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Function to check if the user has a specific role
const checkUserRole = async (userId, roleName) => {
  const userRole = await UserRole.findOne({
    where: { userId },
    include: [
      {
        model: Role,
        where: { name: roleName },
      },
    ],
  });

  return !!userRole;
};

export default adminAuth;
