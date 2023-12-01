import express from 'express';
import validate from 'express-validation';
import * as userController from '../controllers/user/user.controller';
import * as userValidator from '../controllers/user/user.validator';

const router = express.Router();

// Authenticated routes
// router.get('/profile', userController.getProfile);

// Staff routes
// router.post('/parking-sessions', staffController.addParkingSessions);
// router.get('/all-users', userController.getAllUsers);
// router.get("/parking-sessions", adminController.getAllParkingSessions);
module.exports = router;
