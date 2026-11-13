import { useState } from "react";
import {
  X,
  Pencil,
  FileText,
  Calendar,
  UserRound,
  Building2,
  Activity,
  ClipboardList,
} from "lucide-react";
import { updateMedicalRecord } from "../services/medicalRecordService";
import "./EditMedicalRecord.css";

function EditMedicalRecord({ record, onClose, onRecordUpdated }) {
  const [formData, setFormData] = useState({
    recordType: record.recordType || "Other",
    title: record.title || "",
    description: record.description || "",
    diagnosis: record.diagnosis || "",
    treatment: record.treatment || "",
    doctorName: record.doctorName || "",
    hospitalName: record.hospitalName || "",
    recordDate: record.recordDate
      ? new Date(record.recordDate).toISOString().split("T")[0]
      : "",
    notes: record.notes || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a record title.");
      return;
    }

    if (!formData.recordDate) {
      setError("Please select a record date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await updateMedicalRecord(record._id, {
        ...formData,
        title: formData.title.trim(),
      });

      if (response.success) {
        onRecordUpdated(response.medicalRecord || response.record);
        onClose();
      } else {
        setError(response.message || "Unable to update medical record.");
      }
    } catch (err) {
      console.error("Update medical record error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update medical record. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-record-overlay" onClick={onClose}>
      <div
        className="add-record-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="add-record-header">
          <div className="add-record-heading">
            <div className="add-record-icon">
              <Pencil size={23} />
            </div>

            <div>
              <h2>Edit Medical Record</h2>
              <p>Update the details of your health record.</p>
            </div>
          </div>

          <button
            type="button"
            className="add-record-close"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="add-record-body">
            {error && <div className="add-record-error">{error}</div>}

            <div className="add-record-field">
              <label htmlFor="edit-recordType">Record Type *</label>
              <select
                id="edit-recordType"
                name="recordType"
                value={formData.recordType}
                onChange={handleChange}
                required
              >
                <option value="Diagnosis">Diagnosis</option>
                <option value="Prescription">Prescription</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Imaging">Imaging</option>
                <option value="Treatment">Treatment</option>
                <option value="Consultation">Consultation</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="add-record-field">
              <label htmlFor="edit-title">
                <FileText size={16} /> Record Title *
              </label>
              <input
                id="edit-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="edit-recordDate">
                <Calendar size={16} /> Record Date *
              </label>
              <input
                id="edit-recordDate"
                name="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="edit-hospitalName">
                <Building2 size={16} /> Hospital / Clinic
              </label>
              <input
                id="edit-hospitalName"
                name="hospitalName"
                type="text"
                value={formData.hospitalName}
                onChange={handleChange}
                maxLength={150}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="edit-doctorName">
                <UserRound size={16} /> Doctor Name
              </label>
              <input
                id="edit-doctorName"
                name="doctorName"
                type="text"
                value={formData.doctorName}
                onChange={handleChange}
                maxLength={120}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                maxLength={3000}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="edit-diagnosis">
                <Activity size={16} /> Diagnosis
              </label>
              <textarea
                id="edit-diagnosis"
                name="diagnosis"
                rows="2"
                value={formData.diagnosis}
                onChange={handleChange}
                maxLength={2000}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="edit-treatment">Treatment</label>
              <textarea
                id="edit-treatment"
                name="treatment"
                rows="2"
                value={formData.treatment}
                onChange={handleChange}
                maxLength={2000}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="edit-notes">
                <ClipboardList size={16} /> Additional Notes
              </label>
              <textarea
                id="edit-notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                maxLength={3000}
              />
            </div>
          </div>

          <div className="add-record-footer">
            <button
              type="button"
              className="add-record-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-record-submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMedicalRecord;