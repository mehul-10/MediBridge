
import { useState } from "react";
import {
  X,
  FilePlus,
  FileText,
  Calendar,
  UserRound,
  Building2,
  Activity,
  ClipboardList,
} from "lucide-react";
import { createMedicalRecord } from "../services/medicalRecordService";
import "./AddMedicalRecord.css";

function AddMedicalRecord({ onClose, onRecordAdded }) {
  const [formData, setFormData] = useState({
    recordType: "Lab Report",
    title: "",
    description: "",
    diagnosis: "",
    treatment: "",
    doctorName: "",
    hospitalName: "",
    recordDate: new Date().toISOString().split("T")[0],
    notes: "",
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

    try {
      setLoading(true);
      setError("");

      const response = await createMedicalRecord({
  ...formData,
  patientId: JSON.parse(localStorage.getItem("user"))?.patientId,
  title: formData.title.trim(),
});

      if (response.success) {
        onRecordAdded(response.medicalRecord);
        onClose();
      } else {
        setError(response.message || "Unable to save medical record.");
      }
    } catch (err) {
      console.error("Create medical record error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save medical record. Please try again."
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
              <FilePlus size={23} />
            </div>

            <div>
              <h2>Add Medical Record</h2>
              <p>Enter the details of your health record.</p>
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
            {error && (
              <div className="add-record-error">
                {error}
              </div>
            )}

            <div className="add-record-field">
              <label htmlFor="recordType">Record Type *</label>
              <select
                id="recordType"
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
              <label htmlFor="title">
                <FileText size={16} /> Record Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Complete Blood Count"
                value={formData.title}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="recordDate">
                <Calendar size={16} /> Record Date *
              </label>
              <input
                id="recordDate"
                name="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="hospitalName">
                <Building2 size={16} /> Hospital / Clinic
              </label>
              <input
                id="hospitalName"
                name="hospitalName"
                type="text"
                placeholder="Hospital or clinic name"
                value={formData.hospitalName}
                onChange={handleChange}
                maxLength={150}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="doctorName">
                <UserRound size={16} /> Doctor Name
              </label>
              <input
                id="doctorName"
                name="doctorName"
                type="text"
                placeholder="Doctor's name"
                value={formData.doctorName}
                onChange={handleChange}
                maxLength={120}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                placeholder="Enter record description..."
                value={formData.description}
                onChange={handleChange}
                maxLength={3000}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="diagnosis">
                <Activity size={16} /> Diagnosis
              </label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                rows="2"
                placeholder="Enter diagnosis if applicable..."
                value={formData.diagnosis}
                onChange={handleChange}
                maxLength={2000}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="treatment">Treatment</label>
              <textarea
                id="treatment"
                name="treatment"
                rows="2"
                placeholder="Enter treatment information..."
                value={formData.treatment}
                onChange={handleChange}
                maxLength={2000}
              />
            </div>

            <div className="add-record-field">
              <label htmlFor="notes">
                <ClipboardList size={16} /> Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                placeholder="Additional information..."
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
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMedicalRecord;
