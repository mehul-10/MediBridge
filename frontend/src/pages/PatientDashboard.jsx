
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  FileText,
  Pill,
  HeartPulse,
  Clock,
  Share2,
  User,
  Bell,
  LogOut,
  ArrowUpRight,
  FolderOpen,
} from "lucide-react";

import { getMyPatientProfile } from "../services/patientService";
import { getMyMedicalRecords } from "../services/medicalRecordService";
import { getMyClinicalDocuments } from "../services/clinicalDocumentService";
import { getMyMedications } from "../services/medicationService";

import "./PatientDashboard.css";

// Find an array in common API response formats.
const getResponseArray = (response, possibleKeys) => {
  const sources = [
    response,
    response?.data,
    response?.result,
    response?.data?.data,
  ];

  for (const source of sources) {
    if (Array.isArray(source)) return source;

    for (const key of possibleKeys) {
      if (Array.isArray(source?.[key])) {
        return source[key];
      }
    }
  }

  return [];
};

function PatientDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [overview, setOverview] = useState({
    medicalRecords: 0,
    clinicalDocuments: 0,
    medications: 0,
  });

  const [overviewLoading, setOverviewLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        if (!storedUser || !storedUser.patientId) {
          setError("Patient information not found. Please log in again.");
          return;
        }

        const profileData = await getMyPatientProfile(
          storedUser.patientId
        );

        if (profileData.success && profileData.patient) {
          setPatient(profileData.patient);
        } else {
          setError("Unable to load your patient profile.");
        }
      } catch (err) {
        console.error("Patient profile error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const results = await Promise.allSettled([
          getMyMedicalRecords(),
          getMyClinicalDocuments(),
          getMyMedications(),
        ]);

        const records = results[0].status === "fulfilled"
          ? getResponseArray(results[0].value, [
              "records",
              "medicalRecords",
            ])
          : [];

        const documents = results[1].status === "fulfilled"
          ? getResponseArray(results[1].value, [
              "documents",
              "clinicalDocuments",
            ])
          : [];

        const medications = results[2].status === "fulfilled"
          ? getResponseArray(results[2].value, [
              "medications",
            ])
          : [];

        setOverview({
          medicalRecords: records.length,
          clinicalDocuments: documents.length,
          medications: medications.length,
        });

        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(
              `Dashboard overview request ${index + 1} failed:`,
              result.reason
            );
          }
        });
      } finally {
        setOverviewLoading(false);
      }
    };

    loadOverview();
  }, []);

  const features = [
    {
      title: "Medical Records",
      description: "View your prescriptions, reports and medical documents.",
      icon: FileText,
      link: "/medical-records",
    },
    {
      title: "Clinical Documents",
      description: "Upload and manage your reports, prescriptions and scans.",
      icon: FolderOpen,
      link: "/clinical-documents",
    },
    {
      title: "Medications",
      description: "Keep track of your medicines and medication history.",
      icon: Pill,
      link: "/medications",
    },
    {
      title: "Medical History",
      description: "Review your past conditions, treatments and surgeries.",
      icon: HeartPulse,
      link: "/medical-history",
    },
    {
      title: "Health Timeline",
      description: "See your health events and treatment history in order.",
      icon: Clock,
      link: "/health-timeline",
    },
    {
      title: "Secure Sharing",
      description: "Manage access to your health records.",
      icon: Share2,
      link: "/sharing-management",
    },
    {
      title: "Health Profile",
      description: "View and manage your personal health information.",
      icon: User,
      link: "/health-profile",
    },
  ];

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-logo">
          <Activity size={28} />
          <span>MediBridge</span>
        </Link>

        <p className="sidebar-heading">MENU</p>

        <a href="#overview" className="sidebar-link active">
          <LayoutDashboard size={19} />
          Dashboard
        </a>

        <a href="#features" className="sidebar-link">
          <FileText size={19} />
          My Health Records
        </a>

        <a href="#features" className="sidebar-link">
          <Pill size={19} />
          Medications
        </a>

        <Link to="/sharing-management" className="sidebar-link">
          <Share2 size={19} />
          Sharing & Access
        </Link>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-link"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main" id="overview">
        <header className="dashboard-header">
          <div>
            <h1>Patient Dashboard</h1>
            <p>Welcome to your personal health space.</p>
          </div>

          <button
            type="button"
            className="notification-button"
            aria-label="Notifications"
          >
            <Bell size={21} />
          </button>
        </header>

        <section className="dashboard-welcome">
          <div>
            <p className="welcome-label">YOUR HEALTH, CONNECTED</p>

            {loading ? (
              <h2>Loading your profile...</h2>
            ) : error ? (
              <h2>Welcome to MediBridge!</h2>
            ) : (
              <h2>Welcome, {patient?.fullName}!</h2>
            )}

            <p>
              Access your health information and keep your medical journey
              organized in one secure place.
            </p>
          </div>

          <Activity size={75} className="welcome-icon" />
        </section>

        {loading && (
          <p>Fetching your patient information...</p>
        )}

        {error && (
          <div className="profile-error" role="alert">
            {error}
          </div>
        )}

        {patient && (
          <section className="dashboard-stats">
            <div className="stat-card">
              <User size={25} />
              <h3>{patient.fullName}</h3>
              <p>Patient Name</p>
            </div>

            <div className="stat-card">
              <FileText size={25} />
              <h3>{patient.patientId}</h3>
              <p>Patient ID</p>
            </div>

            <div className="stat-card">
              <HeartPulse size={25} />
              <h3>{patient.bloodGroup || "Unknown"}</h3>
              <p>Blood Group</p>
            </div>

            <div className="stat-card">
              <Pill size={25} />
              <h3>{patient.phone || "Not provided"}</h3>
              <p>Phone Number</p>
            </div>
          </section>
        )}

        <section className="dashboard-overview">
          <div className="section-heading">
            <div>
              <h2>Health Overview</h2>
              <p>A quick summary of your health information.</p>
            </div>
          </div>

          <div className="dashboard-stats">
            <Link to="/medical-records" className="stat-card">
              <FileText size={25} />
              <h3>
                {overviewLoading ? "..." : overview.medicalRecords}
              </h3>
              <p>Medical Records</p>
            </Link>

            <Link to="/clinical-documents" className="stat-card">
              <FolderOpen size={25} />
              <h3>
                {overviewLoading ? "..." : overview.clinicalDocuments}
              </h3>
              <p>Clinical Documents</p>
            </Link>

            <Link to="/medications" className="stat-card">
              <Pill size={25} />
              <h3>
                {overviewLoading ? "..." : overview.medications}
              </h3>
              <p>Medications</p>
            </Link>
          </div>
        </section>

        <section className="dashboard-features" id="features">
          <div className="section-heading">
            <div>
              <h2>Your Health Services</h2>
              <p>Everything you need to manage your health information.</p>
            </div>
          </div>

          <div className="feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  to={feature.link}
                  className="dashboard-feature-card"
                  key={feature.title}
                >
                  <div className="feature-icon">
                    <Icon size={24} />
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>

                  <span className="feature-open">
                    Explore <ArrowUpRight size={17} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="dashboard-footer">
          MediBridge — Your health information, connected securely.
        </footer>
      </main>
    </div>
  );
}

export default PatientDashboard;
