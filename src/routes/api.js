import express from "express";
import validate from "express-validation";

import uploadMiddleware from "../middleware/uploadMiddleware";
import * as userController from "../controllers/user/user.controller";
import * as userValidator from "../controllers/user/user.validator";
import * as registrationController from "../controllers/registration/registration.controller";
import * as paymentController from "../controllers/payment/payment.controller";
import * as feeController from "../controllers/fee/fee.controller";
import * as cardController from "../controllers/card/card.controller";
import * as ownerController from "../controllers/owner/owner.controller";
import * as bikeController from "../controllers/bike/bike.controller";
import * as parkingSessionController from "../controllers/parkingSession/parkingSession.controller";
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
