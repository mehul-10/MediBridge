
const mongoose = require("mongoose");

const clinicalHandoverSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    handoverTitle: {
      type: String,
      required: true,
      trim: true,
    },

    patientCondition: {
      type: String,
      required: true,
      trim: true,
    },

    relevantHistory: {
      type: String,
      default: "",
      trim: true,
    },

    currentTreatments: {
      type: String,
      default: "",
      trim: true,
    },

    currentMedications: {
      type: String,
      default: "",
      trim: true,
    },

    pendingTests: {
      type: String,
      default: "",
      trim: true,
    },

    risksAndObservations: {
      type: String,
      default: "",
      trim: true,
    },

    followUpTasks: {
      type: String,
      default: "",
      trim: true,
    },

    handoverStatus: {
      type: String,
      enum: ["Draft", "Reviewed", "Completed"],
      default: "Draft",
    },

    aiSummary: {
      type: String,
      default: "",
      trim: true,
    },

    aiSummaryGenerated: {
      type: Boolean,
      default: false,
    },

    clinicianReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ClinicalHandover",
  clinicalHandoverSchema
);
