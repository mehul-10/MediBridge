import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  UserRound,
  HeartPulse,
  Phone,
  Mail,
  ShieldCheck,
  Droplets,
  Calendar,
  Pencil,
  Save,
  X,
} from "lucide-react";
import {
  getMyPatientProfile,
  updateMyPatientProfile,
} from "../services/patientService";
import "./HealthProfile.css";

function HealthProfile() {
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        if (!storedUser || !storedUser.patientId) {
          setError("Patient information not found. Please log in again.");
          return;
        }

        const data = await getMyPatientProfile(storedUser.patientId);

        if (data.success && data.patient) {
          setPatient(data.patient);
          setFormData({
            fullName: data.patient.fullName || "",
            dateOfBirth: data.patient.dateOfBirth
              ? data.patient.dateOfBirth.substring(0, 10)
              : "",
            gender: data.patient.gender || "",
            email: data.patient.email || "",
            phone: data.patient.phone || "",
            bloodGroup: data.patient.bloodGroup || "Unknown",
            allergies: data.patient.allergies || [],
            chronicConditions: data.patient.chronicConditions || [],
            emergencyContact: {
              name: data.patient.emergencyContact?.name || "",
              relationship:
                data.patient.emergencyContact?.relationship || "",
              phone: data.patient.emergencyContact?.phone || "",
            },
          });
        } else {
          setError("Unable to load your health profile.");
        }
      } catch (err) {
        console.error("Health profile error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your health profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEmergencyChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      emergencyContact: {
        ...previous.emergencyContact,
        [name]: value,
      },
    }));
  };

  const handleArrayChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  };

  const handleEdit = () => {
    setSuccess("");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSuccess("");
    setError("");

    if (patient) {
      setFormData({
        fullName: patient.fullName || "",
        dateOfBirth: patient.dateOfBirth
          ? patient.dateOfBirth.substring(0, 10)
          : "",
        gender: patient.gender || "",
        email: patient.email || "",
        phone: patient.phone || "",
        bloodGroup: patient.bloodGroup || "Unknown",
        allergies: patient.allergies || [],
        chronicConditions: patient.chronicConditions || [],
        emergencyContact: {
          name: patient.emergencyContact?.name || "",
          relationship: patient.emergencyContact?.relationship || "",
          phone: patient.emergencyContact?.phone || "",
        },
      });
    }

    setIsEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = await updateMyPatientProfile(formData);

      if (data.success && data.patient) {
        setPatient(data.patient);

        setFormData({
          fullName: data.patient.fullName || "",
          dateOfBirth: data.patient.dateOfBirth
            ? data.patient.dateOfBirth.substring(0, 10)
            : "",
          gender: data.patient.gender || "",
          email: data.patient.email || "",
          phone: data.patient.phone || "",
          bloodGroup: data.patient.bloodGroup || "Unknown",
          allergies: data.patient.allergies || [],
          chronicConditions: data.patient.chronicConditions || [],
          emergencyContact: {
            name: data.patient.emergencyContact?.name || "",
            relationship:
              data.patient.emergencyContact?.relationship || "",
            phone: data.patient.emergencyContact?.phone || "",
          },
        });

        // Keep localStorage user information synchronized.
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        if (storedUser) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              fullName: data.patient.fullName,
              email: data.patient.email,
            })
          );
        }

        setIsEditing(false);
        setSuccess("Your health profile was updated successfully.");
      } else {
        setError("Unable to update your health profile.");
      }
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update your health profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <header className="profile-header">
          <Link to="/patient-dashboard" className="profile-logo">
            <Activity size={27} />
            MediBridge
          </Link>

          <Link to="/patient-dashboard" className="profile-back">
            <ArrowLeft size={18} />
            Dashboard
          </Link>
        </header>

        <main className="profile-main">
          <div className="profile-heading">
            <h1>My Health Profile</h1>
            <p>Loading your health information...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!patient || !formData) {
    return (
      <div className="profile-page">
        <header className="profile-header">
          <Link to="/patient-dashboard" className="profile-logo">
            <Activity size={27} />
            MediBridge
          </Link>

          <Link to="/patient-dashboard" className="profile-back">
            <ArrowLeft size={18} />
            Dashboard
          </Link>
        </header>

        <main className="profile-main">
          <div className="profile-heading">
            <h1>My Health Profile</h1>
            <p>{error || "Unable to load your profile."}</p>
          </div>
        </main>
      </div>
    );
  }

  const allergiesText = formData.allergies.join(", ");
  const conditionsText = formData.chronicConditions.join(", ");

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/patient-dashboard" className="profile-logo">
          <Activity size={27} />
          MediBridge
        </Link>

        <Link to="/patient-dashboard" className="profile-back">
          <ArrowLeft size={18} />
          Dashboard
        </Link>
      </header>

      <main className="profile-main">
        <div className="profile-heading">
          <div>
            <h1>My Health Profile</h1>
            <p>
              View and manage your personal and important health
              information.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              className="profile-edit-button"
              onClick={handleEdit}
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          )}
        </div>

        {success && (
          <div className="profile-success" role="status">
            {success}
          </div>
        )}

        {error && (
          <div className="profile-error" role="alert">
            {error}
          </div>
        )}

        <section className="profile-banner">
          <div className="profile-avatar">
            <UserRound size={38} />
          </div>

          <div className="profile-banner-info">
            <h2>{patient.fullName}</h2>
            <p>Patient ID: {patient.patientId}</p>
            <span>
              <ShieldCheck size={15} />
              Patient Account
            </span>
          </div>
        </section>

        <form onSubmit={handleSave}>
          <section className="profile-section">
            <h2>
              <UserRound size={20} />
              Personal Information
            </h2>

            <div className="profile-grid">
              <div className="profile-field">
                <span>Full Name</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <strong>{patient.fullName}</strong>
                )}
              </div>

              <div className="profile-field">
                <span>Date of Birth</span>

                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "Not provided"}
                  </strong>
                )}
              </div>

              <div className="profile-field">
                <span>Gender</span>

                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>
                  </select>
                ) : (
                  <strong>{patient.gender || "Not provided"}</strong>
                )}
              </div>

              <div className="profile-field">
                <span>Patient ID</span>
                <strong>{patient.patientId}</strong>
              </div>

              <div className="profile-field">
                <span>
                  <Phone size={15} /> Phone Number
                </span>

                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{patient.phone || "Not provided"}</strong>
                )}
              </div>

              <div className="profile-field">
                <span>
                  <Mail size={15} /> Email Address
                </span>

                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <strong>{patient.email || "Not provided"}</strong>
                )}
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>
              <HeartPulse size={20} />
              Important Health Information
            </h2>

            <div className="profile-grid">
              <div className="profile-field">
                <span>
                  <Droplets size={15} /> Blood Group
                </span>

                {isEditing ? (
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <strong className="profile-blood">
                    {patient.bloodGroup || "Unknown"}
                  </strong>
                )}
              </div>

              <div className="profile-field">
                <span>Known Allergies</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="allergies"
                    value={allergiesText}
                    onChange={handleArrayChange}
                    placeholder="Separate multiple items with commas"
                  />
                ) : (
                  <strong>
                    {patient.allergies?.length
                      ? patient.allergies.join(", ")
                      : "None reported"}
                  </strong>
                )}
              </div>

              <div className="profile-field full-width">
                <span>Medical Conditions</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="chronicConditions"
                    value={conditionsText}
                    onChange={handleArrayChange}
                    placeholder="Separate multiple conditions with commas"
                  />
                ) : (
                  <strong>
                    {patient.chronicConditions?.length
                      ? patient.chronicConditions.join(", ")
                      : "None reported"}
                  </strong>
                )}
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>
              <Phone size={20} />
              Emergency Contact
            </h2>

            <div className="profile-grid">
              <div className="profile-field">
                <span>Contact Name</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.emergencyContact.name}
                    onChange={handleEmergencyChange}
                  />
                ) : (
                  <strong>
                    {patient.emergencyContact?.name || "Not provided"}
                  </strong>
                )}
              </div>

              <div className="profile-field">
                <span>Relationship</span>

                {isEditing ? (
                  <input
                    type="text"
                    name="relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleEmergencyChange}
                  />
                ) : (
                  <strong>
                    {patient.emergencyContact?.relationship ||
                      "Not provided"}
                  </strong>
                )}
              </div>

              <div className="profile-field">
                <span>Contact Number</span>

                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleEmergencyChange}
                  />
                ) : (
                  <strong>
                    {patient.emergencyContact?.phone || "Not provided"}
                  </strong>
                )}
              </div>
            </div>
          </section>

          {isEditing && (
            <div className="profile-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={saving}
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>

        {!isEditing && (
          <div className="profile-note">
            <Calendar size={19} />
            <p>
              Your profile information is retrieved from your secure
              MediBridge patient record.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default HealthProfile;