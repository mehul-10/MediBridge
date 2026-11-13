
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";
import { createClinicalHandover } from "../services/clinicalHandoverService";
import "./ClinicalHandover.css";

const createInitialFormData = (aiHandover) => ({
  patientId: aiHandover?.patientId || "",
  patientName: "",
  handoverFrom: "",
  handoverTo: "",
  shift: "Morning",
  currentCondition: aiHandover?.patientCondition || "",
  recentTreatment: aiHandover?.currentTreatments || "",
  medicationChanges: aiHandover?.currentMedications || "",
  allergiesRisks: [
    aiHandover?.risksAndObservations || "",
    aiHandover?.missingInformation?.some((item) =>
      item.toLowerCase().includes("allerg")
    )
      ? "Allergy information is not specified. Verify before clinical use."
      : "",
  ]
    .filter(Boolean)
    .join("\n\n"),
  pendingTests: aiHandover?.pendingTests || "",
  followUpTasks: aiHandover?.followUpTasks || "",
  additionalNotes: [
    aiHandover?.relevantHistory
      ? `Relevant History:\n${aiHandover.relevantHistory}`
      : "",
    aiHandover?.missingInformation?.length
      ? `Missing Information:\n${aiHandover.missingInformation.join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n"),
});

function ClinicalHandover() {
  const location = useLocation();
  const aiHandover = location.state?.aiHandover;

  const [formData, setFormData] = useState(() =>
    createInitialFormData(aiHandover)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedHandover, setSavedHandover] = useState(null);

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSavedHandover(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSavedHandover(null);

    const patientObjectId = formData.patientId.trim();

    // A MongoDB ObjectId contains 24 hexadecimal characters.
    if (!/^[a-fA-F0-9]{24}$/.test(patientObjectId)) {
      setError(
        "Enter the patient's valid 24-character MongoDB ID, not the MediBridge patient number."
      );
      return;
    }

    try {
      setLoading(true);

      const handoverTitle = `${formData.patientName.trim()} - ${formData.shift} Handover`;

      const handoverData = {
        patientId: patientObjectId,
        handoverTitle,
        patientCondition: formData.currentCondition.trim(),
        relevantHistory: [
          formData.additionalNotes.trim(),
          `Handover From: ${formData.handoverFrom.trim()}`,
          `Handover To: ${formData.handoverTo.trim()}`,
          `Shift: ${formData.shift}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
        currentTreatments: formData.recentTreatment.trim(),
        currentMedications: formData.medicationChanges.trim(),
        pendingTests: formData.pendingTests.trim(),
        risksAndObservations: formData.allergiesRisks.trim(),
        followUpTasks: formData.followUpTasks.trim(),
      };

      const response = await createClinicalHandover(handoverData);

      if (!response.success || !response.handover) {
        throw new Error(
          response.message || "The handover could not be saved."
        );
      }

      setSavedHandover(response.handover);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save the handover. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="handover-page">
      <header className="handover-header">
        <Link to="/healthcare-dashboard" className="handover-back">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <span className="handover-logo">MediBridge</span>
      </header>

      <main className="handover-container">
        <div className="handover-heading">
          <div className="handover-icon">
            <ClipboardList size={28} />
          </div>
          <div>
            <h1>Clinical Handover</h1>
            <p>
              Prepare a structured patient handover for the next healthcare
              professional.
            </p>
          </div>
        </div>

        {aiHandover && (
          <div className="handover-success">
            <CheckCircle size={20} />
            AI-generated information transferred. Review and verify all
            details before saving.
          </div>
        )}

        {aiHandover && (
          <div className="handover-ai-warning">
            <AlertTriangle size={18} />
            AI-generated content may contain errors or omissions. Verify every
            detail against the patient's authorized medical record.
          </div>
        )}

        {error && (
          <div className="handover-ai-warning" role="alert">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {savedHandover && (
          <div className="handover-success" role="status">
            <CheckCircle size={20} />
            Handover saved successfully as a Draft in MongoDB.
            <br />
            Handover ID: {savedHandover._id}
          </div>
        )}

        <form className="handover-form" onSubmit={handleSubmit}>
          <section className="handover-section">
            <h2>Patient Information</h2>

            <div className="handover-grid">
              <div className="handover-field">
                <label>Patient MongoDB ID *</label>
                <input
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  placeholder="Enter 24-character MongoDB patient ID"
                  required
                />
              </div>

              <div className="handover-field">
                <label>Patient Name *</label>
                <input
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="handover-field">
                <label>Handover From *</label>
                <input
                  name="handoverFrom"
                  value={formData.handoverFrom}
                  onChange={handleChange}
                  placeholder="Outgoing professional"
                  required
                />
              </div>

              <div className="handover-field">
                <label>Handover To *</label>
                <input
                  name="handoverTo"
                  value={formData.handoverTo}
                  onChange={handleChange}
                  placeholder="Incoming professional"
                  required
                />
              </div>

              <div className="handover-field">
                <label>Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                >
                  <option>Morning</option>
                  <option>Evening</option>
                  <option>Night</option>
                  <option>Emergency Transfer</option>
                </select>
              </div>
            </div>
          </section>

          <section className="handover-section">
            <h2>Clinical Information</h2>

            <div className="handover-field">
              <label>Current Condition *</label>
              <textarea
                name="currentCondition"
                value={formData.currentCondition}
                onChange={handleChange}
                placeholder="Describe the patient's current condition and observations..."
                required
              />
            </div>

            <div className="handover-field">
              <label>Recent Treatments and Interventions</label>
              <textarea
                name="recentTreatment"
                value={formData.recentTreatment}
                onChange={handleChange}
                placeholder="Record recent treatments or procedures..."
              />
            </div>

            <div className="handover-field">
              <label>Medication Changes</label>
              <textarea
                name="medicationChanges"
                value={formData.medicationChanges}
                onChange={handleChange}
                placeholder="Record medication changes and relevant details..."
              />
            </div>

            <div className="handover-field">
              <label>Allergies and Risks</label>
              <textarea
                name="allergiesRisks"
                value={formData.allergiesRisks}
                onChange={handleChange}
                placeholder="Document known allergies, precautions, and identified risks..."
              />
            </div>
          </section>

          <section className="handover-section">
            <h2>Pending Actions</h2>

            <div className="handover-field">
              <label>Pending Tests and Results</label>
              <textarea
                name="pendingTests"
                value={formData.pendingTests}
                onChange={handleChange}
                placeholder="List pending investigations and results to review..."
              />
            </div>

            <div className="handover-field">
              <label>Follow-up Tasks *</label>
              <textarea
                name="followUpTasks"
                value={formData.followUpTasks}
                onChange={handleChange}
                placeholder="List tasks that the incoming professional needs to complete..."
                required
              />
            </div>

            <div className="handover-field">
              <label>Additional Notes</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Add any other relevant handover information..."
              />
            </div>
          </section>

          <div className="handover-actions">
            <button
              type="submit"
              className="handover-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="handover-spinner" />
                  Saving...
                </>
              ) : (
                "Save Handover Draft"
              )}
            </button>

            <Link to="/healthcare-dashboard" className="handover-cancel">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ClinicalHandover;
