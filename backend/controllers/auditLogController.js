
const AuditLog = require("../models/AuditLog");

// Get audit logs for the currently logged-in user
const getMyAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve audit logs.",
    });
  }
};

module.exports = {
  getMyAuditLogs,
};



