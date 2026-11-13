
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  FileText,
  Search,
  Calendar,
  Eye,
  AlertCircle,
  FilePlus,
} from "lucide-react";

import {
  getMyMedicalRecords,
  deleteMedicalRecord,
} from "../services/medicalRecordService";

import MedicalRecordDetails from "../components/MedicalRecordDetails";
import AddMedicalRecord from "../components/AddMedicalRecord";
import EditMedicalRecord from "../components/EditMedicalRecord";
import "./MedicalRecords.css";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyMedicalRecords();

      if (data.success) {
        setRecords(data.medicalRecords || []);
      } else {
        setError("Unable to load your medical records.");
      }
    } catch (err) {
      console.error("Medical records error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load your medical records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return records;

    return records.filter((record) =>
      [
        record.title,
        record.hospitalName,
        record.doctorName,
        record.recordType,
        record.diagnosis,
        record.treatment,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [records, searchTerm]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleRecordAdded = (newRecord) => {
    if (newRecord?._id) {
      setRecords((previous) => [newRecord, ...previous]);
    } else {
      loadRecords();
    }

    setShowAddForm(false);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(null);
    setRecordToEdit(record);
  };

  const handleRecordUpdated = (updatedRecord) => {
    if (updatedRecord?._id) {
      setRecords((previous) =>
        previous.map((record) =>
          record._id === updatedRecord._id ? updatedRecord : record
        )
      );
    } else {
      loadRecords();
    }

    setRecordToEdit(null);
  };

  const handleDeleteRecord = async (record) => {
    try {
      setDeleting(true);
      setDeleteError("");

      const response = await deleteMedicalRecord(record._id);

      if (response.success) {
        setRecords((previous) =>
          previous.filter((item) => item._id !== record._id)
        );
        setSelectedRecord(null);
      } else {
        setDeleteError(
          response.message || "Unable to delete medical record."
        );
      }
    } catch (err) {
      console.error("Delete medical record error:", err);

      setDeleteError(
        err.response?.data?.message ||
          "Unable to delete medical record. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="records-page">
      <header className="records-header">
        <Link to="/patient-dashboard" className="records-logo">
          <Activity size={27} />
          MediBridge
        </Link>

        <Link to="/patient-dashboard" className="records-back">
          <ArrowLeft size={18} />
          Dashboard
        </Link>
      </header>

      <main className="records-main">
        <div className="records-title">
          <div>
            <h1>My Medical Records</h1>
            <p>Access your medical information in one secure place.</p>
          </div>

          <button
            type="button"
            className="upload-record-button"
            onClick={() => setShowAddForm(true)}
          >
            <FilePlus size={18} />
            Add Record
          </button>
        </div>

        <div className="records-info">
          <FileText size={27} />
          <div>
            <h3>Your Health Records</h3>
            <p>
              View your diagnoses, prescriptions, laboratory reports,
              imaging records and hospital discharge summaries.
            </p>
          </div>
        </div>

        <div className="records-toolbar">
          <div className="records-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search medical records..."
              aria-label="Search medical records"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {deleteError && (
          <div className="records-empty records-error">
            <AlertCircle size={22} />
            <p>{deleteError}</p>
            <button type="button" onClick={() => setDeleteError("")}>
              Dismiss
            </button>
          </div>
        )}

        <div className="records-section-heading">
          <h2>Recent Records</h2>
          <span>
            {loading
              ? "Loading..."
              : `${filteredRecords.length} of ${records.length} records`}
          </span>
        </div>

        {loading ? (
          <div className="records-empty">
            <p>Loading your medical records...</p>
          </div>
        ) : error ? (
          <div className="records-empty records-error">
            <AlertCircle size={25} />
            <p>{error}</p>
            <button type="button" onClick={loadRecords}>
              Try Again
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="records-empty">
            <FileText size={35} />
            <h3>
              {searchTerm
                ? "No matching records found"
                : "No medical records yet"}
            </h3>
            <p>
              {searchTerm
                ? "Try searching with a different keyword."
                : "Your medical records will appear here when they are added to your profile."}
            </p>
          </div>
        ) : (
          <div className="records-list">
            {filteredRecords.map((record) => (
              <div className="record-card" key={record._id}>
                <div className="record-icon">
                  <FileText size={24} />
                </div>

                <div className="record-details">
                  <h3>{record.title}</h3>
                  <p>{record.hospitalName || "Hospital not provided"}</p>

                  <div className="record-meta">
                    <span>{record.recordType}</span>
                    <span>
                      <Calendar size={14} />
                      {formatDate(record.recordDate)}
                    </span>
                  </div>

                  {record.doctorName && (
                    <p className="record-doctor">
                      Doctor: {record.doctorName}
                    </p>
                  )}
                </div>

                <span className="record-status">Available</span>

                <div className="record-actions">
                  <button
                    type="button"
                    title="View record details"
                    aria-label={`View ${record.title}`}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="records-note">
          Your records are retrieved from your MediBridge patient account.
          Medical document uploads and downloads will be supported separately.
        </p>
      </main>

      {selectedRecord && (
        <MedicalRecordDetails
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
        />
      )}

      {showAddForm && (
        <AddMedicalRecord
          onClose={() => setShowAddForm(false)}
          onRecordAdded={handleRecordAdded}
        />
      )}

      {recordToEdit && (
        <EditMedicalRecord
          record={recordToEdit}
          onClose={() => setRecordToEdit(null)}
          onRecordUpdated={handleRecordUpdated}
        />
      )}
    </div>
  );
}

export default MedicalRecords;
