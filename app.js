const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

const publicRoutes = require("./src/routes/public");
const apiRoutes = require("./src/routes/api");
const adminRoutes = require("./src/routes/admin");
const securityRoutes = require("./src/routes/security");
const apiMiddleware = require("./src/middleware/apiAuth");
const adminMiddleware = require("./src/middleware/adminAuth");
const securityMiddleware = require("./src/middleware/securityAuth");
const errorHandler = require("./src/middleware/errorHandler");
dotenv.config();
require("./src/config/sequelize");

// Initialize Firebase Admin
// const serviceAccountPath = process.env.FIREBASE_ADMIN_CREDENTIALS;
// const serviceAccountCredentials = process.env.FIREBASE_ADMIN_CREDENTIALS.replace(/\\"/g, '"')
// const serviceAccountCredentials = process.env.FIREBASE_ADMIN_CREDENTIALS
// const serviceAccount = JSON.parse(serviceAccountCredentials);
const serviceAccount = require('./firebase-admin-credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/", (req, res) => {
    res.json({ message: `SmartParking Server is running on ${process.env.NODE_ENV}!` });
});
app.use(cors());
app.use(bodyParser.json());
app.use("/pub", publicRoutes);
app.use("/api", apiMiddleware, apiRoutes);
app.use("/api/admin", apiMiddleware, adminMiddleware, adminRoutes);
app.use("/api/security", apiMiddleware, securityMiddleware, securityRoutes);
app.use(errorHandler);

module.exports = app;
