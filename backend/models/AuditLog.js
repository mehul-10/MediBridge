
const mongoose = require("mongoose");
const net = require("net");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      immutable: true,
    },

    action: {
      type: String,
      required: true,
      immutable: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW",
        "UPLOAD",
        "DOWNLOAD",
        "CONSENT_GRANTED",
        "CONSENT_REVOKED",
        "AI_SUMMARY_GENERATED",
      ],
    },

    resourceType: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      immutable: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
      immutable: true,
    },

    outcome: {
      type: String,
      enum: ["SUCCESS", "FAILURE"],
      default: "SUCCESS",
      immutable: true,
    },

    ipAddress: {
      type: String,
      default: "",
      immutable: true,
      validate: {
        validator: (value) => value === "" || net.isIP(value) !== 0,
        message: "Please provide a valid IP address.",
      },
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

// Useful for retrieving a user's activity chronologically.
auditLogSchema.index({ userId: 1, createdAt: -1 });

// Useful for filtering activity by resource.
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

// Prevent ordinary document-level deletion.
auditLogSchema.pre("deleteOne", { document: true, query: false }, function () {
  throw new Error("Audit log entries cannot be deleted.");
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
