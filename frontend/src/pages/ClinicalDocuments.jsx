
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Search,
  Download,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  FileImage,
  CalendarDays,
  FolderOpen,
  Camera,
  Check,
} from "lucide-react";

import {
  uploadClinicalDocument,
  getMyClinicalDocuments,
  downloadClinicalDocument,
  updateClinicalDocument,
  deleteClinicalDocument,
} from "../services/clinicalDocumentService";

import "./ClinicalDocuments.css";

const documentTypes = [
  "Lab Report",
  "Prescription",
  "Imaging Report",
  "Discharge Summary",
  "Other",
];

const initialForm = {
  documentTitle: "",
  documentType: "Lab Report",
  description: "",
  documentDate: "",
};

function ClinicalDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [capturedPreview, setCapturedPreview] = useState("");

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const previewUrlRef = useRef("");

  // Load documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyClinicalDocuments();
      setDocuments(response.documents || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load clinical documents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Camera preview setup
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;

      videoRef.current.play().catch(() => {
        setCameraError("Unable to start camera preview.");
      });
    }
  }, [showCamera, cameraStream]);

  // Release camera resources on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [cameraStream]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return documents.filter((document) => {
      const matchesType =
        selectedType === "All" ||
        document.documentType === selectedType;

      const searchableText = [
        document.documentTitle,
        document.documentType,
        document.description,
        document.fileName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesType && searchableText.includes(search);
    });
  }, [documents, searchTerm, selectedType]);

  // Date formatting
  const formatDate = (date) => {
    if (!date) return "Date not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // File size formatting
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Clear captured preview
  const clearCapturedPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setCapturedPreview("");
  };

  // Open add modal
  const openAddModal = () => {
    setEditingDocument(null);
    setForm(initialForm);
    setSelectedFile(null);
    setError("");
    setSuccess("");
    clearCapturedPreview();
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (document) => {
    setEditingDocument(document);

    setForm({
      documentTitle: document.documentTitle || "",
      documentType: document.documentType || "Other",
      description: document.description || "",
      documentDate: document.documentDate
        ? new Date(document.documentDate).toISOString().slice(0, 10)
        : "",
    });

    setSelectedFile(null);
    setError("");
    setSuccess("");
    clearCapturedPreview();
    setShowModal(true);
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStream(null);
    setShowCamera(false);
    setCameraError("");
  };

  // Close upload modal
  const closeModal = () => {
    if (saving) return;

    stopCamera();
    setShowModal(false);
    setEditingDocument(null);
    setForm(initialForm);
    setSelectedFile(null);
    setError("");
    clearCapturedPreview();
  };

  // Form changes
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Gallery / file upload validation
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a PDF, JPEG, PNG or WebP file.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    clearCapturedPreview();
    setError("");
    setSelectedFile(file);
  };

  // Start laptop / mobile camera
  const startCamera = async (facingMode = cameraFacingMode) => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is unavailable. Use HTTPS or localhost."
        );
      }

      // Release previous camera before switching
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setCameraStream(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setCameraFacingMode(facingMode);
      setShowCamera(true);
    } catch (err) {
      let message = "Unable to access your camera.";

      if (err.name === "NotAllowedError") {
        message =
          "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (
        err.name === "NotFoundError" ||
        err.name === "OverconstrainedError"
      ) {
        message = "The selected camera is unavailable on this device.";
      } else if (err.name === "NotReadableError") {
        message =
          "Camera is currently being used by another application.";
      } else if (err.message) {
        message = err.message;
      }

      setCameraError(message);
    }
  };

  // Switch between front and back cameras
  const switchCamera = async () => {
    const nextFacingMode =
      cameraFacingMode === "environment" ? "user" : "environment";

    await startCamera(nextFacingMode);
  };

  // Capture photograph
  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth) {
      setCameraError("Camera is not ready yet.");
      return;
    }

    const canvas = window.document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Unable to process the photograph.");
      return;
    }

    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Unable to capture photograph.");
          return;
        }

        if (blob.size > 5 * 1024 * 1024) {
          setCameraError(
            "Captured photograph exceeds the 5 MB upload limit."
          );
          return;
        }

        const file = new File(
          [blob],
          `clinical-photo-${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        clearCapturedPreview();

        const previewUrl = URL.createObjectURL(file);

        previewUrlRef.current = previewUrl;

        setSelectedFile(file);
        setCapturedPreview(previewUrl);

        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // Retake photograph
  const retakePhoto = async () => {
    clearCapturedPreview();
    setSelectedFile(null);
    await startCamera();
  };

  // Submit document
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.documentTitle.trim()) {
      setError("Please enter a document title.");
      return;
    }

    if (!editingDocument && !selectedFile) {
      setError("Please select or capture a document file.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingDocument) {
        await updateClinicalDocument(editingDocument._id, form);

        setSuccess("Document details updated successfully.");
      } else {
        const formData = new FormData();

        formData.append("document", selectedFile);
        formData.append("documentTitle", form.documentTitle.trim());
        formData.append("documentType", form.documentType);
        formData.append("description", form.description);
        formData.append("documentDate", form.documentDate);

        await uploadClinicalDocument(formData);

        setSuccess("Clinical document uploaded successfully.");
      }

      stopCamera();
      setShowModal(false);
      setEditingDocument(null);
      setForm(initialForm);
      setSelectedFile(null);

      clearCapturedPreview();

      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save clinical document."
      );
    } finally {
      setSaving(false);
    }
  };

  // Download document
  const handleDownload = async (document) => {
    try {
      setDownloadingId(document._id);
      setError("");

      const blob = await downloadClinicalDocument(document._id);

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = downloadUrl;
      link.download = document.fileName || "clinical-document";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to download the document."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // Delete document
  const handleDelete = async (document) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${document.documentTitle}"? This will permanently delete its stored file.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteClinicalDocument(document._id);

      setDocuments((previous) =>
        previous.filter((item) => item._id !== document._id)
      );

      setSuccess("Clinical document deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the document."
      );
    }
  };

  return (
    <div className="clinical-documents-page">

      {/* HEADER */}
      <div className="clinical-documents-header">
        <div>
          <span className="clinical-documents-eyebrow">
            YOUR HEALTH FILES
          </span>

          <h1>Clinical Documents</h1>

          <p>
            Securely store and manage your medical reports,
            prescriptions and healthcare documents.
          </p>
        </div>

        <button
          type="button"
          className="clinical-documents-upload-button"
          onClick={openAddModal}
        >
          <Upload size={18} />
          Upload Document
        </button>
      </div>

      {/* STATISTICS */}
      <div className="clinical-documents-stats">

        <div className="clinical-documents-stat-card">
          <div className="clinical-documents-stat-icon total">
            <FolderOpen size={22} />
          </div>

          <div>
            <span>Total Documents</span>
            <strong>{documents.length}</strong>
          </div>
        </div>

        <div className="clinical-documents-stat-card">
          <div className="clinical-documents-stat-icon reports">
            <FileText size={22} />
          </div>

          <div>
            <span>Lab Reports</span>
            <strong>
              {documents.filter(
                (item) => item.documentType === "Lab Report"
              ).length}
            </strong>
          </div>
        </div>

        <div className="clinical-documents-stat-card">
          <div className="clinical-documents-stat-icon prescriptions">
            <FileText size={22} />
          </div>

          <div>
            <span>Prescriptions</span>
            <strong>
              {documents.filter(
                (item) => item.documentType === "Prescription"
              ).length}
            </strong>
          </div>
        </div>

        <div className="clinical-documents-stat-card">
          <div className="clinical-documents-stat-icon imaging">
            <FileImage size={22} />
          </div>

          <div>
            <span>Imaging Reports</span>
            <strong>
              {documents.filter(
                (item) => item.documentType === "Imaging Report"
              ).length}
            </strong>
          </div>
        </div>

      </div>

      {/* SEARCH AND FILTER */}
      <div className="clinical-documents-toolbar">

        <div className="clinical-documents-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <select
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          aria-label="Filter by document type"
        >
          <option value="All">All Categories</option>

          {documentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="clinical-documents-refresh"
          onClick={loadDocuments}
          disabled={loading}
          aria-label="Refresh documents"
        >
          <RefreshCw size={18} />
        </button>

      </div>

      {/* ALERTS */}
      {error && !showModal && (
        <div className="clinical-documents-alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="clinical-documents-alert success">
          {success}
        </div>
      )}

      {/* DOCUMENT LIST */}
      {loading ? (
        <div className="clinical-documents-empty">
          <RefreshCw size={25} />
          <p>Loading your documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="clinical-documents-empty">

          <div className="clinical-documents-empty-icon">
            <FolderOpen size={32} />
          </div>

          <h3>
            {documents.length === 0
              ? "No clinical documents yet"
              : "No matching documents found"}
          </h3>

          <p>
            {documents.length === 0
              ? "Upload your first medical document to keep your health files organized."
              : "Try another search term or category."}
          </p>

          {documents.length === 0 && (
            <button type="button" onClick={openAddModal}>
              <Upload size={17} />
              Upload Your First Document
            </button>
          )}

        </div>
      ) : (
        <div className="clinical-documents-grid">

          {filteredDocuments.map((document) => (
            <article
              className="clinical-document-card"
              key={document._id}
            >

              <div className="clinical-document-card-top">

                <div className="clinical-document-file-icon">
                  {document.mimeType === "application/pdf" ? (
                    <FileText size={25} />
                  ) : (
                    <FileImage size={25} />
                  )}
                </div>

                <span className="clinical-document-type">
                  {document.documentType}
                </span>

              </div>

              <h3>{document.documentTitle}</h3>

              <p className="clinical-document-description">
                {document.description || "No description provided."}
              </p>

              <div className="clinical-document-meta">

                <span>
                  <CalendarDays size={14} />
                  {formatDate(document.documentDate)}
                </span>

                <span>
                  {formatFileSize(document.fileSize)}
                </span>

              </div>

              <p className="clinical-document-filename">
                {document.fileName}
              </p>

              <div className="clinical-document-actions">

                <button
                  type="button"
                  className="download"
                  onClick={() => handleDownload(document)}
                  disabled={downloadingId === document._id}
                >
                  <Download size={16} />

                  {downloadingId === document._id
                    ? "Downloading..."
                    : "Download"}
                </button>

                <button
                  type="button"
                  className="edit"
                  onClick={() => openEditModal(document)}
                  aria-label={`Edit ${document.documentTitle}`}
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  className="delete"
                  onClick={() => handleDelete(document)}
                  aria-label={`Delete ${document.documentTitle}`}
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </article>
          ))}

        </div>
      )}

      {/* UPLOAD / EDIT MODAL */}
      {showModal && (
        <div className="clinical-documents-modal-overlay">

          <div className="clinical-documents-modal">

            <div className="clinical-documents-modal-header">

              <div>
                <span className="clinical-documents-eyebrow">
                  DOCUMENT MANAGEMENT
                </span>

                <h2>
                  {editingDocument
                    ? "Edit Document Details"
                    : "Upload Clinical Document"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                disabled={saving}
              >
                <X size={21} />
              </button>

            </div>

            {error && (
              <div className="clinical-documents-alert error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* FILE SELECTION */}
              {!editingDocument && (
                <div className="clinical-documents-form-group">

                  <label>Select Document *</label>

                  <div className="clinical-document-upload-options">

                    {/* GALLERY / FILES */}
                    <label className="clinical-upload-option">
                      <Upload size={20} />
                      <span>Gallery / Files</span>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileChange}
                      />
                    </label>

                    {/* CAMERA */}
                    <button
                      type="button"
                      className="clinical-upload-option"
                      onClick={() => startCamera("environment")}
                    >
                      <Camera size={20} />
                      <span>Take Photo</span>
                    </button>

                  </div>

                  <small>
                    PDF, JPEG, PNG or WebP. Maximum 5 MB.
                  </small>

                  {selectedFile && (
                    <small className="clinical-documents-selected-file">
                      Selected: {selectedFile.name}
                    </small>
                  )}

                  {/* CAPTURED IMAGE PREVIEW */}
                  {capturedPreview && (
                    <div className="clinical-captured-preview">

                      <img
                        src={capturedPreview}
                        alt="Captured clinical document"
                      />

                      <div>
                        <span>
                          <Check size={15} />
                          Photo captured successfully
                        </span>

                        <button
                          type="button"
                          onClick={retakePhoto}
                        >
                          <Camera size={15} />
                          Retake Photo
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* DOCUMENT TITLE */}
              <div className="clinical-documents-form-group">

                <label htmlFor="documentTitle">
                  Document Title *
                </label>

                <input
                  id="documentTitle"
                  name="documentTitle"
                  type="text"
                  value={form.documentTitle}
                  onChange={handleFormChange}
                  placeholder="e.g. Blood Test Report"
                  required
                />

              </div>

              {/* DOCUMENT CATEGORY */}
              <div className="clinical-documents-form-group">

                <label htmlFor="documentType">
                  Document Category *
                </label>

                <select
                  id="documentType"
                  name="documentType"
                  value={form.documentType}
                  onChange={handleFormChange}
                  required
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

              </div>

              {/* DOCUMENT DATE */}
              <div className="clinical-documents-form-group">

                <label htmlFor="documentDate">
                  Document Date
                </label>

                <input
                  id="documentDate"
                  name="documentDate"
                  type="date"
                  value={form.documentDate}
                  onChange={handleFormChange}
                />

              </div>

              {/* DESCRIPTION */}
              <div className="clinical-documents-form-group">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Add a short description..."
                  rows="3"
                />

              </div>

              {/* ACTION BUTTONS */}
              <div className="clinical-documents-modal-actions">

                <button
                  type="button"
                  className="cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingDocument
                    ? "Save Changes"
                    : "Upload Document"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* CAMERA MODAL */}
      {showCamera && (
        <div className="clinical-documents-modal-overlay">

          <div className="clinical-documents-modal camera-modal">

            <div className="clinical-documents-modal-header">

              <div>
                <span className="clinical-documents-eyebrow">
                  CAMERA CAPTURE
                </span>

                <h2>Take Clinical Photo</h2>
              </div>

              <button
                type="button"
                onClick={stopCamera}
                aria-label="Close camera"
              >
                <X size={21} />
              </button>

            </div>

            {cameraError && (
              <div className="clinical-documents-alert error">
                {cameraError}
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="clinical-camera-preview"
            />

            <div className="clinical-documents-modal-actions">

              <button
                type="button"
                className="cancel"
                onClick={stopCamera}
              >
                Cancel
              </button>

              <button
                type="button"
                className="cancel"
                onClick={switchCamera}
                disabled={!cameraStream}
              >
                <RefreshCw size={16} />
                {cameraFacingMode === "environment"
                  ? "Switch to Front Camera"
                  : "Switch to Back Camera"}
              </button>

              <button
                type="button"
                className="save"
                onClick={capturePhoto}
                disabled={!cameraStream}
              >
                <Camera size={17} />
                Capture Photo
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ClinicalDocuments;
