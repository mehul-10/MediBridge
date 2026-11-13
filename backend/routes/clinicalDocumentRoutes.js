const express = require("express");
const router = express.Router();

const {
  uploadClinicalDocument,
  getMyClinicalDocuments,
  downloadClinicalDocument,
  updateClinicalDocument,
  deleteClinicalDocument,
} = require("../controllers/clinicalDocumentController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All document routes require authentication
router.use(protect);

// Upload a document
router.post("/", (req, res, next) => {
  upload.single("document")(req, res, (error) => {
  if (error) {
    console.log("MULTER ERROR:", error.message);
    console.log("RECEIVED FILE FIELD:", error.field);

    return res.status(400).json({
      success: false,
      message: error.message || "File upload failed.",
      receivedField: error.field || "Unknown",
    });
  }

  next();
});
}, uploadClinicalDocument);

// Get all documents belonging to the logged-in patient
router.get("/my-documents", getMyClinicalDocuments);

// Download a document
router.get("/:id/download", downloadClinicalDocument);

// Update document details
router.put("/:id", updateClinicalDocument);

// Delete a document
router.delete("/:id", deleteClinicalDocument);

module.exports = router;