
const express = require("express");
const router = express.Router();

const {
  createMedicalRecord,
  getMyMedicalRecords,
  getPatientMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require("../controllers/medicalRecordController");

const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Patient's own medical records
router.get("/my-records", getMyMedicalRecords);

// Create a medical record
router.post("/", createMedicalRecord);

// Get records belonging to a specific patient
router.get("/patient/:patientId", getPatientMedicalRecords);

// Get one medical record
router.get("/:id", getMedicalRecordById);

// Update a medical record
router.put("/:id", updateMedicalRecord);

// Delete a medical record
router.delete("/:id", deleteMedicalRecord);

module.exports = router;
