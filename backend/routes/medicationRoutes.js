
const express = require("express");
const router = express.Router();

const {
  createMedication,
  getMyMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
} = require("../controllers/medicationController");

const { protect } = require("../middleware/authMiddleware");

// All medication routes require authentication.
router.use(protect);

// Get all medications belonging to the logged-in patient.
router.get("/my-medications", getMyMedications);

// Add a medication.
router.post("/", createMedication);

// Get one medication.
router.get("/:id", getMedicationById);

// Update a medication.
router.put("/:id", updateMedication);

// Delete a medication.
router.delete("/:id", deleteMedication);

module.exports = router;
