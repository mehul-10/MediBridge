
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getMyMedicalHistory,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
} from "../services/medicalHistoryService";

import "./MedicalHistory.css";

const initialForm = {
  conditionName: "",
  diagnosisDate: "",
  diagnosedBy: "",
  hospitalName: "",
  description: "",
  treatment: "",
  status: "Ongoing",
  notes: "",
};

function MedicalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyMedicalHistory();
      setHistory(response.medicalHistory || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load medical history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        item.conditionName?.toLowerCase().includes(search) ||
        item.diagnosedBy?.toLowerCase().includes(search) ||
        item.hospitalName?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [history, searchTerm, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);

    setFormData({
      conditionName: item.conditionName || "",
      diagnosisDate: item.diagnosisDate
        ? new Date(item.diagnosisDate).toISOString().split("T")[0]
        : "",
      diagnosedBy: item.diagnosedBy || "",
      hospitalName: item.hospitalName || "",
      description: item.description || "",
      treatment: item.treatment || "",
      status: item.status || "Ongoing",
      notes: item.notes || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setFormData(initialForm);
  };

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

      if (editingId) {
        await updateMedicalHistory(editingId, formData);
      } else {
        await createMedicalHistory(formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(initialForm);

      await loadHistory();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save medical history. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (historyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medical history entry?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteMedicalHistory(historyId);
      await loadHistory();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this entry. Please try again."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Resolved":
        return "resolved";
      case "Under Observation":
        return "observation";
      default:
        return "ongoing";
    }
  };

  return (
    <div className="medical-history-page">
      <div className="medical-history-header">
        <div>
          <span className="medical-history-eyebrow">
            PERSONAL HEALTH RECORD
          </span>
          <h1>Medical History</h1>
          <p>
            Keep track of your past and ongoing medical conditions in one
            place.
          </p>
        </div>

        <button
          type="button"
          className="medical-history-add-btn"
          onClick={openAddModal}
        >
          <Plus size={19} />
          Add Medical History
        </button>
      </div>

      {error && <div className="medical-history-error">{error}</div>}

      <div className="medical-history-summary">
        <div className="medical-history-summary-icon">
          <ClipboardList size={23} />
        </div>
        <div>
          <span>Total Entries</span>
          <strong>{history.length}</strong>
        </div>
      </div>

      <div className="medical-history-toolbar">
        <div className="medical-history-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search conditions, doctors or hospitals..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by status"
        >
          <option value="All">All Statuses</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Resolved">Resolved</option>
          <option value="Under Observation">Under Observation</option>
        </select>
      </div>

      {loading ? (
        <div className="medical-history-empty">
          Loading medical history...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="medical-history-empty">
          <div className="medical-history-empty-icon">
            <Activity size={30} />
          </div>
          <h3>
            {history.length === 0
              ? "No medical history yet"
              : "No matching entries"}
          </h3>
          <p>
            {history.length === 0
              ? "Add your medical conditions to keep your personal health record updated."
              : "Try changing your search or status filter."}
          </p>

          {history.length === 0 && (
            <button
              type="button"
              className="medical-history-add-btn"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add First Entry
            </button>
          )}
        </div>
      ) : (
        <div className="medical-history-list">
          {filteredHistory.map((item) => (
            <article className="medical-history-card" key={item._id}>
              <div className="medical-history-card-top">
                <div className="medical-history-condition-icon">
                  <Activity size={21} />
                </div>

                <div className="medical-history-condition">
                  <h3>{item.conditionName}</h3>
                  <span
                    className={`medical-history-status ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="medical-history-actions">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    aria-label={`Edit ${item.conditionName}`}
                    title="Edit"
                  >
                    <Edit size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    aria-label={`Delete ${item.conditionName}`}
                    title="Delete"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <div className="medical-history-date">
                <CalendarDays size={16} />
                Diagnosis date: {formatDate(item.diagnosisDate)}
              </div>

              <div className="medical-history-details">
                {item.diagnosedBy && (
                  <div>
                    <span>Diagnosed by</span>
                    <p>{item.diagnosedBy}</p>
                  </div>
                )}

                {item.hospitalName && (
                  <div>
                    <span>Hospital / Clinic</span>
                    <p>{item.hospitalName}</p>
                  </div>
                )}

                {item.description && (
                  <div className="medical-history-full-width">
                    <span>Description</span>
                    <p>{item.description}</p>
                  </div>
                )}

                {item.treatment && (
                  <div className="medical-history-full-width">
                    <span>Treatment</span>
                    <p>{item.treatment}</p>
                  </div>
                )}

                {item.notes && (
                  <div className="medical-history-full-width">
                    <span>Notes</span>
                    <p>{item.notes}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="medical-history-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className="medical-history-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="medical-history-modal-title"
          >
            <div className="medical-history-modal-header">
              <div>
                <h2 id="medical-history-modal-title">
                  {editingId ? "Edit Medical History" : "Add Medical History"}
                </h2>
                <p>
                  Enter details about a medical condition or diagnosis.
                </p>
              </div>

              <button
                type="button"
                className="medical-history-close-btn"
                onClick={closeModal}
                aria-label="Close dialog"
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="medical-history-form-grid">
                <label className="medical-history-form-full">
                  Condition Name *
                  <input
                    type="text"
                    name="conditionName"
                    value={formData.conditionName}
                    onChange={handleChange}
                    placeholder="e.g. Seasonal Allergic Rhinitis"
                    required
                  />
                </label>

                <label>
                  Diagnosis Date
                  <input
                    type="date"
                    name="diagnosisDate"
                    value={formData.diagnosisDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Under Observation">
                      Under Observation
                    </option>
                  </select>
                </label>

                <label>
                  Diagnosed By
                  <input
                    type="text"
                    name="diagnosedBy"
                    value={formData.diagnosedBy}
                    onChange={handleChange}
                    placeholder="Doctor's name"
                  />
                </label>

                <label>
                  Hospital / Clinic
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder="Hospital or clinic name"
                  />
                </label>

                <label className="medical-history-form-full">
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the condition..."
                    rows="3"
                  />
                </label>

                <label className="medical-history-form-full">
                  Treatment
                  <textarea
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleChange}
                    placeholder="Record treatment details..."
                    rows="3"
                  />
                </label>

                <label className="medical-history-form-full">
                  Notes
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes..."
                    rows="2"
                  />
                </label>
              </div>

              <div className="medical-history-form-actions">
                <button
                  type="button"
                  className="medical-history-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="medical-history-add-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicalHistory;
