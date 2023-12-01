import express from "express";
import * as userController from "../controllers/user/user.controller";
import * as registrationController from "../controllers/registration/registration.controller";
import * as bikeController from "../controllers/bike/bike.controller";
import * as ownerController from "../controllers/owner/owner.controller";
import * as feeController from "../controllers/fee/fee.controller";
import * as cardController from "../controllers/card/card.controller";
const router = express.Router();

//= ===============================
// Admin routes
//= ===============================

//Fee
router.post("/fees", feeController.createFee);
router.get("/fees", feeController.getAllFees);
router.get("/fees/:feeId", feeController.getFeeById);
router.put("/fees/:feeId", feeController.updateFeeById);
router.delete("/fees/:feeId", feeController.deleteFeeById);

//Registration
router.get(
  "/registrations/allRegistrations",
  registrationController.allRegistration
);
router.get(
  "/registrations/:registrationId",
  registrationController.getUserRegistration
);
router.put(
  "/registrations/:registrationId/",
  registrationController.updateRegistration
);
router.put(
  "/registrations/disable/:registrationId",
  registrationController.disableRegistration
);
router.put(
  "/registrations/approve/:registrationId",
  registrationController.approveRegistration
);

//Bike
router.post("/bike", bikeController.createBike);

//User
router.get("/users", userController.allUsers);
router.get("/users/:userId", userController.getUserInfo);
router.put("/users/active/:userId", userController.activateUser);

//Owner
router.post("/owners/create", ownerController.createOwner);

//Card
router.post("/cards", cardController.createCard);
router.get("/cards", cardController.getAllCards);
router.get("/cards/userId", cardController.getAllUserCards);
router.get("/cards/:cardId", cardController.getCardDetails);
router.put("/cards/:cardId", cardController.updateCard);
router.delete("/cards/:cardId", cardController.deleteCard);

module.exports = router;
