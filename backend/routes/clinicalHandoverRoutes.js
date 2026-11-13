
const express = require("express");
const router = express.Router();

const {
  createClinicalHandover,
  getMyClinicalHandovers,
  getClinicalHandoverById,
  updateClinicalHandover,
  deleteClinicalHandover,
} = require("../controllers/clinicalHandoverController");

const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Create a handover
router.post("/", createClinicalHandover);

// List handovers created by the logged-in healthcare professional
router.get("/my-handovers", getMyClinicalHandovers);

// Get one handover
router.get("/:id", getClinicalHandoverById);

// Update a handover
router.put("/:id", updateClinicalHandover);

// Delete a handover
router.delete("/:id", deleteClinicalHandover);

module.exports = router;
