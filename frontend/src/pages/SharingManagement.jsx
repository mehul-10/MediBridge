
import { useEffect, useState } from "react";
import { ShieldCheck, UserPlus, Trash2, RefreshCw, Clock } from "lucide-react";
import {
  grantSharingAccess,
  getMySharingPermissions,
  revokeSharingAccess,
} from "../services/sharingService";
import { getMyMedicalRecords } from "../services/medicalRecordService";
import "./SharingManagement.css";

const getLocalDateTime = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const SharingManagement = () => {
  const [healthcareEmail, setHealthcareEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shareAll, setShareAll] = useState(true);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);

  const [records, setRecords] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [recordData, permissionData] = await Promise.all([
        getMyMedicalRecords(),
        getMySharingPermissions(),
      ]);

      setRecords(recordData.medicalRecords || []);
      setPermissions(permissionData.permissions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load sharing information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordSelection = (recordId) => {
    setSelectedRecordIds((previous) =>
      previous.includes(recordId)
        ? previous.filter((id) => id !== recordId)
        : [...previous, recordId]
    );
  };

  const handleGrantAccess = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!healthcareEmail.trim()) {
      setError("Please enter the healthcare professional's email.");
      return;
    }

    if (!expiresAt || new Date(expiresAt) <= new Date()) {
      setError("Please select a future expiry date and time.");
      return;
    }

    if (!shareAll && selectedRecordIds.length === 0) {
      setError("Please select at least one medical record.");
      return;
    }

    try {
      setSubmitting(true);

      const sharingData = {
        healthcareEmail: healthcareEmail.trim(),
        medicalRecordIds: shareAll ? [] : selectedRecordIds,
        expiresAt: new Date(expiresAt).toISOString(),
      };

      const response = await grantSharingAccess(sharingData);

      setSuccess(response.message || "Access granted successfully.");

      setHealthcareEmail("");
      setExpiresAt("");
      setSelectedRecordIds([]);
      setShareAll(true);

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to grant sharing access."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAccess = async (permissionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this sharing permission?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      setRevokingId(permissionId);

      const response = await revokeSharingAccess(permissionId);

      setSuccess(response.message || "Access revoked successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to revoke access."
      );
    } finally {
      setRevokingId(null);
    }
  };

  const getPermissionStatus = (permission) => {
    if (permission.status === "revoked") return "Revoked";

    if (
      permission.status === "expired" ||
      new Date(permission.expiresAt) <= new Date()
    ) {
      return "Expired";
    }

    return "Active";
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="sharing-page">
        <div className="sharing-loading">
          <RefreshCw size={22} className="sharing-spinner" />
          <p>Loading sharing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sharing-page">
      <div className="sharing-header">
        <div>
          <h1>Secure Record Sharing</h1>
          <p>
            Manage which healthcare professionals can view your medical
            records.
          </p>
        </div>

        <div className="sharing-header-icon">
          <ShieldCheck size={30} />
        </div>
      </div>

      {error && <div className="sharing-alert sharing-error">{error}</div>}
      {success && (
        <div className="sharing-alert sharing-success">{success}</div>
      )}

      <section className="sharing-card">
        <div className="sharing-section-heading">
          <UserPlus size={22} />
          <div>
            <h2>Grant New Access</h2>
            <p>Choose a healthcare professional and set their access period.</p>
          </div>
        </div>

        <form onSubmit={handleGrantAccess}>
          <div className="sharing-form-group">
            <label htmlFor="healthcareEmail">
              Healthcare Professional's Email
            </label>
            <input
              id="healthcareEmail"
              type="email"
              value={healthcareEmail}
              onChange={(event) => setHealthcareEmail(event.target.value)}
              placeholder="doctor@example.com"
              required
            />
          </div>

          <div className="sharing-form-group">
            <label htmlFor="expiresAt">Access Expiry Date and Time</label>
            <input
              id="expiresAt"
              type="datetime-local"
              min={getLocalDateTime()}
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              required
            />
          </div>

          <div className="sharing-access-options">
            <label className="sharing-radio-option">
              <input
                type="radio"
                name="sharingScope"
                checked={shareAll}
                onChange={() => {
                  setShareAll(true);
                  setSelectedRecordIds([]);
                }}
              />
              <span>
                <strong>Share all medical records</strong>
                <small>The professional can view all your records.</small>
              </span>
            </label>

            <label className="sharing-radio-option">
              <input
                type="radio"
                name="sharingScope"
                checked={!shareAll}
                onChange={() => setShareAll(false)}
              />
              <span>
                <strong>Share selected records only</strong>
                <small>Choose exactly which records can be viewed.</small>
              </span>
            </label>
          </div>

          {!shareAll && (
            <div className="sharing-record-selection">
              <h3>Select Medical Records</h3>

              {records.length === 0 ? (
                <p className="sharing-empty">
                  You do not have any medical records to share.
                </p>
              ) : (
                records.map((record) => (
                  <label
                    className="sharing-record-option"
                    key={record._id}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecordIds.includes(record._id)}
                      onChange={() => handleRecordSelection(record._id)}
                    />

                    <span>
                      <strong>{record.title}</strong>
                      <small>
                        {record.recordType} ·{" "}
                        {formatDate(record.recordDate)}
                      </small>
                    </span>
                  </label>
                ))
              )}
            </div>
          )}

          <button
            type="submit"
            className="sharing-primary-button"
            disabled={submitting}
          >
            <ShieldCheck size={18} />
            {submitting ? "Granting Access..." : "Grant Access"}
          </button>
        </form>
      </section>

      <section className="sharing-card">
        <div className="sharing-section-heading">
          <Clock size={22} />
          <div>
            <h2>Your Sharing Permissions</h2>
            <p>Review and revoke access whenever you need to.</p>
          </div>
        </div>

        {permissions.length === 0 ? (
          <div className="sharing-empty">
            <ShieldCheck size={35} />
            <p>You have not granted access to any healthcare professional.</p>
          </div>
        ) : (
          <div className="sharing-permission-list">
            {permissions.map((permission) => {
              const status = getPermissionStatus(permission);
              const healthcareUser = permission.healthcareUserId;

              return (
                <div
                  className="sharing-permission-item"
                  key={permission._id}
                >
                  <div className="sharing-permission-info">
                    <h3>
                      {healthcareUser?.fullName || "Healthcare Professional"}
                    </h3>

                    <p>{healthcareUser?.email || "Email unavailable"}</p>

                    <p>
                      <strong>Records: </strong>
                      {permission.medicalRecordIds?.length
                        ? permission.medicalRecordIds
                            .map((record) => record.title)
                            .join(", ")
                        : "All medical records"}
                    </p>

                    <p>
                      <strong>Granted: </strong>
                      {formatDate(permission.grantedAt)}
                    </p>

                    <p>
                      <strong>Expires: </strong>
                      {formatDate(permission.expiresAt)}
                    </p>
                  </div>

                  <div className="sharing-permission-actions">
                    <span
                      className={`sharing-status sharing-status-${status.toLowerCase()}`}
                    >
                      {status}
                    </span>

                    {status === "Active" && (
                      <button
                        type="button"
                        className="sharing-revoke-button"
                        onClick={() => handleRevokeAccess(permission._id)}
                        disabled={revokingId === permission._id}
                      >
                        <Trash2 size={16} />
                        {revokingId === permission._id
                          ? "Revoking..."
                          : "Revoke Access"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default SharingManagement;
