
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const patientRoutes = require("./routes/patientRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const sharingRoutes = require("./routes/sharingRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const medicalHistoryRoutes = require("./routes/medicalHistoryRoutes");
const clinicalDocumentRoutes = require("./routes/clinicalDocumentRoutes");
const clinicalHandoverRoutes = require("./routes/clinicalHandoverRoutes");
const aiHandoverRoutes = require("./routes/aiHandoverRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/patients", patientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/sharing", sharingRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/medical-history", medicalHistoryRoutes);
app.use("/api/clinical-documents", clinicalDocumentRoutes);
app.use("/api/clinical-handovers", clinicalHandoverRoutes);
app.use("/api/ai-handover", aiHandoverRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// Welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MediBridge API",
  });
});

// MongoDB connection and server startup
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`MediBridge server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
