const { generateHandoverSummary } = require("../services/aiHandoverService");
const { createAuditLog } = require("../services/auditLogService");

const createAIHandoverSummary = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "healthcare") {
      return res.status(403).json({
        success: false,
        message: "Only healthcare professionals can generate handover summaries.",
      });
    }

    const { clinicalNotes } = req.body;

    if (
      typeof clinicalNotes !== "string" ||
      !clinicalNotes.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Clinical notes are required.",
      });
    }

    if (clinicalNotes.length > 12000) {
      return res.status(400).json({
        success: false,
        message: "Clinical notes must not exceed 12,000 characters.",
      });
    }

    const summary = await generateHandoverSummary(clinicalNotes.trim());
    await createAuditLog({
  userId: req.user._id,
  action: "AI_SUMMARY_GENERATED",
  resourceType: "AIHandover",
  resourceId: null,
  description: "Healthcare professional generated an AI handover summary.",
  outcome: "SUCCESS",
  ipAddress: req.ip || "",
});

    return res.status(200).json({
      success: true,
      message: "Handover draft generated. Clinician review is required.",
      summary,
      clinicianReviewed: false,
    });
  } catch (error) {
    console.error("AI handover generation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate the handover draft. Please try again.",
    });
  }
};

module.exports = { createAIHandoverSummary };
