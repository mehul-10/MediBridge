
const express = require("express");
const router = express.Router();

const { getMyAuditLogs } = require("../controllers/auditLogController");
const { protect } = require("../middleware/authMiddleware");

// Every audit-log request requires authentication.
router.get("/my-logs", protect, getMyAuditLogs);

module.exports = router;
