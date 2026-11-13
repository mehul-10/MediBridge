
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ShieldCheck,
  UserRound,
  Clock,
  LockKeyhole,
  Eye,
  Plus,
  XCircle,
} from "lucide-react";
import "./SecureSharing.css";

function SecureSharing() {
  const accessList = [
    {
      name: "Dr. Ananya Sharma",
      role: "Cardiologist",
      hospital: "City Care Hospital",
      access: "Medical Records",
      expiry: "30 November 2026",
      status: "Active",
    },
    {
      name: "Dr. Rahul Mehta",
      role: "General Physician",
      hospital: "Health First Clinic",
      access: "Reports and Prescriptions",
      expiry: "15 November 2026",
      status: "Active",
    },
  ];

  return (
    <div className="sharing-page">
      <header className="sharing-header">
        <Link to="/patient-dashboard" className="sharing-logo">
          <Activity size={27} />
          MediBridge
        </Link>

        <Link to="/patient-dashboard" className="sharing-back">
          <ArrowLeft size={18} />
          Dashboard
        </Link>
      </header>

      <main className="sharing-main">
        <div className="sharing-title">
          <h1>Secure Sharing & Access</h1>
          <p>Manage who can access your personal health records.</p>
        </div>

        <section className="sharing-banner">
          <ShieldCheck size={34} />
          <div>
            <h3>Your Health Data, Your Control</h3>
            <p>
              MediBridge is designed to let patients control access to
              their medical information and share records securely.
            </p>
          </div>
        </section>

        <section className="sharing-summary">
          <div className="sharing-summary-card">
            <UserRound size={24} />
            <div>
              <h2>{accessList.length}</h2>
              <p>Authorized Providers</p>
            </div>
          </div>

          <div className="sharing-summary-card">
            <LockKeyhole size={24} />
            <div>
              <h2>Restricted</h2>
              <p>Access Control</p>
            </div>
          </div>
        </section>

        <section className="sharing-section">
          <div className="sharing-section-heading">
            <div>
              <h2>People With Access</h2>
              <p>Review the healthcare providers listed in your sample access records.</p>
            </div>

            <button className="sharing-add-button" disabled>
              <Plus size={17} />
              Grant Access
            </button>
          </div>

          <div className="sharing-list">
            {accessList.map((person, index) => (
              <article className="sharing-card" key={index}>
                <div className="sharing-person">
                  <div className="sharing-avatar">
                    <UserRound size={24} />
                  </div>

                  <div>
                    <h3>{person.name}</h3>
                    <p>{person.role} · {person.hospital}</p>
                  </div>
                </div>

                <div className="sharing-details">
                  <p>
                    <Eye size={16} />
                    {person.access}
                  </p>

                  <p>
                    <Clock size={16} />
                    Expires: {person.expiry}
                  </p>
                </div>

                <div className="sharing-card-footer">
                  <span className="sharing-status">
                    {person.status}
                  </span>

                  <button className="sharing-revoke-button" disabled>
                    <XCircle size={16} />
                    Revoke Access
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="sharing-reminder">
          <ShieldCheck size={22} />
          <p>
            Access granting and revocation are visual placeholders.
            Functional permissions, consent records and audit logs will
            be implemented through the backend.
          </p>
        </section>

        <p className="sharing-note">
          All provider names and access entries shown here are fictional
          sample data for development.
        </p>
      </main>
    </div>
  );
}

export default SecureSharing;
