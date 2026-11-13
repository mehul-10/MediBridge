
const mongoose = require("mongoose");

const medicalHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    conditionName: {
      type: String,
      required: true,
      trim: true,
    },

    diagnosisDate: {
      type: Date,
      default: null,
    },

    diagnosedBy: {
      type: String,
      trim: true,
      default: "",
    },

    hospitalName: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    treatment: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Ongoing", "Resolved", "Under Observation"],
      default: "Ongoing",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalHistory = mongoose.model(
  "MedicalHistory",
  medicalHistorySchema
);

module.exports = MedicalHistory;
