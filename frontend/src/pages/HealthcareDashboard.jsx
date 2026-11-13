
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Users,
  ClipboardList,
  Clock,
  Search,
  FileText,
  ArrowRight,
  Bell,
  Stethoscope,
  CheckCircle,
  LogOut,
  Brain,
  Sparkles,
} from "lucide-react";
import "./HealthcareDashboard.css";

function HealthcareDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const stats = [
    {
      title: "Assigned Patients",
      value: "24",
      icon: Users,
      color: "blue",
    },
    {
      title: "Pending Handovers",
      value: "05",
      icon: ClipboardList,
      color: "orange",
    },
    {
      title: "Completed Today",
      value: "12",
      icon: CheckCircle,
      color: "green",
    },
  ];

  const activities = [
    {
      patient: "Patient MB-2026-001",
      task: "Clinical handover pending",
      time: "10:30 AM",
      status: "Pending",
    },
    {
      patient: "Patient MB-2026-002",
      task: "Medical record reviewed",
      time: "09:45 AM",
      status: "Completed",
    },
    {
      patient: "Patient MB-2026-003",
      task: "Follow-up assessment",
      time: "09:15 AM",
      status: "Pending",
    },
  ];

  return (
    <div className="healthcare-dashboard">
      <aside className="healthcare-sidebar">
        <Link to="/" className="healthcare-brand">
          <Activity size={27} />
          MediBridge
        </Link>

        <div className="healthcare-user">
          <div className="healthcare-user-avatar">
            <Stethoscope size={22} />
          </div>

          <div>
            <h3>Dr. Alex Morgan</h3>
            <p>Healthcare Professional</p>
          </div>
        </div>

        <nav className="healthcare-nav">
          <Link to="/healthcare-dashboard" className="healthcare-nav-active">
            <Activity size={19} />
            Dashboard
          </Link>

          <Link to="/patient-search">
            <Search size={19} />
            Patient Search
          </Link>

          <Link to="/clinical-handover">
            <ClipboardList size={19} />
            Clinical Handover
          </Link>

          <Link to="/clinical-handovers">
            <FileText size={19} />
            Manage Handovers
          </Link>

          <Link to="/handover-summary">
            <FileText size={19} />
            Handover Summaries
          </Link>

          <Link to="/ai-handover-assistant">
            <Brain size={19} />
            AI Handover Assistant
            <Sparkles size={15} />
          </Link>
        </nav>

        <button
          type="button"
          className="healthcare-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          Sign Out
        </button>
      </aside>

      <main className="healthcare-content">
        <header className="healthcare-topbar">
          <div>
            <h1>Healthcare Dashboard</h1>
            <p>Manage patient information and clinical activities.</p>
          </div>

          <button className="healthcare-notification" disabled>
            <Bell size={21} />
          </button>
        </header>

        <section className="healthcare-welcome">
          <div>
            <h2>Welcome back, Dr. Alex!</h2>
            <p>
              Review your assigned patients and keep clinical handovers
              organized.
            </p>
          </div>

          <Stethoscope size={48} />
        </section>

        <section className="healthcare-stats">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <article className="healthcare-stat-card" key={index}>
                <div className={`healthcare-stat-icon ${stat.color}`}>
                  <Icon size={23} />
                </div>

                <div>
                  <h2>{stat.value}</h2>
                  <p>{stat.title}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="healthcare-quick-actions">
          <h2>Quick Actions</h2>

          <div className="healthcare-action-grid">
            <Link to="/patient-search" className="healthcare-action-card">
              <Search size={25} />
              <h3>Find Patient</h3>
              <p>Search for a patient record.</p>
              <ArrowRight size={18} />
            </Link>

            <Link to="/clinical-handover" className="healthcare-action-card">
              <ClipboardList size={25} />
              <h3>Create Handover</h3>
              <p>Prepare a clinical shift handover.</p>
              <ArrowRight size={18} />
            </Link>

            <Link to="/clinical-handovers" className="healthcare-action-card">
              <FileText size={25} />
              <h3>View Clinical Handovers</h3>
              <p>Manage, edit, and review saved handovers.</p>
              <ArrowRight size={18} />
            </Link>

            <Link to="/handover-summary" className="healthcare-action-card">
              <FileText size={25} />
              <h3>View Summaries</h3>
              <p>Review existing handover summaries.</p>
              <ArrowRight size={18} />
            </Link>

            {/* NEW: AI Handover Assistant */}
            <Link
              to="/ai-handover-assistant"
              className="healthcare-action-card"
            >
              <Brain size={25} />
              <h3>AI Handover Assistant</h3>
              <p>
                Generate structured handover drafts using AI-powered
                clinical note analysis.
              </p>
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="healthcare-activity">
          <div className="healthcare-activity-heading">
            <h2>Recent Activities</h2>
            <span>Sample data</span>
          </div>

          <div className="healthcare-activity-list">
            {activities.map((item, index) => (
              <article className="healthcare-activity-item" key={index}>
                <div className="healthcare-activity-icon">
                  <Clock size={20} />
                </div>

                <div className="healthcare-activity-info">
                  <h3>{item.patient}</h3>
                  <p>{item.task}</p>
                </div>

                <div className="healthcare-activity-meta">
                  <span
                    className={
                      item.status === "Pending" ? "pending" : "completed"
                    }
                  >
                    {item.status}
                  </span>
                  <small>{item.time}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="healthcare-disclaimer">
          Dashboard information is fictional sample data for development.
          Real patient information will require authentication and authorization.
        </p>
      </main>
    </div>
  );
}

export default HealthcareDashboard;
