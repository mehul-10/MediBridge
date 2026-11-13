
import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import {
  ArrowLeft,
  Brain,
  FileText,
  Sparkles,
  RotateCcw,
  ClipboardCheck,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";
import "./AIHandoverAssistant.css";

const summarySections = [
  ["Patient Condition", "patientCondition"],
  ["Relevant History", "relevantHistory"],
  ["Current Treatments", "currentTreatments"],
  ["Current Medications", "currentMedications"],
  ["Pending Tests", "pendingTests"],
  ["Risks and Observations", "risksAndObservations"],
  ["Follow-up Tasks", "followUpTasks"],
];

function AIHandoverAssistant() {
  const [patientId, setPatientId] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSummary = async (e) => {
    e.preventDefault();

    if (!clinicalNotes.trim()) {
      setError("Please enter clinical notes before generating a draft.");
      return;
    }

    setLoading(true);
    setError("");
    setSummary(null);

    try {
      const response = await API.post(
        "/ai-handover/generate",
        { clinicalNotes: clinicalNotes.trim() }
      );

      if (!response.data.success || !response.data.summary) {
        throw new Error(
          response.data.message || "Unable to generate the handover draft."
        );
      }

      setSummary(response.data.summary);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to connect to the AI service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPatientId("");
    setClinicalNotes("");
    setSummary(null);
    setError("");
  };

  return (
    <div className="ai-page">
      <header className="ai-header">
        <Link to="/healthcare-dashboard" className="ai-back">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <span className="ai-logo">MediBridge</span>
      </header>

      <main className="ai-container">
        <div className="ai-heading">
          <div className="ai-heading-icon">
            <Brain size={29} />
          </div>
          <div>
            <h1>AI Handover Assistant</h1>
            <p>Organize clinical notes into a structured handover draft.</p>
          </div>
        </div>

        <div className="ai-demo-notice">
          <Sparkles size={18} />
          <span>
            AI-powered mode: clinical notes are processed by the configured
            AI service to generate a structured handover draft.
          </span>
        </div>

        <div className="ai-workspace">
          <section className="ai-input-card">
            <div className="ai-card-heading">
              <FileText size={20} />
              <h2>Clinical Notes</h2>
            </div>

            <form onSubmit={generateSummary}>
              <div className="ai-field">
                <label htmlFor="patientId">Patient ID (optional)</label>
                <input
                  id="patientId"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID"
                />
              </div>

              <div className="ai-field">
                <label htmlFor="clinicalNotes">Enter Clinical Notes *</label>
                <textarea
                  id="clinicalNotes"
                  value={clinicalNotes}
                  onChange={(e) => {
                    setClinicalNotes(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter relevant clinical information, such as current condition, recent treatments, medication changes, allergies, pending tests, and follow-up tasks..."
                  required
                />
                <span className="ai-hint">
                  Use fictional information while testing this prototype.
                </span>
              </div>

              {error && <p className="ai-error">{error}</p>}

              <div className="ai-buttons">
                <button
                  type="submit"
                  className="ai-generate-button"
                  disabled={loading}
                >
                  {loading ? (
                    <LoaderCircle size={17} className="ai-spinner" />
                  ) : (
                    <Sparkles size={17} />
                  )}
                  {loading ? "Generating Draft..." : "Generate Handover Draft"}
                </button>

                <button
                  type="button"
                  className="ai-reset-button"
                  onClick={resetForm}
                  disabled={loading}
                >
                  <RotateCcw size={16} />
                  Clear
                </button>
              </div>
            </form>
          </section>

          <section className="ai-output-card">
            <div className="ai-card-heading">
              <ClipboardCheck size={20} />
              <h2>Handover Draft</h2>
            </div>

            {summary ? (
              <div className="ai-summary-result">
                {patientId && (
                  <div className="ai-patient-reference">
                    Patient ID: {patientId}
                  </div>
                )}

                {summarySections.map(([label, key]) => (
                  <div className="ai-summary-section" key={key}>
                    <h3>{label}</h3>
                    <p>{summary[key] || "Not specified"}</p>
                  </div>
                ))}

                <div className="ai-summary-section">
                  <h3>Missing Information</h3>
                  {summary.missingInformation?.length > 0 ? (
                    <ul>
                      {summary.missingInformation.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No missing information was identified by the AI.</p>
                  )}
                </div>

                <div className="ai-review-note">
                  <AlertTriangle size={18} />
                  <span>
                    AI-generated draft — clinician review and verification
                    are required before clinical use.
                  </span>
                </div>

                <Link
                  to="/clinical-handover"
                  state={{
                    aiHandover: {
                      ...summary,
                      patientId,
                    },
                  }}
                  className="ai-transfer-button"
                >
                  <ClipboardCheck size={18} />
                  Transfer to Clinical Handover
                </Link>
              </div>
            ) : (
              <div className="ai-empty-state">
                <div className="ai-empty-icon">
                  <FileText size={30} />
                </div>
                <h3>Your draft will appear here</h3>
                <p>
                  Enter clinical notes and select Generate Handover Draft
                  to receive a structured AI-generated summary.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="ai-disclaimer">
          <strong>Clinical safety reminder:</strong> This tool organizes
          supplied information only. It does not diagnose, prescribe, or
          replace professional judgment. Always verify clinical details
          against the patient's authorized medical record.
        </div>

        <div className="ai-footer-actions">
          <Link to="/clinical-handover" className="ai-secondary-link">
            Open Clinical Handover Form
          </Link>
          <Link to="/healthcare-dashboard" className="ai-secondary-link">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AIHandoverAssistant;
