
const mongoose = require("mongoose");
const User = require("../models/User");
const Patient = require("../models/Patient");
const MedicalRecord = require("../models/MedicalRecord");
const SharingPermission = require("../models/SharingPermission");
const { createAuditLog } = require("../services/auditLogService");

// Grant access to a healthcare professional

// Grant access to a healthcare professional
const grantAccess = async (req, res) => {
  try {
    const { healthcareEmail, medicalRecordIds, expiresAt } = req.body;

    if (!healthcareEmail || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Healthcare email and expiry date are required.",
      });
    }

    if (
      medicalRecordIds !== undefined &&
      !Array.isArray(medicalRecordIds)
    ) {
      return res.status(400).json({
        success: false,
        message: "Medical record IDs must be an array.",
      });
    }

    const expiryDate = new Date(expiresAt);

    if (
      Number.isNaN(expiryDate.getTime()) ||
      expiryDate <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid future expiry date.",
      });
    }

    const patient = await Patient.findOne({
      userId: req.user._id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const healthcareUser = await User.findOne({
      email: healthcareEmail.toLowerCase().trim(),
      role: "healthcare",
      isActive: true,
    });

    if (!healthcareUser) {
      return res.status(404).json({
        success: false,
        message: "Active healthcare professional not found.",
      });
    }

    const selectedIds = medicalRecordIds || [];

    if (selectedIds.length > 0) {
      const uniqueIds = [...new Set(selectedIds.map(String))];

      if (
        uniqueIds.length !== selectedIds.length ||
        uniqueIds.some((id) => !mongoose.isValidObjectId(id))
      ) {
        return res.status(400).json({
          success: false,
          message: "One or more medical record IDs are invalid.",
        });
      }

      const matchingRecords = await MedicalRecord.countDocuments({
        _id: { $in: uniqueIds },
        patientId: patient._id,
        userId: req.user._id,
      });

      if (matchingRecords !== uniqueIds.length) {
        return res.status(403).json({
          success: false,
          message: "One or more records do not belong to your account.",
        });
      }
    }

    // Save permission and audit log atomically.
    const session = await mongoose.startSession();
    let permission;

    try {
      await session.withTransaction(async () => {
        const createdPermissions = await SharingPermission.create(
          [
            {
              patientId: patient._id,
              healthcareUserId: healthcareUser._id,
              medicalRecordIds: selectedIds,
              expiresAt: expiryDate,
              accessLevel: "view",
              status: "active",
            },
          ],
          { session }
        );

        permission = createdPermissions[0];

        await createAuditLog(
          {
            userId: req.user._id,
            action: "CONSENT_GRANTED",
            resourceType: "SharingPermission",
            resourceId: permission._id,
            description: "Patient granted healthcare professional access.",
            outcome: "SUCCESS",
            ipAddress: req.ip || "",
          },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: "Access granted successfully.",
      permission,
    });
  } catch (error) {
    console.error("Grant access error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to grant access.",
    });
  }
};


// Get permissions granted by the logged-in patient
const getMySharingPermissions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const permissions = await SharingPermission.find({
      patientId: patient._id,
    })
      .populate("healthcareUserId", "fullName email")
      .populate("medicalRecordIds", "title recordType recordDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: permissions.length,
      permissions,
    });
  } catch (error) {
    console.error("Get sharing permissions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve sharing permissions.",
    });
  }
};

// Revoke an existing permission

const revokeAccess = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user._id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const session = await mongoose.startSession();
    let revokedPermission;

    try {
      await session.withTransaction(async () => {
        const permission = await SharingPermission.findOne({
          _id: req.params.id,
          patientId: patient._id,
        }).session(session);

        if (!permission) {
          const error = new Error("Sharing permission not found.");
          error.statusCode = 404;
          throw error;
        }

        if (permission.status === "revoked") {
          const error = new Error("This permission has already been revoked.");
          error.statusCode = 400;
          throw error;
        }

        permission.status = "revoked";
        permission.revokedAt = new Date();

        await permission.save({ session });

        await createAuditLog(
          {
            userId: req.user._id,
            action: "CONSENT_REVOKED",
            resourceType: "SharingPermission",
            resourceId: permission._id,
            description: "Patient revoked healthcare professional access.",
            outcome: "SUCCESS",
            ipAddress: req.ip || "",
          },
          { session }
        );

        revokedPermission = permission;
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Access revoked successfully.",
      permission: revokedPermission,
    });
  } catch (error) {
    console.error("Revoke access error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to revoke access.",
    });
  }
};


module.exports = {
  grantAccess,
  getMySharingPermissions,
  revokeAccess,
};
