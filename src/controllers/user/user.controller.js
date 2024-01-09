const jwt = require("jsonwebtoken");

const { Role, User, UserHistory, Notification } = require("../../models");
const {
  errorResponse,
  formatToMoment,
  successResponse,
} = require("../../helpers");
const {
  getOtpToken,
  verifyOtpToken,
} = require("../../middleware/otpVerification");
const crypto = require("crypto");
const notificationController = require("../notification/notification.controller");
const Op = require("sequelize").Op;
// sub function
const createNotification = async (userId, message, notificationType) => {
  return Notification.create({
    userId,
    message,
    notificationType,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};
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
const createUserHistory = async (userId, eventName) => {
  return UserHistory.create({
    userId,
    event,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};
const formatUser = (user) => {
  // Check if user is a Sequelize model instance
  const userInstance = user instanceof User ? user.toJSON() : user;

  const { password, ...userWithoutPassword } = userInstance;
  const formattedUser = {
    ...userWithoutPassword,
    createdAt: formatToMoment(userInstance.createdAt),
    updatedAt: formatToMoment(userInstance.updatedAt),
  };
  return formattedUser;
};
// main function
const allUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        "$Role.roleName": {
          [Op.ne]: "admin", // Exclude users with role name = "admin"
        },
      },
      include: {
        model: Role,
        attributes: [], // Exclude role attributes from the result
      },
      order: [
        ["createdAt", "DESC"],
        ["userFullName", "ASC"],
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
    const { username, password, fullName, otpToken } = req.body;

    const user = await User.findOne({
      where: { username },
    });
    if (user) {
      throw new Error("User already exists with same username");
    }

    const verificationCheckStatus = await verifyOtpToken(username, otpToken);
    if (verificationCheckStatus.localeCompare("approved") !== 0) {
      console.error("Please provide valid OTP Token!");
      throw new Error("Please provide valid OTP Token!");
    }
    const roleId = await getRoleIdByName("user");

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    const payload = {
      username,
      userFullName,
      password: hashedPassword,
      roleId: roleId,
    };

    const newUser = await User.create(payload);
    const formattedUser = formatUser(newUser);
    return successResponse(req, res, { user: formattedUser });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
// 3 Login for 3 actor
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
    // Update the user's firebaseToken
    user.firebaseToken = req.body.firebaseToken;
    await user.save();
    const userRole = await Role.findByPk(user.roleId);
    const roleName = userRole.roleName;

    const token = jwt.sign(
      {
        user: {
          userId: user.userId,
          username: user.username,
          createdAt: new Date(),
        },
      },
      // Only server knows, make sure not to expose
      process.env.SECRET
    );

    return successResponse(req, res, {
      user: {
        userId: user.userId,
        userFullName: user.userFullName,
        username: user.username,
        userStatus: user.userStatus,
        firebaseToken: user.firebaseToken,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roleName: roleName,
      },
      token: token,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
const loginSecurity = async (req, res) => {
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

    const userRole = await Role.findByPk(user.roleId);
    const roleName = userRole.roleName;

    if (roleName !== "security") {
      throw new Error("Unauthorized!");
    }

    const token = jwt.sign(
      {
        user: {
          userId: user.userId,
          username: user.username,
          createdAt: new Date(),
        },
      },
      // Only server knows, make sure not to expose
      process.env.SECRET
    );

    return successResponse(req, res, {
      user: {
        userId: user.userId,
        userFullName: user.userFullName,
        username: user.username,
        userStatus: user.userStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roleName: roleName,
      },
      token: token,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
const loginAdmin = async (req, res) => {
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
    const userRole = await Role.findByPk(user.roleId);
    const roleName = userRole.roleName;
    if (roleName !== "admin") {
      throw new Error("Unauthorized!");
    }
    const token = jwt.sign(
      {
        user: {
          userId: user.userId,
          username: user.username,
          createdAt: new Date(),
        },
      },
      // Only server knows, make sure not to expose
      process.env.SECRET
    );

    return successResponse(req, res, {
      user: {
        userId: user.userId,
        userFullName: user.userFullName,
        username: user.username,
        userStatus: user.userStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roleName: roleName,
      },
      token: token,
    });
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
    const formattedUser = formatUser(user);
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
      userStatus: "active",
    });
    // Send noti
    if (user) {
      const notificationTitle = "Account Activated";
      const notificationBody = "Your Account has been activated.";
      await notificationController.sendNotificationMessage(
        user.userId,
        notificationTitle,
        notificationBody
      );
      await createNotification(
        user.userId,
        notificationBody, //message
        notificationTitle //notiType
      );
      // Create user history
      await createUserHistory(userId, "User Activated");
      return successResponse(req, res, {
        message: "User has been activated successfully",
      });
    }
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Only admin can access this route
const deactivateUser = async (req, res) => {
  try {
    // Check if the logged-in user has admin privileges
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(req, res, "User not found", 404);
    }
    // Deactivate the user by setting isActive to false
    await user.update({
      userStatus: "inactive",
    });
    // Send noti
    if (user) {
      const notificationTitle = "Account has been deactivated";
      const notificationBody = "Your Account has been deactivated.";
      await notificationController.sendNotificationMessage(
        user.userId,
        notificationTitle,
        notificationBody
      );
      await createNotification(
        user.userId,
        notificationBody, //message
        notificationTitle //notiType
      );
    }
    // Create History
    await createUserHistory(userId, "User Deactivated ");
    return successResponse(req, res, {
      message: "User has been de-activated successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// User Update current user's information
const updateUser = async (req, res) => {
  const userId = req.user.userId;
  const { userFullName, address, gender, age } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(req, res, "User not    found", 404);
    }

    // Update only the specified fields
    user.userFullName = userFullName;
    user.address = address;
    user.gender = gender;
    user.age = age;
    // Save the changes
    await user.save();
    await createUserHistory(userId, "User Updated");
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
    const verificationCheckStatus = await verifyOtpToken(username, otpToken);
    if (verificationCheckStatus.localeCompare("approved") !== 0) {
      console.error("Please provide valid OTP Token!");
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
    const verificationStatus = await getOtpToken(username);
    console.log(`Verification status: ${verificationStatus}`);
    return successResponse(req, res, {
      verificationStatus: verificationStatus,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "Internal Server Error", 500, error);
  }
};
// Only admin can create security
const createSecurityAccount = async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    // Check for whitespace in the username
    if (/\s/.test(username)) {
      throw new Error("Username cannot contain spaces");
    }
    const user = await User.findOne({
      where: { username },
    });
    if (user) {
      throw new Error("User already exists with the same username");
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const payload = {
      username,
      userFullName,
      password: hashedPassword,
      roleId: 2, // security role is 2
    };

    const newUser = await User.create(payload);
    const formattedUser = formatUser(newUser);

    return successResponse(req, res, { user: formattedUser });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
const getFirebaseTokenDevice = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.body.username },
    });

    return successResponse(req, res, {
      user: {
        username: user.username,
        firebaseToken: user.firebaseToken,
      },
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
module.exports = {
  activateUser,
  getUserInfo,
  deactivateUser,
  changePassword,
  profile,
  allUsers,
  login,
  register,
  updateUser,
  forgotPassword,
  getOtp,
  createSecurityAccount,
  getFirebaseTokenDevice,
  loginSecurity,
  loginAdmin,
};
