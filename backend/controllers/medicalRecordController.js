
const mongoose = require("mongoose");
const MedicalRecord = require("../models/MedicalRecord");
const Patient = require("../models/Patient");
const SharingPermission = require("../models/SharingPermission");
const { createAuditLog } = require("../services/auditLogService");

// Check whether a healthcare professional has permission
// to access a patient's records.
const getActivePermission = async (patientId, healthcareUserId) => {
  return SharingPermission.findOne({
    patientId,
    healthcareUserId,
    status: "active",
    expiresAt: { $gt: new Date() },
  });
};

// CREATE: Add a medical record

// CREATE: Add a medical record
const createMedicalRecord = async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Only patients can create records through this endpoint.",
    });
  }

  const {
    patientId,
    recordType,
    title,
    description,
    diagnosis,
    treatment,
    doctorName,
    hospitalName,
    recordDate,
    notes,
  } = req.body || {};

  if (!patientId || !recordType || !title || !recordDate) {
    return res.status(400).json({
      success: false,
      message: "Patient ID, record type, title, and record date are required.",
    });
  }

  const patient = await Patient.findOne({
    patientId,
    userId: req.user._id,
  });

  if (!patient) {
    return res.status(403).json({
      success: false,
      message: "You can only create records for your own profile.",
    });
  }

  const validRecordTypes = [
    "Diagnosis",
    "Prescription",
    "Lab Report",
    "Imaging",
    "Treatment",
    "Consultation",
    "Discharge Summary",
    "Other",
  ];

  if (!validRecordTypes.includes(recordType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid medical record type.",
    });
  }

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Record title cannot be empty.",
    });
  }

  const parsedRecordDate = new Date(recordDate);

  if (Number.isNaN(parsedRecordDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid record date.",
    });
  }

  const session = await mongoose.startSession();
  let medicalRecord;

  try {
    await session.withTransaction(async () => {
      const createdRecords = await MedicalRecord.create(
        [
          {
            patientId: patient._id,
            userId: patient.userId,
            recordType,
            title: title.trim(),
            description,
            diagnosis,
            treatment,
            doctorName,
            hospitalName,
            recordDate: parsedRecordDate,
            notes,
            createdBy: req.user._id,
          },
        ],
        { session }
      );

      medicalRecord = createdRecords[0];

      await createAuditLog(
        {
          userId: req.user._id,
          action: "CREATE",
          resourceType: "MedicalRecord",
          resourceId: medicalRecord._id,
          description: "Patient created a medical record.",
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
    message: "Medical record created successfully.",
    medicalRecord,
  });
};


// READ: Get all records belonging to the logged-in patient
const getMyMedicalRecords = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is for patient accounts only.",
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

    const records = await MedicalRecord.find({
      patientId: patient._id,
      userId: req.user._id,
    })
      .populate("createdBy", "fullName role")
      .sort({ recordDate: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      medicalRecords: records,
    });
  } catch (error) {
    console.error("Medical record retrieval error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve medical records.",
    });
  }
};

// READ: Get records for a specific patient
const getPatientMedicalRecords = async (req, res) => {
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

    let recordFilter = {
      patientId: patient._id,
      userId: patient.userId,
    };

    if (req.user.role === "patient") {
      if (
        !patient.userId ||
        patient.userId.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only access your own medical records.",
        });
      }
    } else if (req.user.role === "healthcare") {
      const permission = await getActivePermission(
        patient._id,
        req.user._id
      );

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: "The patient has not granted you active access.",
        });
      }

      // Empty selection means all records.
      // Otherwise, return only specifically authorized records.
      if (permission.medicalRecordIds.length > 0) {
        recordFilter._id = {
          $in: permission.medicalRecordIds,
        };
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access medical records.",
      });
    }

    const records = await MedicalRecord.find(recordFilter)
      .populate("createdBy", "fullName role")
      .sort({ recordDate: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      medicalRecords: records,
    });
  } catch (error) {
    console.error("Patient medical records error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve patient medical records.",
    });
  }
};

