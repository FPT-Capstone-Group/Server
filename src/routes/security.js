import express from "express";

import * as bikeController from "../controllers/bike/bike.controller";
import * as ownerController from "../controllers/owner/owner.controller";
import * as cardController from "../controllers/card/card.controller";
import * as parkingController from "../controllers/parkingSession/parkingSession.controller";

const router = express.Router();

//= ===============================
// Security routes
//= ===============================

//Card
router.get("/cards/detail", cardController.getCardDetails);
router.post("/cards/create", cardController.createCard);

//Bike
router.get("bikes/plateNumber", bikeController.getPlateNumberByCard)

//Owner
router.post("/owners", ownerController.getOwnersByPlateNumber);

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
