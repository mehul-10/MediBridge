
const mongoose = require("mongoose");
const ClinicalHandover = require("../models/ClinicalHandover");
const Patient = require("../models/Patient");
const SharingPermission = require("../models/SharingPermission");
const { createAuditLog } = require("../services/auditLogService");

// Check whether a healthcare professional has active
// all-records permission for a patient.
const hasActiveAllRecordsPermission = async (patientId, healthcareUserId) => {
  const permission = await SharingPermission.findOne({
    patientId,
    healthcareUserId,
    status: "active",
    expiresAt: { $gt: new Date() },
    medicalRecordIds: { $size: 0 },
  });

  return Boolean(permission);
};

// Create a new clinical handover
// Create a new clinical handover
const createClinicalHandover = async (req, res) => {
  let session;

  try {
    if (req.user.role !== "healthcare") {
      return res.status(403).json({
        success: false,
        message: "Only healthcare professionals can create handovers.",
      });
    }

    const {
      patientId,
      handoverTitle,
      patientCondition,
      relevantHistory,
      currentTreatments,
      currentMedications,
      pendingTests,
      risksAndObservations,
      followUpTasks,
    } = req.body;

    if (
      !patientId ||
      !mongoose.Types.ObjectId.isValid(patientId) ||
      !handoverTitle?.trim() ||
      !patientCondition?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid patient ID, handover title and patient condition are required.",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    session = await mongoose.startSession();

    let createdHandover;

    await session.withTransaction(async () => {
      // Verify active all-records consent.
      const permission = await SharingPermission.findOne({
        patientId: patient._id,
        healthcareUserId: req.user._id,
        status: "active",
        expiresAt: { $gt: new Date() },
        medicalRecordIds: { $size: 0 },
      }).session(session);

      if (!permission) {
        const error = new Error(
          "Active all-records patient consent is required to create a clinical handover."
        );
        error.statusCode = 403;
        throw error;
      }

      const [handover] = await ClinicalHandover.create(
        [
          {
            patientId: patient._id,
            createdBy: req.user._id,
            handoverTitle,
            patientCondition,
            relevantHistory,
            currentTreatments,
            currentMedications,
            pendingTests,
            risksAndObservations,
            followUpTasks,
          },
        ],
        { session }
      );

      await createAuditLog(
        {
          userId: req.user._id,
          action: "CREATE",
          resourceType: "ClinicalHandover",
          resourceId: handover._id,
          description:
            "Healthcare professional created a clinical handover.",
          outcome: "SUCCESS",
          ipAddress: req.ip || "",
        },
        { session }
      );

      createdHandover = handover;
    });

    return res.status(201).json({
      success: true,
      message: "Clinical handover created successfully.",
      handover: createdHandover,
    });
  } catch (error) {
    console.error("Create clinical handover error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 403
          ? error.message
          : "Unable to create clinical handover.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// Get handovers created by the logged-in healthcare professional
const getMyClinicalHandovers = async (req, res) => {
  try {
    if (req.user.role !== "healthcare") {
      return res.status(403).json({
        success: false,
        message: "Only healthcare professionals can access this resource.",
      });
    }

    const activePermissions = await SharingPermission.find({
  healthcareUserId: req.user._id,
  status: "active",
  expiresAt: { $gt: new Date() },
  medicalRecordIds: { $size: 0 },
}).select("patientId");

const permittedPatientIds = activePermissions.map(
  (permission) => permission.patientId
);

const handovers = await ClinicalHandover.find({
  createdBy: req.user._id,
  patientId: { $in: permittedPatientIds },
})
  .populate("patientId", "fullName patientId")
  .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: handovers.length,
      handovers,
    });
  } catch (error) {
    console.error("Get clinical handovers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve clinical handovers.",
    });
  }
};

// Get one handover created by the logged-in healthcare professional
const getClinicalHandoverById = async (req, res) => {
  try {
    if (req.user.role !== "healthcare") {
      return res.status(403).json({
        success: false,
        message: "Only healthcare professionals can access this resource.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid handover ID.",
      });
    }

    const handover = await ClinicalHandover.findOne({
  _id: req.params.id,
  createdBy: req.user._id,
}).populate("patientId", "fullName patientId");

if (!handover) {
  return res.status(404).json({
    success: false,
    message: "Clinical handover not found.",
  });
}

const hasConsent = await hasActiveAllRecordsPermission(
  handover.patientId._id,
  req.user._id
);

if (!hasConsent) {
  return res.status(403).json({
    success: false,
    message: "Active all-records patient consent is required to access this handover.",
  });
}

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: "Clinical handover not found.",
      });
    }

    return res.status(200).json({
      success: true,
      handover,
    });
  } catch (error) {
    console.error("Get clinical handover error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve clinical handover.",
    });
  }
};

