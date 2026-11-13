
const mongoose = require("mongoose");
const Medication = require("../models/Medication");
const Patient = require("../models/Patient");
const { createAuditLog } = require("../services/auditLogService");

// Get the logged-in patient's profile
const getPatientForUser = async (userId) => {
  return Patient.findOne({ userId });
};

// Add a medication
// Add a medication
const createMedication = async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Only patients can add their medication records.",
    });
  }

  const {
    medicationName,
    dosage,
    frequency,
    route,
    startDate,
    endDate,
    prescribingDoctor,
    purpose,
    instructions,
    status,
  } = req.body || {};

  if (!medicationName || !dosage || !frequency || !startDate) {
    return res.status(400).json({
      success: false,
      message: "Medication name, dosage, frequency and start date are required.",
    });
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = endDate ? new Date(endDate) : null;

  if (Number.isNaN(parsedStartDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid start date.",
    });
  }

  if (endDate && Number.isNaN(parsedEndDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid end date.",
    });
  }

  if (parsedEndDate && parsedEndDate < parsedStartDate) {
    return res.status(400).json({
      success: false,
      message: "End date cannot be before start date.",
    });
  }

  const patient = await getPatientForUser(req.user._id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient profile not found.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let medication;

    await session.withTransaction(async () => {
      const [createdMedication] = await Medication.create(
        [{
          patientId: patient._id,
          userId: req.user._id,
          medicationName,
          dosage,
          frequency,
          route,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          prescribingDoctor,
          purpose,
          instructions,
          status,
          createdBy: req.user._id,
        }],
        { session }
      );

      medication = createdMedication;

      await createAuditLog(
        {
          userId: req.user._id,
          action: "CREATE",
          resourceType: "Medication",
          resourceId: medication._id,
          description: "Patient added a medication record.",
          outcome: "SUCCESS",
          ipAddress: req.ip,
        },
        { session }
      );
    });

    return res.status(201).json({
      success: true,
      message: "Medication added successfully.",
      medication,
    });
  } catch (error) {
    console.error("Create medication error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to add medication.",
    });
  } finally {
    await session.endSession();
  }
};

// Get all medications belonging to the logged-in patient
const getMyMedications = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access this medication list.",
      });
    }

    const patient = await getPatientForUser(req.user._id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const medications = await Medication.find({
      patientId: patient._id,
      userId: req.user._id,
    }).sort({ startDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: medications.length,
      medications,
    });
  } catch (error) {
    console.error("Get medications error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve medications.",
    });
  }
};

// Get one medication
const getMedicationById = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access this medication.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medication ID.",
      });
    }

    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found.",
      });
    }

    return res.status(200).json({
      success: true,
      medication,
    });
  } catch (error) {
    console.error("Get medication error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve medication.",
    });
  }
};

// Update a medication
// Update a medication
const updateMedication = async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Only patients can update their medication records.",
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid medication ID.",
    });
  }

  const allowedFields = [
    "medicationName",
    "dosage",
    "frequency",
    "route",
    "startDate",
    "endDate",
    "prescribingDoctor",
    "purpose",
    "instructions",
    "status",
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
      message: "No valid medication fields were provided.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let updatedMedication;

    await session.withTransaction(async () => {
      const medication = await Medication.findOne({
        _id: req.params.id,
        userId: req.user._id,
      }).session(session);

      if (!medication) {
        const error = new Error("Medication not found.");
        error.statusCode = 404;
        throw error;
      }

      const updatedStartDate = updates.startDate !== undefined
        ? new Date(updates.startDate)
        : medication.startDate;

      const updatedEndDate = updates.endDate !== undefined
        ? (updates.endDate ? new Date(updates.endDate) : null)
        : medication.endDate;

      if (
        !updatedStartDate ||
        Number.isNaN(new Date(updatedStartDate).getTime())
      ) {
        const error = new Error("Please provide a valid start date.");
        error.statusCode = 400;
        throw error;
      }

      if (
        updatedEndDate &&
        Number.isNaN(new Date(updatedEndDate).getTime())
      ) {
        const error = new Error("Please provide a valid end date.");
        error.statusCode = 400;
        throw error;
      }

      if (updatedEndDate && updatedEndDate < updatedStartDate) {
        const error = new Error("End date cannot be before start date.");
        error.statusCode = 400;
        throw error;
      }

      Object.assign(medication, updates);
      medication.startDate = updatedStartDate;
      medication.endDate = updatedEndDate;

      await medication.save({ session });

      await createAuditLog(
        {
          userId: req.user._id,
          action: "UPDATE",
          resourceType: "Medication",
          resourceId: medication._id,
          description: "Patient updated a medication record.",
          outcome: "SUCCESS",
          ipAddress: req.ip,
        },
        { session }
      );

      updatedMedication = medication;
    });

    return res.status(200).json({
      success: true,
      message: "Medication updated successfully.",
      medication: updatedMedication,
    });
  } catch (error) {
    console.error("Update medication error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to update medication.",
    });
  } finally {
    await session.endSession();
  }
};

// Delete a medication
// Delete a medication
const deleteMedication = async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Only patients can delete their medication records.",
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid medication ID.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let deletedMedication;

    await session.withTransaction(async () => {
      const medication = await Medication.findOne({
        _id: req.params.id,
        userId: req.user._id,
      }).session(session);

      if (!medication) {
        const error = new Error("Medication not found.");
        error.statusCode = 404;
        throw error;
      }

      await medication.deleteOne({ session });

      await createAuditLog(
        {
          userId: req.user._id,
          action: "DELETE",
          resourceType: "Medication",
          resourceId: medication._id,
          description: "Patient deleted a medication record.",
          outcome: "SUCCESS",
          ipAddress: req.ip,
        },
        { session }
      );

      deletedMedication = medication;
    });

    return res.status(200).json({
      success: true,
      message: "Medication deleted successfully.",
    });
  } catch (error) {
    console.error("Delete medication error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to delete medication.",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createMedication,
  getMyMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
};
