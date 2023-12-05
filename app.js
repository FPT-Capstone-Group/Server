import express from "express";
import dotenv from "dotenv";
import fs from "fs";

import bodyParser from "body-parser";
import cors from "cors";
import admin from "firebase-admin";

import publicRoutes from "./src/routes/public";
import apiRoutes from "./src/routes/api";
import adminRoutes from "./src/routes/admin";
import apiMiddleware from "./src/middleware/apiAuth";
import adminMiddleware from "./src/middleware/adminAuth";
import errorHandler from "./src/middleware/errorHandler";
dotenv.config();
require("./src/config/sequelize");

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_ADMIN_CREDENTIALS;
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());
app.use(bodyParser.json());
app.use("/pub", publicRoutes);
app.use("/api", apiMiddleware, apiRoutes);
app.use("/api/admin", apiMiddleware, adminMiddleware, adminRoutes);
app.use(errorHandler);

module.exports = app;
