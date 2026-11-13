
const express = require("express");
const router = express.Router();

const {
  createMedicalHistory,
  getMyMedicalHistory,
  getMedicalHistoryById,
  updateMedicalHistory,
  deleteMedicalHistory,
} = require("../controllers/medicalHistoryController");

const { protect } = require("../middleware/authMiddleware");

// All medical history routes require authentication.
router.use(protect);

// Get all medical history entries.
router.get("/my-history", getMyMedicalHistory);

// Add a medical history entry.
router.post("/", createMedicalHistory);

// Get one medical history entry.
router.get("/:id", getMedicalHistoryById);

// Update a medical history entry.
router.put("/:id", updateMedicalHistory);

// Delete a medical history entry.
router.delete("/:id", deleteMedicalHistory);

module.exports = router;
