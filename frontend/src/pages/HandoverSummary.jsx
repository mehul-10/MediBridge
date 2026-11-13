
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  User,
  Clock,
  Activity,
  Pill,
  AlertTriangle,
  FlaskConical,
  CheckCircle,
} from "lucide-react";
import "./HandoverSummary.css";

function HandoverSummary() {
  const handover = {
    patientId: "MB-1001",
    patientName: "Alex Morgan",
    handoverFrom: "Dr. Sarah Wilson",
    handoverTo: "Dr. James Carter",
    shift: "Evening",
    date: "01 November 2026",
    currentCondition:
      "Patient is currently stable. Continue monitoring vital signs and general condition.",
    recentTreatment:
      "Routine monitoring and prescribed treatment were documented during the previous shift.",
    medicationChanges:
      "No medication changes recorded in this sample handover.",
    allergiesRisks:
      "Review the patient's verified allergy record before administering medication.",
    pendingTests:
      "Review pending laboratory results when available.",
    followUpTasks:
      "Continue observations, review pending results, and document any changes in condition.",
    additionalNotes:
      "This is fictional demonstration data for the MediBridge prototype.",
  };

  return (
    <div className="summary-page">
      <header className="summary-header">
        <Link to="/healthcare-dashboard" className="summary-back">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <span className="summary-logo">MediBridge</span>
      </header>

      <main className="summary-container">
        <div className="summary-title">
          <div className="summary-title-icon">
            <ClipboardList size={28} />
          </div>
          <div>
            <h1>Handover Summary</h1>
            <p>Structured overview of the patient's clinical handover.</p>
          </div>
        </div>

        <div className="summary-demo-notice">
          Demonstration only — this page currently displays fictional sample data.
        </div>

        <section className="summary-patient-card">
          <div className="summary-patient-top">
            <div className="summary-avatar">
              <User size={27} />
            </div>
            <div>
              <h2>{handover.patientName}</h2>
              <p>Patient ID: {handover.patientId}</p>
            </div>
          </div>

          <div className="summary-meta">
            <div>
              <span>Handover Date</span>
              <strong>{handover.date}</strong>
            </div>
            <div>
              <span>Shift</span>
              <strong>{handover.shift}</strong>
            </div>
            <div>
              <span>Handover From</span>
              <strong>{handover.handoverFrom}</strong>
            </div>
            <div>
              <span>Handover To</span>
              <strong>{handover.handoverTo}</strong>
            </div>
          </div>
        </section>

        <div className="summary-sections">
          <section className="summary-section">
            <div className="summary-section-heading">
              <Activity size={20} />
              <h3>Current Condition</h3>
            </div>
            <p>{handover.currentCondition}</p>
          </section>

          <section className="summary-section">
            <div className="summary-section-heading">
              <ClipboardList size={20} />
              <h3>Recent Treatments</h3>
            </div>
            <p>{handover.recentTreatment}</p>
          </section>

          <section className="summary-section">
            <div className="summary-section-heading">
              <Pill size={20} />
              <h3>Medication Changes</h3>
            </div>
            <p>{handover.medicationChanges}</p>
          </section>

          <section className="summary-section summary-warning">
            <div className="summary-section-heading">
              <AlertTriangle size={20} />
              <h3>Allergies and Risks</h3>
            </div>
            <p>{handover.allergiesRisks}</p>
          </section>

          <section className="summary-section">
            <div className="summary-section-heading">
              <FlaskConical size={20} />
              <h3>Pending Tests and Results</h3>
            </div>
            <p>{handover.pendingTests}</p>
          </section>

          <section className="summary-section">
            <div className="summary-section-heading">
              <CheckCircle size={20} />
              <h3>Follow-up Tasks</h3>
            </div>
            <p>{handover.followUpTasks}</p>
          </section>

          <section className="summary-section">
            <div className="summary-section-heading">
              <Clock size={20} />
              <h3>Additional Notes</h3>
            </div>
            <p>{handover.additionalNotes}</p>
          </section>
        </div>

        <div className="summary-actions">
          <Link to="/clinical-handover" className="summary-new-button">
            Create New Handover
          </Link>
          <Link to="/healthcare-dashboard" className="summary-home-button">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default HandoverSummary;
