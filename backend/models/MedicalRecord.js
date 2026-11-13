
const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    // Patient this medical record belongs to
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    // User account linked to the patient
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recordType: {
      type: String,
      enum: [
        "Diagnosis",
        "Prescription",
        "Lab Report",
        "Imaging",
        "Treatment",
        "Consultation",
        "Discharge Summary",
        "Other",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    diagnosis: {
      type: String,
      trim: true,
      default: "",
    },

    treatment: {
      type: String,
      trim: true,
      default: "",
    },

    doctorName: {
      type: String,
      trim: true,
      default: "",
    },

    hospitalName: {
      type: String,
      trim: true,
      default: "",
    },

    recordDate: {
      type: Date,
      required: true,
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

const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);

module.exports = MedicalRecord;
