import express from "express";
import validate from "express-validation";

import uploadMiddleware from "../middleware/uploadMiddleware";
import * as userController from "../controllers/user/user.controller";
import * as userValidator from "../controllers/user/user.validator";
import * as registrationController from "../controllers/registration/registration.controller";
import * as paymentController from "../controllers/payment/payment.controller";
import * as paymentHistoryController from "../controllers/paymentHistory/paymentHistory.controller";
import * as feeController from "../controllers/fee/fee.controller";
import * as cardController from "../controllers/card/card.controller";
import * as ownerController from "../controllers/owner/owner.controller";
import * as bikeController from "../controllers/bike/bike.controller";
import * as parkingController from "../controllers/parkingSession/parkingSession.controller";
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

//Payment History
router.get(
  "/payments/history",
  paymentHistoryController.getAllPaymentHistoryForCurrentUser
);
router.get(
  "/payments/history/:paymentHistoryId",
  paymentHistoryController.getPaymentHistoryById
);

//Card
router.get("/cards/userId", cardController.getAllUserCards);
router.get("/cards/detail", cardController.getCardDetails);
router.post("/cards/create", cardController.createCard);

//Owner
router.post("/owners/create", ownerController.createOwner);
router.post("/owners", ownerController.getOwnersByPlateNumber);

//Parking
router.post("/parking/checkin", parkingController.checkIn);
router.get(
  "/parking/getDataForEvaluation",
  parkingController.getParkingDataForEvaluate
);
router.post("/parking/checkout", parkingController.checkOut);



module.exports = router;