// Update a handover created by the logged-in healthcare professional
// Update a handover created by the logged-in healthcare professional
const updateClinicalHandover = async (req, res) => {
  let session;

  try {
    if (req.user.role !== "healthcare") {
      return res.status(403).json({
        success: false,
        message: "Only healthcare professionals can update handovers.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid handover ID.",
      });
    }

    const allowedFields = [
      "handoverTitle",
      "patientCondition",
      "relevantHistory",
      "currentTreatments",
      "currentMedications",
      "pendingTests",
      "risksAndObservations",
      "followUpTasks",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.handoverTitle !== undefined &&
      !updates.handoverTitle?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Handover title cannot be empty.",
      });
    }

    if (
      updates.patientCondition !== undefined &&
      !updates.patientCondition?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Patient condition cannot be empty.",
      });
    }

    session = await mongoose.startSession();

    let updatedHandover;
    let responseStatus = 200;

    await session.withTransaction(async () => {
      const handover = await ClinicalHandover.findOne({
        _id: req.params.id,
        createdBy: req.user._id,
      }).session(session);

      if (!handover) {
        const error = new Error("Clinical handover not found.");
        error.statusCode = 404;
        throw error;
      }

      const permission = await SharingPermission.findOne({
        patientId: handover.patientId,
        healthcareUserId: req.user._id,
        status: "active",
        expiresAt: { $gt: new Date() },
        medicalRecordIds: { $size: 0 },
      }).session(session);

      if (!permission) {
        const error = new Error(
          "Active all-records patient consent is required to update this handover."
        );
        error.statusCode = 403;
        throw error;
      }

      if (Object.keys(updates).length === 0) {
        updatedHandover = handover;
        responseStatus = 200;
        return;
      }

      Object.assign(handover, updates);

      // Content changes invalidate the old AI summary and review state.
      handover.aiSummary = "";
      handover.aiSummaryGenerated = false;
      handover.clinicianReviewed = false;
      handover.handoverStatus = "Draft";

      await handover.save({ session });

      await createAuditLog(
        {
          userId: req.user._id,
          action: "UPDATE",
          resourceType: "ClinicalHandover",
          resourceId: handover._id,
          description:
            "Healthcare professional updated a clinical handover.",
          outcome: "SUCCESS",
          ipAddress: req.ip || "",
        },
        { session }
      );

      updatedHandover = handover;
    });

    return res.status(responseStatus).json({
      success: true,
      message: "Clinical handover updated successfully.",
      handover: updatedHandover,
    });
  } catch (error) {
    console.error("Update clinical handover error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to update clinical handover.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// Delete a handover created by the logged-in healthcare professional
// Delete a handover created by the logged-in healthcare professional
const deleteClinicalHandover = async (req, res) => {
  let session;

  try {
    if (req.user.role !== "healthcare") {
      return res.status(403).json({
        success: false,
        message: "Only healthcare professionals can delete handovers.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid handover ID.",
      });
    }

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const handover = await ClinicalHandover.findOne({
        _id: req.params.id,
        createdBy: req.user._id,
      }).session(session);

      if (!handover) {
        const error = new Error("Clinical handover not found.");
        error.statusCode = 404;
        throw error;
      }

      const permission = await SharingPermission.findOne({
        patientId: handover.patientId,
        healthcareUserId: req.user._id,
        status: "active",
        expiresAt: { $gt: new Date() },
        medicalRecordIds: { $size: 0 },
      }).session(session);

      if (!permission) {
        const error = new Error(
          "Active all-records patient consent is required to delete this handover."
        );
        error.statusCode = 403;
        throw error;
      }

      await ClinicalHandover.deleteOne(
        { _id: handover._id },
        { session }
      );

      await createAuditLog(
        {
          userId: req.user._id,
          action: "DELETE",
          resourceType: "ClinicalHandover",
          resourceId: handover._id,
          description:
            "Healthcare professional deleted a clinical handover.",
          outcome: "SUCCESS",
          ipAddress: req.ip || "",
        },
        { session }
      );
    });

    return res.status(200).json({
      success: true,
      message: "Clinical handover deleted successfully.",
    });
  } catch (error) {
    console.error("Delete clinical handover error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to delete clinical handover.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = {
  createClinicalHandover,
  getMyClinicalHandovers,
  getClinicalHandoverById,
  updateClinicalHandover,
  deleteClinicalHandover,
};
