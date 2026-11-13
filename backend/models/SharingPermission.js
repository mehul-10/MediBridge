
const mongoose = require("mongoose");

const sharingPermissionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    healthcareUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // If empty, permission applies to all records.
    // Otherwise, only the listed records can be accessed.
    medicalRecordIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalRecord",
      },
    ],

    accessLevel: {
      type: String,
      enum: ["view"],
      default: "view",
      required: true,
    },

    grantedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Quickly find permissions for a patient and healthcare professional.
sharingPermissionSchema.index({
  patientId: 1,
  healthcareUserId: 1,
  status: 1,
});

const SharingPermission = mongoose.model(
  "SharingPermission",
  sharingPermissionSchema
);

module.exports = SharingPermission;
