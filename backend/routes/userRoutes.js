const express = require("express");

const router = express.Router();

const {
  registerUser,
  registerHealthcareUser,
} = require("../controllers/userController");

// Patient registration
router.post("/register", registerUser);

// Development-only healthcare test registration
router.post("/register-healthcare", registerHealthcareUser);

module.exports = router;