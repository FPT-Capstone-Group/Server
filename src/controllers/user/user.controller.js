import jwt from "jsonwebtoken";

import { User } from "../../models";
import { Role } from "../../models";
import { UserRole } from "../../models";
import { successResponse, errorResponse, uniqueId } from "../../helpers";
import crypto from "crypto";

// sub function
async function getRoleIdByName(roleName) {
  try {
    const role = await Role.findOne({ where: { name: roleName } });

    if (!role) {
      throw new Error(`Role with name '${roleName}' not found`);
    }

    return role.roleId;
  } catch (error) {
    throw error;
  }
}

// main function
const allUsers = async (req, res) => {
  try {
    const page = req.params.page || 1;
    const limit = 2;
    const users = await User.findAndCountAll({
      order: [
        ["createdAt", "DESC"],
        ["fullName", "ASC"],
      ],
      offset: (page - 1) * limit,
      limit,
    });
    return successResponse(req, res, { users });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const register = async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    const user = await User.scope("withSecretColumns").findOne({
      where: { username },
    });
    if (user) {
      throw new Error("User already exists with same username");
    }
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    const payload = {
      username,
      fullName,
      password: hashedPassword,
      isVerified: false,
      verifyToken: uniqueId(),
    };

    const newUser = await User.create(payload);
    const roleId = await getRoleIdByName("User");
    await UserRole.create({ userId: newUser.userId, roleId });
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
const login = async (req, res) => {
  try {
    const user = await User.scope("withSecretColumns").findOne({
      where: { username: req.body.username },
    });
    if (!user) {
      throw new Error("Incorrect username Id/Password");
    }
    const isPasswordValid =
      crypto.createHash("sha256").update(req.body.password).digest("hex") ===
      user.password;

    if (!isPasswordValid) {
      throw new Error("Incorrect username Id/Password");
    }
    const token = jwt.sign(
      {
        user: {
          userId: user.userId,
          username: user.username,
          createdAt: new Date(),
        },
      },
      process.env.SECRET
    );
    delete user.dataValues.password;
    return successResponse(req, res, { user, token });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const profile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ where: { userId: userId } });
    return successResponse(req, res, { user });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
const changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.scope("withSecretColumns").findOne({
      where: { userId: userId },
    });

    const previousPassMatch =
      crypto.createHash("sha256").update(req.body.oldPassword).digest("hex") ===
      user.password;
    if (!previousPassMatch) {
      throw new Error("Old password is incorrect");
    }

    const newPass = crypto
      .createHash("sha256")
      .update(req.body.newPassword)
      .digest("hex");
    await User.update({ password: newPass }, { where: { id: user.userId } });
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
const verifyUser = async (req, res) => {
  try {
    const { fullName } = req.body;

    // Check if the user is already verified
    if (req.user.isVerified) {
      return errorResponse(req, res, "User is already verified", 400);
    }

    // Check if fullName is provided
    if (!fullName) {
      return errorResponse(
        req,
        res,
        "FullName is required for verification",
        400
      );
    }

    let userToUpdate = req.user;

    // If req.user is not an instance of User, fetch the user from the database
    if (!(userToUpdate instanceof User)) {
      userToUpdate = await User.findByPk(req.user.userId);

      if (!userToUpdate) {
        return errorResponse(req, res, "User not found", 404);
      }
    }

    // Update user information
    await userToUpdate.update({
      fullName: fullName,
      isVerified: true,
    });

    return successResponse(req, res, { message: "User verified successfully" });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Only admin can access this route
const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(req, res, "User not found", 404);
    }
    const userInfo = {
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
    };

    return successResponse(req, res, userInfo);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Only admin can access this route
const activateUser = async (req, res) => {
  try {
    // Check if the logged-in user has admin privileges
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(req, res, "User not found", 404);
    }

    // Activate the user by setting isActive to true
    await user.update({
      isActive: true,
    });

    return successResponse(req, res, {
      message: "User activated successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

// Update current user's fullName and username
const updateUser = async (req, res) => {
  const userId = req.user.userId; // Assuming you have middleware that extracts the user ID from the request

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(req, res, "User not found", 404);
    }

    // Update only the specified fields
    if (req.body.fullName) {
      user.fullName = req.body.fullName;
    }

    if (req.body.username) {
      user.username = req.body.username;
    }

    // Save the changes
    await user.save();

    return successResponse(req, res, user);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  activateUser,
  getUserInfo,
  verifyUser,
  changePassword,
  profile,
  allUsers,
  login,
  register,
  updateUser,
};
