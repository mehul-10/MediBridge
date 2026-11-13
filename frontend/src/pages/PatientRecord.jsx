
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  UserRound,
  HeartPulse,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import API from "../services/api";
import "./PatientRecord.css";

function PatientRecord() {
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/patients/${patientId}`);

        setPatient(response.data.patient);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Patient record not found."
            : "Unable to load patient record. Please check your backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  if (loading) {
    return (
      <div className="record-page">
        <header className="record-header">
          <Link to="/healthcare-dashboard" className="record-logo">
            <Activity size={27} />
            MediBridge
          </Link>
        </header>
        <main className="record-not-found">
          <h2>Loading patient record...</h2>
        </main>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="record-page">
        <header className="record-header">
          <Link to="/healthcare-dashboard" className="record-logo">
            <Activity size={27} />
            MediBridge
          </Link>
        </header>

        <main className="record-not-found">
          <h2>{error || "Patient record not found."}</h2>
          <p>Please return to the patient directory.</p>
          <Link to="/patient-search">Back to Patient Search</Link>
        </main>
      </div>
    );
  }

  const allergies = patient.allergies || [];
  const conditions = patient.chronicConditions || [];

  return (
    <div className="record-page">
      <header className="record-header">
        <Link to="/healthcare-dashboard" className="record-logo">
          <Activity size={27} />
          MediBridge
        </Link>

        <Link to="/patient-search" className="record-back">
          <ArrowLeft size={18} />
          Patient Search
        </Link>
      </header>

      <main className="record-main">
        <div className="record-heading">
          <div>
            <h1>Patient Health Record</h1>
            <p>Consolidated patient health information.</p>
          </div>

          <span className="record-access-label">
            <ShieldCheck size={16} />
            Database Record
          </span>
        </div>

        <section className="record-patient-banner">
          <div className="record-avatar">
            <UserRound size={35} />
          </div>

          <div className="record-patient-info">
            <h2>{patient.fullName}</h2>
            <p>Patient ID: {patient.patientId}</p>
            <span>
              {patient.dateOfBirth
                ? new Date(patient.dateOfBirth).toLocaleDateString()
                : "Date of birth not provided"}
              {" · "}
              {patient.gender || "Gender not provided"}
            </span>
          </div>

          <div className="record-blood-group">
            <span>Blood Group</span>
            <strong>{patient.bloodGroup || "Unknown"}</strong>
          </div>
        </section>

        <section className="record-grid">
          <article className="record-info-card">
            <div className="record-card-heading">
              <HeartPulse size={21} />
              <h3>Medical Conditions</h3>
            </div>

            {conditions.length > 0 ? (
              <ul>
                {conditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            ) : (
              <p>No conditions recorded.</p>
            )}
          </article>

          <article className="record-info-card">
            <div className="record-card-heading warning">
              <AlertTriangle size={21} />
              <h3>Known Allergies</h3>
            </div>

            {allergies.length > 0 ? (
              <ul>
                {allergies.map((allergy, index) => (
                  <li key={index}>{allergy}</li>
                ))}
              </ul>
            ) : (
              <p>No allergies recorded.</p>
            )}
          </article>
        </section>

        <section className="record-section">
          <div className="record-section-heading">
            <FileText size={21} />
            <h2>Patient Information</h2>
          </div>

          <div className="record-document-list">
            <article className="record-document">
              <div>
                <h3>Email</h3>
                <p>{patient.email || "Not provided"}</p>
              </div>
            </article>

            <article className="record-document">
              <div>
                <h3>Phone</h3>
                <p>{patient.phone || "Not provided"}</p>
              </div>
            </article>

            <article className="record-document">
              <div>
                <h3>Emergency Contact</h3>
                <p>
                  {patient.emergencyContact?.name || "Not provided"}
                  {patient.emergencyContact?.relationship
                    ? ` (${patient.emergencyContact.relationship})`
                    : ""}
                </p>
                <p>
                  {patient.emergencyContact?.phone || ""}
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="record-handover-link">
          <div>
            <Calendar size={23} />
            <div>
              <h3>Clinical Handover</h3>
              <p>Prepare a structured handover for this patient.</p>
            </div>
          </div>

          <Link to="/clinical-handover">
            Create Handover
          </Link>
        </section>

        <p className="record-disclaimer">
          This prototype retrieves patient information from the MediBridge
          database. Verified healthcare identity, patient consent and
          backend authorization must be implemented before real patient
          records are accessed.
        </p>
      </main>
    </div>
  );
}

export default PatientRecord;
