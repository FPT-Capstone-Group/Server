import jwt from "jsonwebtoken";

import { User } from "../../models";
import { Role } from "../../models";
import { UserRole } from "../../models";
import { successResponse, errorResponse, formatToMoment } from "../../helpers";
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
const formatUser = (user) => {
  const formattedUser = {
    ...user.toJSON(),
    createdAt: formatToMoment(user.createdAt),
    updatedAt: formatToMoment(user.updatedAt),
  };
  return formattedUser;
};
// main function
const allUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [
        ["createdAt", "DESC"],
        ["fullName", "ASC"],
      ],
    });
    const formattedUsers = users.map((user) => formatUser(user));
    return successResponse(req, res, formattedUsers);
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
    };

    const newUser = await User.create(payload);
    delete newUser.dataValues.password;
    const formattedUser = formatUser(newUser);
    const roleId = await getRoleIdByName("User");
    await UserRole.create({ userId: newUser.userId, roleId });
    return successResponse(req, res, { newUser: formattedUser });
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
    const formattedUser = formatUser(user);
    delete user.dataValues.password;
    return successResponse(req, res, { formattedUser, token });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const profile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ where: { userId: userId } });
    const formattedUser = formatUser(user);
    return successResponse(req, res, { formattedUser });
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
    return successResponse(req, res, "Change Password Succesful");
  } catch (error) {
    return errorResponse(req, res, error.message);
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
    const formattedUser = formatUser(userInfo);
    return successResponse(req, res, formattedUser);
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
const deActivateUser = async (req, res) => {
  try {
    // Check if the logged-in user has admin privileges
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(req, res, "User not found", 404);
    }

    // Deactivate the user by setting isActive to false
    await user.update({
      isActive: false,
    });

    return successResponse(req, res, {
      message: "User de-activated successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Update current user's fullName
const updateUser = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(req, res, "User not found", 404);
    }

    // Update only the specified fields
    if (req.body.fullName) {
      user.fullName = req.body.fullName;
    }
    // Save the changes
    await user.save();
    const formattedUser = formatUser(user);
    return successResponse(req, res, formattedUser);
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};

module.exports = {
  activateUser,
  getUserInfo,
  deActivateUser,
  changePassword,
  profile,
  allUsers,
  login,
  register,
  updateUser,
};
