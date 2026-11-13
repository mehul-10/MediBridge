const AuditLog = require("../models/AuditLog");

const createAuditLog = async (data, options = {}) => {
  if (!data || !data.action || !data.resourceType) {
    throw new Error("Audit log action and resource type are required.");
  }

  const auditLogData = {
    userId: data.userId || null,
    action: data.action,
    resourceType: data.resourceType,
    resourceId: data.resourceId || null,
    description: data.description || "",
    outcome: data.outcome || "SUCCESS",
    ipAddress: data.ipAddress || "",
  };

  const auditLog = new AuditLog(auditLogData);

  await auditLog.save({
    session: options.session || null,
  });

  return auditLog;
};

module.exports = { createAuditLog };