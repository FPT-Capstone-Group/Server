const express = require("express");
const validate = require("express-validation");

const userController = require("../controllers/user/user.controller");
const registrationController = require("../controllers/registration/registration.controller");
const bikeController = require("../controllers/bike/bike.controller");
const ownerController = require("../controllers/owner/owner.controller");
const feeController = require("../controllers/fee/fee.controller");
const cardController = require("../controllers/card/card.controller");
const parkingSessionController = require("../controllers/parkingSession/parkingSession.controller");
const notificationController = require("../controllers/notification/notification.controller");
const registrationHistoryController = require("../controllers/registrationHistory/registrationHistory.controller");
const feeHistoryController = require("../controllers/feeHistory/feeHistory.controller");
const paymentController = require("../controllers/payment/payment.controller");
const router = express.Router();

//= ===============================
// Admin routes
//= ===============================

//Registration
router.get(
  "/registrations/allRegistrations",
  registrationController.allRegistration
);
router.get(
  "/registrations/:registrationId",
  registrationController.adminGetUserRegistration
);
router.put(
  "/registrations/active/:registrationId/",
  registrationController.activateRegistration
);
router.put(
  "/registrations/deactive/:registrationId/",
  registrationController.deactiveRegistration
);
router.put(
  "/registrations/verify/:registrationId",
  registrationController.verifyRegistration
);
router.put(
  "/registrations/reject/:registrationId",
  registrationController.rejectRegistration
);
router.put(
  "/registrations/disable/:registrationId",
  registrationController.disableRegistration
);
router.put(
  "/registrations/enable/:registrationId",
  registrationController.enableRegistration
);
router.get(
  "/registrations/payment/:registrationId",
  paymentController.getPaymentsForRegistration
);

//Registration History
router.get(
  "/registrations/history/:registrationId",
  registrationHistoryController.getRegistrationHistory
);

//Bike
router.post("/bike", bikeController.createBike);

//User
router.get("/users", userController.allUsers);
router.get("/users/:userId", userController.getUserInfo);
router.put("/users/active/:userId", userController.activateUser);
router.put("/users/deactive/:userId", userController.deactivateUser);
router.post("/users", userController.createSecurityAccount);

//Owner
router.post("/owners/create", ownerController.createOwner);

//Card
router.post("/cards", cardController.createCard);
router.get("/cards", cardController.getAllCards);
router.get("/cards/userId", cardController.getAllUserCards);
router.get("/cards/:cardId", cardController.getCardDetails);
router.put("/cards/:cardId", cardController.updateCard);
router.delete("/cards/:cardId", cardController.deleteCard);
router.get("/active-cards", cardController.getAllActiveCards);

//Notification
router.post("/notifications/send", notificationController.sendNotification);

// Parking Session
router.get("/sessions", parkingSessionController.getAllParkingSessions);
router.get(
  "/sessions/:parkingSessionId",
  parkingSessionController.getParkingSessionById
);

//Fee
router.post("/fees", feeController.createFee);
router.get("/fees", feeController.getAllFees);
router.get("/fees/:feeId", feeController.getFeeById);
router.put("/fees/:feeId", feeController.updateFeeById);
router.delete("/fees/:feeId", feeController.deleteFeeById);

// Fee History
router.get("/fees/:feeId/history", feeHistoryController.getFeeHistory);

// Payments
router.get("/payments", paymentController.getAllPayments);

module.exports = router;
