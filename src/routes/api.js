const express = require("express");
const validate = require("express-validation");
const parkingOrderController = require("../controllers/parkingOrder/parkingOrder.controller");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const userController = require("../controllers/user/user.controller");
const registrationController = require("../controllers/registration/registration.controller");
const paymentController = require("../controllers/payment/payment.controller");
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
router.post("/bikes/create", bikeController.createBike);
router.put("/bikes/update", bikeController.updateBike);
router.put("/bikes/deactivate", bikeController.deactivateBike);
router.put("/bikes/activate", bikeController.activateBike);
router.get("/bikes/getPlateNumberByCard", bikeController.getPlateNumberByCard);
router.get("/bikes/getAllBikes", bikeController.getAllBikes);
router.get("/bikes/getBikeInfo", bikeController.getBikeInfo);


//User
router.get("/me", userController.profile);
router.post("/changePassword", userController.changePassword);
router.put("/users/update", userController.updateUser);

//Registration
router.post(
  "/registrations/create", registrationController.createRegistration
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


// Parking Order
router.get("/parkingOrders/getAllParkingOrdersByBike", parkingOrderController.getAllParkingOrdersByBike);
router.get("/parkingOrders/getParkingOrderInfo", parkingOrderController.getParkingOrderInfo);
router.post("/parkingOrders/create", parkingOrderController.createParkingOrder);
router.post("/parkingOrders/cancel", parkingOrderController.cancelParkingOrder);
router.get("/parkingOrders/getCurrentPendingParkingOrder", parkingOrderController.getCurrentPendingParkingOrder);


//Payment
router.post("/payments/pay", paymentController.processParkingOrderPayment);

//Card
router.get("/cards/userId", cardController.getAllUserCards);
router.get("/cards/getAllCardsByBikeId", cardController.getAllCardsByBikeId);


//Owner
router.post("/owners/create", ownerController.createOwner);
router.get("/owners", ownerController.getOwnersByUsersPlateNumber);
router.post("/owners/activate", ownerController.activateOwner);
router.post("/owners/deactivate", ownerController.deactivateOwner);

//Notification
router.get("/notifications/all", notificationController.getUserAssociatedNotifications);

//Parking Session
router.get(
  "/parkingSessions",
  parkingSessionController.getParkingSessionsByUsersPlateNumber
);

module.exports = router;
