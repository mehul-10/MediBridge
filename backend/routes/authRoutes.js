
const express = require("express");

const router = express.Router();

const {
  loginUser,
  logoutUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/logout
// Requires a valid authentication token.
router.post("/logout", protect, logoutUser);

module.exports = router;
