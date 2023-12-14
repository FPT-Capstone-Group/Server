const express = require("express");

const bikeController = require("../controllers/bike/bike.controller");
const ownerController = require("../controllers/owner/owner.controller");
const cardController = require("../controllers/card/card.controller");
const parkingController = require("../controllers/parkingSession/parkingSession.controller");
const userValidator = require("../controllers/user/user.validator");
const userController = require("../controllers/user/user.controller");

const router = express.Router();

//= ===============================
// Security routes
//= ===============================

//Authentication
router.post(
    '/login',
    userController.login,
);


//Card
router.get("/cards/detail", cardController.getCardDetails);
router.post("/cards/create", cardController.createCard);

//Bike
router.get("bikes/plateNumber", bikeController.getPlateNumberByCard)

//Owner
router.get("/owners", ownerController.getOwnersByPlateNumber);

//Parking
router.post("/parking/checkin", parkingController.checkIn);
router.get(
    "/parking/getParkingDataForEvaluateGuest",
    parkingController.getParkingDataForEvaluateGuest
);
router.get(
    "/parking/getParkingDataForEvaluateNotGuest",
    parkingController.getParkingDataForEvaluateNotGuest
);
router.post("/parking/checkout", parkingController.checkOut);

module.exports = router;
