
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createAIHandoverSummary,
} = require("../controllers/aiHandoverController");

router.use(protect);

router.post("/generate", createAIHandoverSummary);

module.exports = router;
