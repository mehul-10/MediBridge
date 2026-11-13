const mongoose = require("mongoose");

const clinicalDocumentSchema = new mongoose.Schema(
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

    documentTitle: {
      type: String,
      required: true,
      trim: true,
    },

    documentType: {
      type: String,
      enum: [
        "Lab Report",
        "Prescription",
        "Imaging Report",
        "Discharge Summary",
        "Other",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    documentDate: {
      type: Date,
      default: null,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ClinicalDocument = mongoose.model(
  "ClinicalDocument",
  clinicalDocumentSchema
);

module.exports = ClinicalDocument;