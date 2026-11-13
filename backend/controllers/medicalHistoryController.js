
const mongoose = require("mongoose");
const MedicalHistory = require("../models/MedicalHistory");
const Patient = require("../models/Patient");

const getPatientForUser = async (userId) => {
  return Patient.findOne({ userId });
};

// Add a medical history entry
const createMedicalHistory = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can add medical history.",
      });
    }

    const {
      conditionName,
      diagnosisDate,
      diagnosedBy,
      hospitalName,
      description,
      treatment,
      status,
      notes,
    } = req.body || {};

    if (!conditionName || !conditionName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Condition name is required.",
      });
    }

    let parsedDiagnosisDate = null;

    if (diagnosisDate) {
      parsedDiagnosisDate = new Date(diagnosisDate);

      if (Number.isNaN(parsedDiagnosisDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid diagnosis date.",
        });
      }

      if (parsedDiagnosisDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Diagnosis date cannot be in the future.",
        });
      }
    }

    const patient = await getPatientForUser(req.user._id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const history = await MedicalHistory.create({
      patientId: patient._id,
      userId: req.user._id,
      conditionName,
      diagnosisDate: parsedDiagnosisDate,
      diagnosedBy,
      hospitalName,
      description,
      treatment,
      status,
      notes,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Medical history added successfully.",
      medicalHistory: history,
    });
  } catch (error) {
    console.error("Create medical history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add medical history.",
    });
  }
};

// Get all medical history entries for the logged-in patient
const getMyMedicalHistory = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access their medical history.",
      });
    }

    const patient = await getPatientForUser(req.user._id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const history = await MedicalHistory.find({
      patientId: patient._id,
      userId: req.user._id,
    }).sort({ diagnosisDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      medicalHistory: history,
    });
  } catch (error) {
    console.error("Get medical history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve medical history.",
    });
  }
};

// Get one medical history entry
const getMedicalHistoryById = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access medical history.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medical history ID.",
      });
    }

    const history = await MedicalHistory.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Medical history entry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      medicalHistory: history,
    });
  } catch (error) {
    console.error("Get medical history entry error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve medical history entry.",
    });
  }
};

// Update a medical history entry
const updateMedicalHistory = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can update medical history.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medical history ID.",
      });
    }

    const allowedFields = [
      "conditionName",
      "diagnosisDate",
      "diagnosedBy",
      "hospitalName",
      "description",
      "treatment",
      "status",
      "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid medical history fields were provided.",
      });
    }

    if (
      updates.conditionName !== undefined &&
      (typeof updates.conditionName !== "string" ||
        !updates.conditionName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Condition name is required.",
      });
    }

    if (updates.diagnosisDate !== undefined) {
      if (updates.diagnosisDate === null || updates.diagnosisDate === "") {
        updates.diagnosisDate = null;
      } else {
        const parsedDate = new Date(updates.diagnosisDate);

        if (
          Number.isNaN(parsedDate.getTime()) ||
          parsedDate > new Date()
        ) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid diagnosis date that is not in the future.",
          });
        }

        updates.diagnosisDate = parsedDate;
      }
    }

    const history = await MedicalHistory.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Medical history entry not found.",
      });
    }

    Object.assign(history, updates);
    await history.save();

    return res.status(200).json({
      success: true,
      message: "Medical history updated successfully.",
      medicalHistory: history,
    });
  } catch (error) {
    console.error("Update medical history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update medical history.",
    });
  }
};

// Delete a medical history entry
const deleteMedicalHistory = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can delete medical history.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medical history ID.",
      });
    }

    const history = await MedicalHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Medical history entry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medical history deleted successfully.",
    });
  } catch (error) {
    console.error("Delete medical history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete medical history.",
    });
  }
};

module.exports = {
  createMedicalHistory,
  getMyMedicalHistory,
  getMedicalHistoryById,
  updateMedicalHistory,
  deleteMedicalHistory,
};
