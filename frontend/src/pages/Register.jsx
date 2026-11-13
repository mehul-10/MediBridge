
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import API from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/users/register", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (!response.data.success) {
        throw new Error("Registration was unsuccessful.");
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <nav className="register-nav">
        <Link to="/" className="register-logo">
          <Activity size={28} />
          <span>MediBridge</span>
        </Link>

        <Link to="/" className="register-back">
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </nav>

      <div className="register-container">
        <div className="register-card">
          <div className="register-icon">
            <User size={30} />
          </div>

          <h1>Create Your Account</h1>

          <p className="register-subtitle">
            Join MediBridge to manage your health records securely.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="fullName">Full Name</label>

            <div className="register-input">
              <User size={19} />
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="registerEmail">Email Address</label>

            <div className="register-input">
              <Mail size={19} />
              <input
                id="registerEmail"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="phone">Phone Number</label>

            <div className="register-input">
              <Phone size={19} />
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="registerPassword">Password</label>

            <div className="register-input">
              <Lock size={19} />

              <input
                id="registerPassword"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            <label htmlFor="confirmPassword">Confirm Password</label>

            <div className="register-input">
              <Lock size={19} />

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {error && (
              <p role="alert" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            {success && (
              <p role="status" style={{ color: "#15803d" }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <p className="login-prompt">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
