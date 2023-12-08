import jwt from "jsonwebtoken";

import {Role, User, UserRole} from "../../models";
import {errorResponse, formatToMoment, successResponse} from "../../helpers";
import {getOtpToken, verifyOtpToken} from "../../middleware/otpVerification";
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
  const { password, ...userWithoutPassword } = user.toJSON();
  const formattedUser = {
    ...userWithoutPassword,
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
    return successResponse(req, res, { users: formattedUsers });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const register = async (req, res) => {
  try {
    const { username, password, fullName, firebaseToken, otpToken } = req.body;

    const user = await User.findOne({
      where: { username },
    });
    if (user) {
      throw new Error("User already exists with same username");
    }

    const verificationCheckStatus = await verifyOtpToken(username, otpToken)
    if (!verificationCheckStatus.localeCompare("approved")){
      throw new Error("Please provide valid OTP Token!");
    }


    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    const payload = {
      username,
      fullName,
      password: hashedPassword,
      firebaseToken,
    };

    const newUser = await User.create(payload);
    const formattedUser = formatUser(newUser);
    const roleId = await getRoleIdByName("User");
    await UserRole.create({ userId: newUser.userId, roleId });
    return successResponse(req, res, { user: formattedUser });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
const login = async (req, res) => {
  try {
    const user = await User.findOne({
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
    // Check if the user has a firebaseToken field, if user don't have, skip it
    if (user.hasOwnProperty("firebaseToken")) {
      // Update the user's firebaseToken
      user.firebaseToken = firebaseToken;
      await user.save();
    }
    const token = jwt.sign(
      {
        user: {
          userId: user.userId,
          username: user.username,
          createdAt: new Date(),
        },
      },
      // Only server know make sure don't expose
      process.env.SECRET
    );
    const formattedUser = formatUser(user);
    return successResponse(req, res, { user: formattedUser, token });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const profile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ where: { userId: userId } });
    const formattedUser = formatUser(user);
    return successResponse(req, res, { user: formattedUser });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
const changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({
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

    await User.update(
      { password: newPass },
      { where: { userId: user.userId } }
    );

    return successResponse(req, res, "Change Password Successful");
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
    return successResponse(req, res, { user: formattedUser });
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
    return successResponse(req, res, { user: formattedUser });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { username, newPassword, otpToken } = req.body;
    // Verify the OTP (you need to implement OTP verification logic)
    // Find the user by username
    const user = await User.findOne({
      where: { username },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const verificationCheckStatus = await verifyOtpToken(username, otpToken)
    if (!verificationCheckStatus.localeCompare("approved")){
      throw new Error("Please provide valid OTP Token!");
    }
    // Update the user's password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(newPassword)
      .digest("hex");
    user.password = hashedPassword;
    await user.save();
    return successResponse(req, res, "Password updated successfully");
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, error.message);
  }
};

const getOtp = async (req, res) => {
  try {
    const { username } = req.body;
    const verificationStatus = await getOtpToken(username)
    console.log(`Verification status: ${verificationStatus}`)
    return successResponse(req, res, { verificationStatus: verificationStatus });
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
  forgotPassword,
  getOtp,
  verifyOtp
};
