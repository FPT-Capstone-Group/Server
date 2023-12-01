// multerMiddleware.js
const multer = require("multer");

// Set storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Destination function called"); // Add this line
    cb(null, "uploads/"); // Specify the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    console.log("Filename function called"); // Add this line
    cb(null, Date.now() + "-" + file.originalname); // Set the filename to be unique
  },
});

const upload = multer({ storage: multer.memoryStorage() });
module.exports = upload;
