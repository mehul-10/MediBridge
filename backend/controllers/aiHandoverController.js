
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

    if (typeof clinicalNotes !== "string" || !clinicalNotes.trim()) {
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

    const errorMessage = (
      error.message || ""
    ).toLowerCase();

    const errorCode = error.status || error.statusCode || error.response?.status;

    // Detect exhausted OpenAI API credits.
    if (
      errorCode === 429 &&
      (
        errorMessage.includes("no credits") ||
        errorMessage.includes("insufficient_quota") ||
        errorMessage.includes("exceeded your current quota") ||
        errorMessage.includes("billing")
      )
    ) {
      return res.status(503).json({
        success: false,
        code: "AI_CREDITS_EXHAUSTED",
        message:
          "AI credits have been exhausted. Please try again later or contact the administrator to restore AI access.",
      });
    }

    // Handle other rate limits separately.
    if (errorCode === 429) {
      return res.status(429).json({
        success: false,
        code: "AI_RATE_LIMITED",
        message:
          "The AI service is receiving too many requests. Please wait a moment and try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "The AI service is temporarily unavailable. Please try again later.",
    });
  }
};

module.exports = { createAIHandoverSummary };
