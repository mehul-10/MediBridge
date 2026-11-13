import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import PatientDashboard from "./pages/PatientDashboard";
import MedicalRecords from "./pages/MedicalRecords";
import Medications from "./pages/Medications";
import MedicalHistory from "./pages/MedicalHistory";
import HealthTimeline from "./pages/HealthTimeline";
import SecureSharing from "./pages/SecureSharing";
import HealthProfile from "./pages/HealthProfile";
import SharingManagement from "./pages/SharingManagement";

import HealthcareDashboard from "./pages/HealthcareDashboard";
import PatientSearch from "./pages/PatientSearch";
import PatientRecord from "./pages/PatientRecord";
import ClinicalHandover from "./pages/ClinicalHandover";
import ClinicalHandovers from "./pages/ClinicalHandovers";
import HandoverSummary from "./pages/HandoverSummary";
import AIHandoverAssistant from "./pages/AIHandoverAssistant";
import ClinicalDocuments from "./pages/ClinicalDocuments";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route
            path="/patient-dashboard"
            element={<PatientDashboard />}
          />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/medical-history" element={<MedicalHistory />} />
          <Route path="/health-timeline" element={<HealthTimeline />} />
          <Route path="/secure-sharing" element={<SecureSharing />} />
          <Route path="/sharing-management" element={<SharingManagement />} />
          <Route path="/health-profile" element={<HealthProfile />} />
          <Route path="/clinical-documents" element={<ClinicalDocuments />} />
        </Route>

        {/* Healthcare-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["healthcare"]} />}>
          <Route
            path="/healthcare-dashboard"
            element={<HealthcareDashboard />}
          />
          <Route path="/patient-search" element={<PatientSearch />} />
          <Route
            path="/patient-record/:patientId"
            element={<PatientRecord />}
          />
          <Route
            path="/clinical-handover"
            element={<ClinicalHandover />}
          />
          <Route
            path="/clinical-handovers"
            element={<ClinicalHandovers />}
          />
          <Route path="/handover-summary" element={<HandoverSummary />} />
          <Route
            path="/ai-handover-assistant"
            element={<AIHandoverAssistant />}
          />
          <Route path="/clinical-documents" element={<ClinicalDocuments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;