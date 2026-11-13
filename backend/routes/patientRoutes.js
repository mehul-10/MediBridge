
const express = require("express");
const router = express.Router();

const Patient = require("../models/Patient");
const { protect } = require("../middleware/authMiddleware");

// GET: Retrieve all patients (healthcare accounts only)
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "healthcare") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Healthcare account required.",
      });
    }

    const patients = await Patient.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Patient retrieval error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve patients.",
    });
  }
});

// PUT: Update the logged-in patient's own profile
router.put("/my-profile", protect, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patient accounts can update their own profile.",
      });
    }

    const allowedFields = [
      "fullName",
      "dateOfBirth",
      "gender",
      "email",
      "phone",
      "bloodGroup",
      "allergies",
      "chronicConditions",
      "emergencyContact",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one valid field to update.",
      });
    }

    // Validate basic text fields
    if (
      updates.fullName !== undefined &&
      (typeof updates.fullName !== "string" || !updates.fullName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name must be a non-empty string.",
      });
    }

    if (updates.email !== undefined) {
      if (
        typeof updates.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address.",
        });
      }

      updates.email = updates.email.trim().toLowerCase();
    }

    if (updates.phone !== undefined && typeof updates.phone !== "string") {
      return res.status(400).json({
        success: false,
        message: "Phone number must be a string.",
      });
    }

    if (updates.fullName !== undefined) {
      updates.fullName = updates.fullName.trim();
    }

    // Validate array fields
    for (const field of ["allergies", "chronicConditions"]) {
      if (
        updates[field] !== undefined &&
        (!Array.isArray(updates[field]) ||
          !updates[field].every((item) => typeof item === "string"))
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be an array of strings.`,
        });
      }
    }

    // Find profile using authenticated account ID
    const patient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Linked patient profile not found.",
      });
    }

    // Keep the User account's name and email synchronized
    const User = require("../models/User");

    const userUpdates = {};

    if (updates.fullName !== undefined) {
      userUpdates.fullName = updates.fullName;
    }

    if (updates.email !== undefined) {
      userUpdates.email = updates.email;
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $set: userUpdates },
        { runValidators: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Patient profile updated successfully.",
      patient,
    });
  } catch (error) {
    console.error("Patient profile update error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email address is already in use.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid profile information provided.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update patient profile.",
    });
  }
});

// GET: Retrieve one patient by Patient ID
router.get("/:patientId", protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({
      patientId: req.params.patientId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    if (
      req.user.role === "patient" &&
      (!patient.userId ||
        patient.userId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own patient profile.",
      });
    }

    res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Patient retrieval error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve patient.",
    });
  }
});

module.exports = router;
