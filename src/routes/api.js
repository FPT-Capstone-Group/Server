const express = require("express");
const validate = require("express-validation");

const uploadMiddleware = require("../middleware/uploadMiddleware");
const userController = require("../controllers/user/user.controller");
const registrationController = require("../controllers/registration/registration.controller");
const paymentController = require("../controllers/payment/payment.controller");
const feeController = require("../controllers/fee/fee.controller");
const cardController = require("../controllers/card/card.controller");
const ownerController = require("../controllers/owner/owner.controller");
const bikeController = require("../controllers/bike/bike.controller");
const parkingSessionController = require("../controllers/parkingSession/parkingSession.controller");
const notificationController = require("../controllers/notification/notification.controller");
const router = express.Router();

//= ===============================
// API routes
//= ===============================

//Bike
router.get("/bikes", bikeController.getAllBikesForUser);
router.get("/bikes/getAllBikesByCard", bikeController.getAllBikesByCard);
router.get("/bikes/getAllCardsByBikeId", bikeController.getAllCardsByBikeId);
//Fee
router.get("/fees", feeController.getAllFees);
router.get("/fees/:feeId", feeController.getFeeById);
router.get("/fees", feeController.getAllResidentFees);

//User
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
router.put(
    "/registrations/deactivate/:registrationId/",
    registrationController.temporaryDeactivateRegistration
);
router.put(
    "/registrations/reactivate/:registrationId",
    registrationController.reactivateRegistration
);

//Payment
router.post("/payments", paymentController.processPayment);

//Card
router.get("/cards/userId", cardController.getAllUserCards);

//Owner
router.post("/owners/create", ownerController.createOwner);
router.get("/owners", ownerController.getOwnersByUsersPlateNumber);
router.post("/owners/activate", ownerController.activateOwner);
router.post("/owners/deactivate", ownerController.deactivateOwner);

//Notification
router.get("/notifi", notificationController.getUserAssociatedNotifications);

//Parking Session
router.get(
  "/sessions",
  parkingSessionController.getParkingSessionsByUsersPlateNumber
);

module.exports = router;
