const express = require("express");
const validate = require("express-validation");

const uploadMiddleware = require("../middleware/uploadMiddleware");
const userController = require("../controllers/user/user.controller");
const userValidator = require("../controllers/user/user.validator");
const registrationController = require("../controllers/registration/registration.controller");
const paymentController = require("../controllers/payment/payment.controller");
const feeController = require("../controllers/fee/fee.controller");
const cardController = require("../controllers/card/card.controller");
const ownerController = require("../controllers/owner/owner.controller");
const bikeController = require("../controllers/bike/bike.controller");
const parkingSessionController = require("../controllers/parkingSession/parkingSession.controller");
const router = express.Router();

//= ===============================
// API routes
//= ===============================

//Bike
router.get("/bikes", bikeController.getAllBikesForUser);
router.get("/bikes/:cardId", bikeController.getAllBikesByCard);
//Fee
router.get("/fees", feeController.getAllFees);
router.get("/fees/:feeId", feeController.getFeeById);
router.get("/fees", feeController.getAllResidentFees);

//User
router.post("/forgotPassword", userController.forgotPassword);
router.get("/me", userController.profile);
router.post("/changePassword", userController.changePassword);
router.put("/users/update", userController.updateUser);
router.post("/user/tokenDevice", userController.getFirebaseTokenDevice);

//Registration
router.post(
  "/registrations/create",
  uploadMiddleware.single("faceImage"),
  registrationController.createRegistration
);
router.get("/registrations", registrationController.getAllUserRegistration);
router.get(
  "/registrations/:registrationId",
  registrationController.getUserRegistration
);
router.put(
  "/registrations/cancel/:registrationId",
  registrationController.cancelRegistration
);

//Payment
router.post("/payments", paymentController.processPayment);

//Card
router.get("/cards/userId", cardController.getAllUserCards);

//Owner
router.post("/owners/create", ownerController.createOwner);
router.post("/owners", ownerController.getOwnersByUsersPlateNumber);

//Parking Session
router.get(
  "/sessions",
  parkingSessionController.getParkingSessionsByUsersPlateNumber
);

module.exports = router;