// READ: Get one specific medical record
const getMedicalRecordById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medical record ID.",
      });
    }

    const record = await MedicalRecord.findById(req.params.id)
      .populate("createdBy", "fullName role");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found.",
      });
    }

    if (req.user.role === "patient") {
      if (record.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied.",
        });
      }
    } else if (req.user.role === "healthcare") {
      const permission = await getActivePermission(
        record.patientId,
        req.user._id
      );

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: "The patient has not granted you active access.",
        });
      }

      const hasRecordAccess =
        permission.medicalRecordIds.length === 0 ||
        permission.medicalRecordIds.some(
          (id) => id.toString() === record._id.toString()
        );

      if (!hasRecordAccess) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to view this record.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view medical records.",
      });
    }

    return res.status(200).json({
      success: true,
      medicalRecord: record,
    });
  } catch (error) {
    console.error("Medical record error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve medical record.",
    });
  }
};

// UPDATE: Update a medical record

const updateMedicalRecord = async (req, res) => {
  let session;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medical record ID.",
      });
    }

    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found.",
      });
    }

    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can update medical records.",
      });
    }

    // Verify both patient ownership and record creator identity
    if (
  !record.userId ||
  record.userId.toString() !== req.user._id.toString() ||
  !record.createdBy ||
  record.createdBy.toString() !== req.user._id.toString()
) {
    return res.status(403).json({
    success: false,
    message: "You are not authorized to update this medical record.",
  });
}

    const allowedFields = [
      "recordType",
      "title",
      "description",
      "diagnosis",
      "treatment",
      "doctorName",
      "hospitalName",
      "recordDate",
      "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(req.body || {}, field)
      ) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
    }

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || !updates.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Record title cannot be empty.",
        });
      }

      updates.title = updates.title.trim();
    }

    const validRecordTypes = [
      "Diagnosis",
      "Prescription",
      "Lab Report",
      "Imaging",
      "Treatment",
      "Consultation",
      "Discharge Summary",
      "Other",
    ];

    if (
      updates.recordType !== undefined &&
      !validRecordTypes.includes(updates.recordType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid medical record type.",
      });
    }

    if (updates.recordDate !== undefined) {
      const parsedDate = new Date(updates.recordDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid record date.",
        });
      }

      updates.recordDate = parsedDate;
    }

    session = await mongoose.startSession();

    let updatedRecord;

    await session.withTransaction(async () => {
      updatedRecord = await MedicalRecord.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        {
          returnDocument: "after",
          runValidators: true,
          session,
        }
      );

      if (!updatedRecord) {
        throw new Error("Medical record was not found during update.");
      }

      await createAuditLog(
        {
          userId: req.user._id,
          action: "UPDATE",
          resourceType: "MedicalRecord",
          resourceId: updatedRecord._id,
          description: "Patient updated a medical record.",
          outcome: "SUCCESS",
          ipAddress: req.ip || "",
        },
        { session }
      );
    });

    return res.status(200).json({
      success: true,
      message: "Medical record updated successfully.",
      medicalRecord: updatedRecord,
    });
  } catch (error) {
    console.error("Medical record update error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update medical record.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


// DELETE: Delete a medical record

const deleteMedicalRecord = async (req, res) => {
  let session;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medical record ID.",
      });
    }

    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can delete medical records.",
      });
    }

    session = await mongoose.startSession();

    let deletedRecord;

    await session.withTransaction(async () => {
      const record = await MedicalRecord.findById(req.params.id).session(
        session
      );

      if (!record) {
        const error = new Error("Medical record not found.");
        error.statusCode = 404;
        throw error;
      }

      // Verify both patient ownership and record creator identity
     if (
     !record.userId ||
     record.userId.toString() !== req.user._id.toString() ||
     !record.createdBy ||
     record.createdBy.toString() !== req.user._id.toString()
) {
     const error = new Error(
    "You are not authorized to delete this medical record."
  );
  error.statusCode = 403;
  throw error;
}

      deletedRecord = record;

      await record.deleteOne({ session });

      await createAuditLog(
        {
          userId: req.user._id,
          action: "DELETE",
          resourceType: "MedicalRecord",
          resourceId: record._id,
          description: "Patient deleted a medical record.",
          outcome: "SUCCESS",
          ipAddress: req.ip || "",
        },
        { session }
      );
    });

    return res.status(200).json({
      success: true,
      message: "Medical record deleted successfully.",
      deletedRecordId: deletedRecord._id,
    });
  } catch (error) {
    console.error("Medical record delete error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to delete medical record.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


module.exports = {
  createMedicalRecord,
  getMyMedicalRecords,
  getPatientMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
};
