import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import API from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [id]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "healthcare") {
        navigate("/healthcare-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to login. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <nav className="login-nav">
        <Link to="/" className="login-logo">
          <Activity size={28} />
          <span>MediBridge</span>
        </Link>

        <Link to="/" className="back-home">
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </nav>

      <div className="login-container">
        <div className="login-card">
          <div className="login-icon">
            <Activity size={30} />
          </div>

          <h1>Welcome Back</h1>

          <p className="login-subtitle">
            Sign in to access your MediBridge account.
          </p>

          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "8px",
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>

            <div className="login-input">
              <Mail size={19} />

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="password">Password</label>

            <div className="login-input">
              <Lock size={19} />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
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
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="register-prompt">
            Don't have an account?{" "}
            <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;