import { useEffect, useState } from "react";
import {
  createClinicalHandover,
  getMyClinicalHandovers,
  updateClinicalHandover,
  deleteClinicalHandover,
} from "../services/clinicalHandoverService";

import "./ClinicalHandovers.css";

const emptyForm = {
  patientId: "",
  handoverTitle: "",
  patientCondition: "",
  relevantHistory: "",
  currentTreatments: "",
  currentMedications: "",
  pendingTests: "",
  risksAndObservations: "",
  followUpTasks: "",
  handoverStatus: "Draft",
};

function ClinicalHandovers() {
  const [handovers, setHandovers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyClinicalHandovers();
      setHandovers(response.handovers || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load clinical handovers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await updateClinicalHandover(editingId, formData);
        setSuccess("Clinical handover updated successfully.");
      } else {
        await createClinicalHandover(formData);
        setSuccess("Clinical handover created successfully.");
      }

      setFormData(emptyForm);
      setEditingId(null);

      await fetchHandovers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save clinical handover."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (handover) => {
    setEditingId(handover._id);

    setFormData({
      patientId: handover.patientId?._id || handover.patientId || "",
      handoverTitle: handover.handoverTitle || "",
      patientCondition: handover.patientCondition || "",
      relevantHistory: handover.relevantHistory || "",
      currentTreatments: handover.currentTreatments || "",
      currentMedications: handover.currentMedications || "",
      pendingTests: handover.pendingTests || "",
      risksAndObservations: handover.risksAndObservations || "",
      followUpTasks: handover.followUpTasks || "",
      handoverStatus: handover.handoverStatus || "Draft",
    });

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this clinical handover?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteClinicalHandover(id);

      setSuccess("Clinical handover deleted successfully.");
      await fetchHandovers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete clinical handover."
      );
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="clinical-handovers-page">
      <div className="handover-header">
        <div>
          <h1>Clinical Handovers</h1>
          <p>
            Create, manage and review structured patient handovers.
          </p>
        </div>

        <div className="handover-count">
          <span>{handovers.length}</span>
          <small>Total Handovers</small>
        </div>
      </div>

      {error && <div className="handover-alert error">{error}</div>}
      {success && (
        <div className="handover-alert success">{success}</div>
      )}

      <section className="handover-form-card">
        <h2>
          {editingId ? "Edit Clinical Handover" : "Create New Handover"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="handover-form-grid">
            <div className="handover-field">
              <label>Patient MongoDB ID *</label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                placeholder="Enter patient's MongoDB ID"
                required
                disabled={Boolean(editingId)}
              />
            </div>

            <div className="handover-field">
              <label>Handover Title *</label>
              <input
                type="text"
                name="handoverTitle"
                value={formData.handoverTitle}
                onChange={handleChange}
                placeholder="Enter handover title"
                required
              />
            </div>

            <div className="handover-field full-width">
              <label>Patient Condition *</label>
              <textarea
                name="patientCondition"
                value={formData.patientCondition}
                onChange={handleChange}
                placeholder="Describe the patient's current condition"
                required
              />
            </div>

            <div className="handover-field full-width">
              <label>Relevant Medical History</label>
              <textarea
                name="relevantHistory"
                value={formData.relevantHistory}
                onChange={handleChange}
                placeholder="Enter relevant medical history"
              />
            </div>

            <div className="handover-field full-width">
              <label>Current Treatments</label>
              <textarea
                name="currentTreatments"
                value={formData.currentTreatments}
                onChange={handleChange}
                placeholder="Enter current treatments"
              />
            </div>

            <div className="handover-field full-width">
              <label>Current Medications</label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                placeholder="Enter current medications"
              />
            </div>

            <div className="handover-field full-width">
              <label>Pending Tests</label>
              <textarea
                name="pendingTests"
                value={formData.pendingTests}
                onChange={handleChange}
                placeholder="Enter pending tests"
              />
            </div>

            <div className="handover-field full-width">
              <label>Risks and Observations</label>
              <textarea
                name="risksAndObservations"
                value={formData.risksAndObservations}
                onChange={handleChange}
                placeholder="Enter risks and observations"
              />
            </div>

            <div className="handover-field full-width">
              <label>Follow-up Tasks</label>
              <textarea
                name="followUpTasks"
                value={formData.followUpTasks}
                onChange={handleChange}
                placeholder="Enter follow-up tasks"
              />
            </div>

            <div className="handover-field">
              <label>Handover Status</label>
              <select
                name="handoverStatus"
                value={formData.handoverStatus}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="handover-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                ? "Update Handover"
                : "Create Handover"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="handover-list-section">
        <h2>My Clinical Handovers</h2>

        {loading ? (
          <p className="handover-empty">Loading handovers...</p>
        ) : handovers.length === 0 ? (
          <p className="handover-empty">
            No clinical handovers found. Create your first handover above.
          </p>
        ) : (
          <div className="handover-list">
            {handovers.map((handover) => (
              <article className="handover-card" key={handover._id}>
                <div className="handover-card-header">
                  <div>
                    <h3>{handover.handoverTitle}</h3>
                    <p>
                      Patient:{" "}
                      {handover.patientId?.fullName ||
                        handover.patientId?.patientId ||
                        "Patient"}
                    </p>
                  </div>

                  <span
                    className={`handover-status ${handover.handoverStatus?.toLowerCase()}`}
                  >
                    {handover.handoverStatus}
                  </span>
                </div>

                <p className="handover-condition">
                  {handover.patientCondition}
                </p>

                <div className="handover-card-footer">
                  <small>
                    Created:{" "}
                    {handover.createdAt
                      ? new Date(handover.createdAt).toLocaleDateString()
                      : "N/A"}
                  </small>

                  <div className="handover-card-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(handover)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDelete(handover._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ClinicalHandovers;