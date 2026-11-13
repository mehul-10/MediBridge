const fs = require("fs/promises");
const path = require("path");

const ClinicalDocument = require("../models/ClinicalDocument");
const Patient = require("../models/Patient");
const { createAuditLog } = require("../services/auditLogService");

const uploadDirectory = path.join(
  __dirname,
  "../uploads/clinical-documents"
);

const allowedDocumentTypes = [
  "Lab Report",
  "Prescription",
  "Imaging Report",
  "Discharge Summary",
  "Other",
];

// Upload a clinical document
const uploadClinicalDocument = async (req, res) => {
  let uploadedFilePath;

  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can upload clinical documents.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document to upload.",
      });
    }

    uploadedFilePath = req.file.path;

    const {
      documentTitle,
      documentType,
      description,
      documentDate,
    } = req.body;

    if (!documentTitle?.trim() || !documentType) {
      return res.status(400).json({
        success: false,
        message: "Document title and document type are required.",
      });
    }

    if (!allowedDocumentTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type.",
      });
    }

    let parsedDocumentDate = null;

    if (documentDate) {
      parsedDocumentDate = new Date(documentDate);

      if (Number.isNaN(parsedDocumentDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid document date.",
        });
      }
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

    const document = await ClinicalDocument.create({
      patientId: patient._id,
      userId: req.user._id,
      documentTitle: documentTitle.trim(),
      documentType,
      description: description?.trim() || "",
      documentDate: parsedDocumentDate,
      fileName: req.file.originalname,
      filePath: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
    });
    await createAuditLog({
  userId: req.user._id,
  action: "UPLOAD",
  resourceType: "ClinicalDocument",
  resourceId: document._id,
  description: "Patient uploaded a clinical document.",
  outcome: "SUCCESS",
  ipAddress: req.ip || "",
  });

    return res.status(201).json({
      success: true,
      message: "Clinical document uploaded successfully.",
      document,
    });
  } catch (error) {
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }

    console.error("Clinical document upload error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to upload clinical document.",
    });
  }
};

// Get all documents belonging to the logged-in patient
const getMyClinicalDocuments = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access this document list.",
      });
    }

    const documents = await ClinicalDocument.find({
      userId: req.user._id,
    }).sort({ documentDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get clinical documents error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve clinical documents.",
    });
  }
};

// Download a document belonging to the logged-in patient
const downloadClinicalDocument = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can download these documents.",
      });
    }

    const document = await ClinicalDocument.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Clinical document not found.",
      });
    }

    const filePath = path.join(uploadDirectory, document.filePath);

    return res.download(filePath, document.fileName, async (error) => {
  if (error) {
    console.error("Document download error:", error.message);

    if (!res.headersSent) {
      return res.status(404).json({
        success: false,
        message: "Document file could not be found.",
      });
    }

    return;
  }

  await createAuditLog({
    userId: req.user._id,
    action: "DOWNLOAD",
    resourceType: "ClinicalDocument",
    resourceId: document._id,
    description: "Patient downloaded a clinical document.",
    outcome: "SUCCESS",
    ipAddress: req.ip || "",
  });
});
  } catch (error) {
    console.error("Download clinical document error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to download clinical document.",
    });
  }
};

// Update document details (not the uploaded file)
const updateClinicalDocument = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can update their documents.",
      });
    }

    const document = await ClinicalDocument.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Clinical document not found.",
      });
    }

    const {
      documentTitle,
      documentType,
      description,
      documentDate,
    } = req.body;

    if (documentTitle !== undefined) {
      if (typeof documentTitle !== "string" || !documentTitle.trim()) {
        return res.status(400).json({
          success: false,
          message: "Document title cannot be empty.",
        });
      }

      document.documentTitle = documentTitle.trim();
    }

    if (documentType !== undefined) {
      if (!allowedDocumentTypes.includes(documentType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid document type.",
        });
      }

      document.documentType = documentType;
    }

    if (description !== undefined) {
      document.description =
        typeof description === "string" ? description.trim() : "";
    }

    if (documentDate !== undefined) {
      if (documentDate === "") {
        document.documentDate = null;
      } else {
        const parsedDate = new Date(documentDate);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid document date.",
          });
        }

        document.documentDate = parsedDate;
      }
    }

    await document.save();

    return res.status(200).json({
      success: true,
      message: "Clinical document details updated successfully.",
      document,
    });
  } catch (error) {
    console.error("Update clinical document error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update clinical document.",
    });
  }
};

// Delete a document and its stored file
const deleteClinicalDocument = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can delete their documents.",
      });
    }

    const document = await ClinicalDocument.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Clinical document not found.",
      });
    }

    const filePath = path.join(uploadDirectory, document.filePath);

    await document.deleteOne();

await fs.unlink(filePath).catch((error) => {
  if (error.code !== "ENOENT") {
    console.error("File deletion error:", error.message);
  }
});

await createAuditLog({
  userId: req.user._id,
  action: "DELETE",
  resourceType: "ClinicalDocument",
  resourceId: document._id,
  description: "Patient deleted a clinical document.",
  outcome: "SUCCESS",
  ipAddress: req.ip || "",
});

    return res.status(200).json({
      success: true,
      message: "Clinical document deleted successfully.",
    });
  } catch (error) {
    console.error("Delete clinical document error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete clinical document.",
    });
  }
};

module.exports = {
  uploadClinicalDocument,
  getMyClinicalDocuments,
  downloadClinicalDocument,
  updateClinicalDocument,
  deleteClinicalDocument,
};