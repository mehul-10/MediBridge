
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Search,
  UserRound,
  FileText,
  Eye,
  Users,
} from "lucide-react";
import API from "../services/api";
import "./PatientSearch.css";

function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/patients");

        setPatients(response.data.patients || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load patients. Please check your backend server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();

    return (
      patient.fullName?.toLowerCase().includes(search) ||
      patient.patientId?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="patient-search-page">
      <header className="patient-search-header">
        <Link to="/healthcare-dashboard" className="patient-search-logo">
          <Activity size={27} />
          MediBridge
        </Link>

        <Link to="/healthcare-dashboard" className="patient-search-back">
          <ArrowLeft size={18} />
          Dashboard
        </Link>
      </header>

      <main className="patient-search-main">
        <div className="patient-search-heading">
          <div>
            <h1>Patient Search</h1>
            <p>Find patient profiles using their name or patient ID.</p>
          </div>
        </div>

        <section className="patient-search-banner">
          <Users size={32} />
          <div>
            <h3>Find Patient Records</h3>
            <p>
              Search registered patients in the MediBridge database.
            </p>
          </div>
        </section>

        <section className="patient-search-box">
          <label htmlFor="patient-search-input">
            Search by Patient Name or ID
          </label>

          <div className="patient-search-input-wrapper">
            <Search size={20} />

            <input
              id="patient-search-input"
              type="text"
              placeholder="Enter patient name or ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </section>

        <section className="patient-results">
          <div className="patient-results-heading">
            <h2>Patient Directory</h2>
            <span>
              {loading ? "Loading..." : `${filteredPatients.length} patients found`}
            </span>
          </div>

          {loading ? (
            <div className="patient-no-results">
              <p>Loading patient records...</p>
            </div>
          ) : error ? (
            <div className="patient-no-results">
              <h3>Unable to load patients</h3>
              <p>{error}</p>
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="patient-table-wrapper">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Patient ID</th>
                    <th>Date of Birth</th>
                    <th>Gender</th>
                    <th>Blood Group</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id}>
                      <td>
                        <div className="patient-name-cell">
                          <div className="patient-avatar">
                            <UserRound size={19} />
                          </div>
                          <strong>{patient.fullName}</strong>
                        </div>
                      </td>

                      <td>{patient.patientId}</td>

                      <td>
                        {patient.dateOfBirth
                          ? new Date(patient.dateOfBirth).toLocaleDateString()
                          : "Not provided"}
                      </td>

                      <td>{patient.gender || "Not provided"}</td>

                      <td>{patient.bloodGroup || "Unknown"}</td>

                      <td>
                        <Link
                          to={`/patient-record/${patient.patientId}`}
                          className="patient-view-button"
                        >
                          <Eye size={15} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="patient-no-results">
              <Search size={30} />
              <h3>No patients found</h3>
              <p>Try searching with another name or patient ID.</p>
            </div>
          )}
        </section>

        <section className="patient-search-reminder">
          <FileText size={20} />
          <p>
            This prototype displays registered database records.
            Healthcare professionals must have verified accounts and
            authorization before accessing real patient information.
          </p>
        </section>
      </main>
    </div>
  );
}

export default PatientSearch;
