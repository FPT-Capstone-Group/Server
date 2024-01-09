const { errorResponse } = require("../helpers");
const { User } = require("../models");

const jwt = require("jsonwebtoken");

const apiAuth = async (req, res, next) => {
  // use bearer token
  const authorizationHeader = req.headers["authorization"];
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return errorResponse(req, res, "Bearer token is not provided", 401);
  }
  const token = authorizationHeader.split(" ")[1];

  // Use x-token
  // if (!(req.headers && req.headers["x-token"])) {
  //   return errorResponse(req, res, "Token is not provided", 401);
  // }
  // const token = req.headers["x-token"];

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded.user;
    const user = await User.findOne({
      where: { username: req.user.username },
    });
    if (!user) {
      return errorResponse(req, res, "User is not found in system", 401);
    }
    // Exempt /me route  from isActive checks
    if (req.baseUrl === "/api" && req.path === "/me") {
      const reqUser = { ...user.get() };
      reqUser.userId = user.userId;
      req.user = reqUser;

      return next();
    }

    if (user.userStatus !== "active") {
      return errorResponse(req, res, "User account is not active", 403);
    }
    const reqUser = { ...user.get() };
    reqUser.userId = user.userId;
    req.user = reqUser;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error instanceof jwt.TokenExpiredError) {
        return errorResponse(req, res, "Token has expired", 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        return errorResponse(req, res, "Invalid token signature", 401);
      } else {
        return errorResponse(
          req,
          res,
          "Incorrect token is provided, try re-login",
          401
        );
      }
    } else {
      throw error;
    }
  }
};

module.exports = apiAuth;
