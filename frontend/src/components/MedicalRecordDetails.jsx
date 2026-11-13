import {
  X,
  FileText,
  Calendar,
  UserRound,
  Building2,
  Activity,
  ClipboardList,
  Pencil,
  Trash2,
} from "lucide-react";
import "./MedicalRecordDetails.css";

function MedicalRecordDetails({ record, onClose, onEdit, onDelete }) {
  if (!record) return null;

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${record.title}"? This action cannot be undone.`
    );

    if (confirmed && onDelete) {
      onDelete(record);
    }
  };

  return (
    <div className="record-modal-overlay" onClick={onClose}>
      <div
        className="record-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="record-modal-header">
          <div className="record-modal-heading">
            <div className="record-modal-icon">
              <FileText size={23} />
            </div>
            <div>
              <h2>Medical Record Details</h2>
              <p>View your saved health record</p>
            </div>
          </div>

          <button
            type="button"
            className="record-modal-close"
            onClick={onClose}
            aria-label="Close record details"
          >
            <X size={21} />
          </button>
        </div>

        <div className="record-modal-body">
          <div className="record-modal-title">
            <h3>{record.title}</h3>
            <span>{record.recordType}</span>
          </div>

          <div className="record-detail-grid">
            <div className="record-detail-item">
              <Building2 size={19} />
              <div>
                <label>Hospital / Clinic</label>
                <p>{record.hospitalName || "Not provided"}</p>
              </div>
            </div>

            <div className="record-detail-item">
              <UserRound size={19} />
              <div>
                <label>Doctor</label>
                <p>{record.doctorName || "Not provided"}</p>
              </div>
            </div>

            <div className="record-detail-item">
              <Calendar size={19} />
              <div>
                <label>Record Date</label>
                <p>{formatDate(record.recordDate)}</p>
              </div>
            </div>
          </div>

          <div className="record-detail-section">
            <h4>
              <FileText size={18} />
              Description
            </h4>
            <p>{record.description || "No description provided."}</p>
          </div>

          <div className="record-detail-section">
            <h4>
              <Activity size={18} />
              Diagnosis
            </h4>
            <p>{record.diagnosis || "No diagnosis recorded."}</p>
          </div>

          <div className="record-detail-section">
            <h4>
              <ClipboardList size={18} />
              Treatment
            </h4>
            <p>{record.treatment || "No treatment recorded."}</p>
          </div>

          <div className="record-detail-section">
            <h4>Additional Notes</h4>
            <p>{record.notes || "No additional notes."}</p>
          </div>
        </div>

        <div className="record-modal-footer">
          <button type="button" onClick={onClose}>
            Close
          </button>

          <button
            type="button"
            onClick={() => onEdit && onEdit(record)}
            disabled={!onEdit}
          >
            <Pencil size={16} />
            Edit Record
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!onDelete}
            style={{
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
            }}
          >
            <Trash2 size={16} />
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}

export default MedicalRecordDetails;