
import { useEffect, useState } from "react";
import {
  getMyMedications,
  createMedication,
  updateMedication,
  deleteMedication,
} from "../services/medicationService";
import "./Medications.css";

const initialForm = {
  medicationName: "",
  dosage: "",
  frequency: "",
  route: "Oral",
  startDate: "",
  endDate: "",
  prescribingDoctor: "",
  purpose: "",
  instructions: "",
  status: "Active",
};

function Medications() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyMedications();
      setMedications(response.medications || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load medications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, []);

  const openAddForm = () => {
    setEditingMedication(null);
    setFormData(initialForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (medication) => {
    setEditingMedication(medication);

    setFormData({
      medicationName: medication.medicationName || "",
      dosage: medication.dosage || "",
      frequency: medication.frequency || "",
      route: medication.route || "",
      startDate: medication.startDate
        ? new Date(medication.startDate).toISOString().split("T")[0]
        : "",
      endDate: medication.endDate
        ? new Date(medication.endDate).toISOString().split("T")[0]
        : "",
      prescribingDoctor: medication.prescribingDoctor || "",
      purpose: medication.purpose || "",
      instructions: medication.instructions || "",
      status: medication.status || "Active",
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMedication(null);
    setFormData(initialForm);
    setFormError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !formData.medicationName.trim() ||
      !formData.dosage.trim() ||
      !formData.frequency.trim() ||
      !formData.startDate
    ) {
      setFormError(
        "Please complete medication name, dosage, frequency and start date."
      );
      return;
    }

    if (
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      setFormError("End date cannot be before start date.");
      return;
    }

    const payload = {
      ...formData,
      medicationName: formData.medicationName.trim(),
      dosage: formData.dosage.trim(),
      frequency: formData.frequency.trim(),
      endDate: formData.endDate || null,
    };

    try {
      setSaving(true);

      if (editingMedication) {
        await updateMedication(editingMedication._id, payload);
      } else {
        await createMedication(payload);
      }

      closeForm();
      await loadMedications();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Unable to save medication."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medication) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${medication.medicationName}?`
    );

    if (!confirmed) return;

    try {
      await deleteMedication(medication._id);

      setMedications((previous) =>
        previous.filter((item) => item._id !== medication._id)
      );
    } catch (err) {
      window.alert(
        err.response?.data?.message || "Unable to delete medication."
      );
    }
  };

  const filteredMedications = medications.filter((medication) => {
    const matchesSearch = [
      medication.medicationName,
      medication.dosage,
      medication.purpose,
      medication.prescribingDoctor,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || medication.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="medications-page">
      <div className="medications-header">
        <div>
          <h1>My Medications</h1>
          <p>View and manage your medication records.</p>
        </div>

        <button
          className="add-medication-btn"
          onClick={openAddForm}
        >
          + Add Medication
        </button>
      </div>

      <div className="medication-filters">
        <input
          type="text"
          placeholder="Search medications..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Discontinued">Discontinued</option>
        </select>
      </div>

      {loading ? (
        <p>Loading medications...</p>
      ) : error ? (
        <div className="medication-error">
          <p>{error}</p>
          <button onClick={loadMedications}>Try Again</button>
        </div>
      ) : filteredMedications.length === 0 ? (
        <div className="medication-empty">
          <h3>
            {medications.length === 0
              ? "No medications added yet"
              : "No matching medications"}
          </h3>
          <p>
            {medications.length === 0
              ? "Add a medication record to see it here."
              : "Try changing your search or status filter."}
          </p>
          {medications.length === 0 && (
            <button
              className="add-medication-btn"
              onClick={openAddForm}
            >
              + Add Medication
            </button>
          )}
        </div>
      ) : (
        <div className="medication-list">
          {filteredMedications.map((medication) => (
            <div className="medication-card" key={medication._id}>
              <div className="medication-card-header">
                <h3>{medication.medicationName}</h3>

                <span
                  className={`medication-status ${medication.status?.toLowerCase()}`}
                >
                  {medication.status}
                </span>
              </div>

              <p><strong>Dosage:</strong> {medication.dosage}</p>
              <p><strong>Frequency:</strong> {medication.frequency}</p>
              <p>
                <strong>Route:</strong>{" "}
                {medication.route || "Not specified"}
              </p>
              <p>
                <strong>Start date:</strong>{" "}
                {new Date(medication.startDate).toLocaleDateString()}
              </p>
              <p>
                <strong>End date:</strong>{" "}
                {medication.endDate
                  ? new Date(medication.endDate).toLocaleDateString()
                  : "Ongoing"}
              </p>
              <p>
                <strong>Prescribing doctor:</strong>{" "}
                {medication.prescribingDoctor || "Not specified"}
              </p>
              <p>
                <strong>Purpose:</strong>{" "}
                {medication.purpose || "Not specified"}
              </p>
              <p>
                <strong>Instructions:</strong>{" "}
                {medication.instructions || "None"}
              </p>

              <div className="medication-card-actions">
                <button
                  className="edit-medication-btn"
                  onClick={() => openEditForm(medication)}
                >
                  Edit
                </button>

                <button
                  className="delete-medication-btn"
                  onClick={() => handleDelete(medication)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="medication-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div className="medication-modal">
            <div className="medication-modal-header">
              <div>
                <h2>
                  {editingMedication ? "Edit Medication" : "Add Medication"}
                </h2>
                <p>Enter details from your verified medication instructions.</p>
              </div>

              <button
                type="button"
                className="close-medication-modal"
                onClick={closeForm}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="medication-form-grid">
                <div className="medication-form-group">
                  <label>Medication Name *</label>
                  <input
                    name="medicationName"
                    value={formData.medicationName}
                    onChange={handleInputChange}
                    placeholder="Enter medication name"
                    required
                  />
                </div>

                <div className="medication-form-group">
                  <label>Dosage *</label>
                  <input
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    placeholder="e.g. 500 mg"
                    required
                  />
                </div>

                <div className="medication-form-group">
                  <label>Frequency *</label>
                  <input
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    placeholder="As written in instructions"
                    required
                  />
                </div>

                <div className="medication-form-group">
                  <label>Route</label>
                  <select
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                  >
                    <option value="">Select route</option>
                    <option value="Oral">Oral</option>
                    <option value="Topical">Topical</option>
                    <option value="Injection">Injection</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="medication-form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="medication-form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || undefined}
                  />
                </div>

                <div className="medication-form-group">
                  <label>Prescribing Doctor</label>
                  <input
                    name="prescribingDoctor"
                    value={formData.prescribingDoctor}
                    onChange={handleInputChange}
                    placeholder="Doctor's name"
                  />
                </div>

                <div className="medication-form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="medication-form-group full-width">
                  <label>Purpose</label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Recorded reason for this medication"
                  />
                </div>

                <div className="medication-form-group full-width">
                  <label>Instructions / Notes</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter instructions from the prescription or label"
                  />
                </div>
              </div>

              {formError && (
                <div className="medication-form-error">
                  {formError}
                </div>
              )}

              <div className="medication-form-actions">
                <button
                  type="button"
                  className="cancel-medication-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-medication-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingMedication
                    ? "Save Changes"
                    : "Add Medication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Medications;
