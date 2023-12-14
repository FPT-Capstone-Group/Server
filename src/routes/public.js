const express = require("express");
const validate = require("express-validation");

const userController = require("../controllers/user/user.controller");
const userValidator = require("../controllers/user/user.validator");

const router = express.Router();

//= ===============================
// Public routes
//= ===============================

router.post("/otp/send", userController.getOtp);

router.post("/login", validate(userValidator.login), userController.login);

router.post(
  '/login',
  validate(userValidator.login),
  userController.login,
);


router.post(
    '/loginSecurity',
    userController.loginSecurity,
);


router.post(
  '/register',
  validate(userValidator.register),
  userController.register
);
router.post("/user/tokenDevice", userController.getFirebaseTokenDevice);
module.exports = router;
