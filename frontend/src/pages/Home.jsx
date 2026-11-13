import "./Home.css";
import { Link } from "react-router-dom";
import {
  Activity,
  ShieldCheck,
  FileHeart,
  ArrowRight,
  Stethoscope,
  ClipboardList,
} from "lucide-react";

function Home() {
  return (
    <div className="home-page">
      <nav className="navbar">
        <h2 className="logo">
          <Activity size={25} />
          MediBridge
        </h2>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/login" className="login-link">Login</Link>
          <Link to="/register" className="nav-button">
            Get Started
          </Link>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="tagline">
              YOUR HEALTH. CONNECTED.
            </span>

            <h1>
              Your Health Records,
              <span> All in One Place.</span>
            </h1>

            <p>
              MediBridge connects your medical history and
              healthcare professionals through secure health
              records and intelligent clinical handovers.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                Get Started <ArrowRight size={18} />
              </Link>

              <a href="#features" className="secondary-button">
                Explore Features
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="card-icon">
              <FileHeart size={32} />
            </div>
            <h3>Your Health Dashboard</h3>
            <p>Everything important about your health, organized.</p>

            <div className="health-item">
              <ShieldCheck />
              <span>Secure Health Records</span>
            </div>

            <div className="health-item">
              <Stethoscope />
              <span>Connected Healthcare</span>
            </div>

            <div className="health-item">
              <ClipboardList />
              <span>Clinical Handovers</span>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <h2>Everything Your Healthcare Needs</h2>
          <p className="section-description">
            One platform for better healthcare coordination.
          </p>

          <div className="feature-grid">
            <article className="feature-card">
              <FileHeart />
              <h3>Universal Health Records</h3>
              <p>
                Keep prescriptions, reports, allergies and
                medical history together in one place.
              </p>
            </article>

            <article className="feature-card">
              <ClipboardList />
              <h3>Clinical Handover</h3>
              <p>
                Make patient-care transitions clearer with
                structured clinical handovers.
              </p>
            </article>

            <article className="feature-card">
              <ShieldCheck />
              <h3>Secure Sharing</h3>
              <p>
                Share your health information with authorized
                healthcare professionals.
              </p>
            </article>
          </div>
        </section>

        <section className="about" id="about">
          <h2>Bridging the Gap in Healthcare</h2>
          <p>
            MediBridge aims to improve continuity of care by
            bringing patient health information and clinical
            communication together.
          </p>
        </section>
      </main>

      <footer>
        <h3>MediBridge</h3>
        <p>Connecting records. Improving continuity of care.</p>
        <p>© 2026 MediBridge. Academic Project.</p>
        <p>Made By: <b>Surbani Kaur</b> and <b>Mehul Gupta</b></p>
      </footer>
    </div>
  );
}

export default Home;
