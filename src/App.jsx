import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Patients from "./pages/Patients";
import HighRisk from "./pages/highrisk";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import AddPatient from "./pages/AddPatient";
import Pharmacy from "./pages/Pharmacy";
import Beds from "./pages/Beds";
import SymptomChecker from "./pages/SymptomChecker";
import Ambulance from "./pages/Ambulance";
import CommandCenter from "./pages/CommandCenter";
import ICUMonitor from "./pages/ICUMonitor";
import NotificationCenter from "./pages/NotificationCenter";
import DiseaseStats from "./pages/DiseaseStats";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PharmacyLayout from "./layouts/PharmacyLayout";

// Staff pages
import StaffLayout from "./layouts/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";

// Doctor pages
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorCommandCenter";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import PrescriptionManager from "./pages/doctor/PrescriptionManager";
import DoctorPerformance from "./pages/doctor/DoctorPerformance";
import EmergencyResponseMode from "./pages/doctor/EmergencyResponseMode";

// Patient pages
import PatientLayout from "./layouts/PatientLayout";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientHealthMonitor from "./pages/patient/PatientHealthMonitor";
import PatientReports from "./pages/patient/PatientReports";
import HealthCard from "./pages/patient/HealthCard";
import DoctorRecommendation from "./pages/patient/DoctorRecommendation";
import MedicalHistory from "./pages/patient/MedicalHistory";
import RecoveryTracker from "./pages/patient/RecoveryTracker";
import BillingPage from "./pages/patient/BillingPage";
import DoctorDirectory from "./pages/patient/DoctorDirectory";
import FamilyProfiles from "./pages/patient/FamilyProfiles";
import HospitalsMap from "./pages/patient/HospitalsMap";
import SOSEmergency from "./components/SOSEmergency";
import ReportView from "./pages/patient/ReportView";

// Role-based protected route
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their proper dashboard
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "STAFF") return <Navigate to="/staff" replace />;
    if (user.role === "DOCTOR") return <Navigate to="/doctor" replace />;
    if (user.role === "PATIENT") return <Navigate to="/patient" replace />;
    if (user.role === "PHARMACY") return <Navigate to="/pharmacy" replace />;
  }
  return children;
};

// Root redirect based on role
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "STAFF") return <Navigate to="/staff" replace />;
  if (user.role === "DOCTOR") return <Navigate to="/doctor" replace />;
  if (user.role === "PATIENT") return <Navigate to="/patient" replace />;
  if (user.role === "PHARMACY") return <Navigate to="/pharmacy" replace />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <RoleRoute allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </RoleRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="add-patient" element={<AddPatient />} />
          <Route path="highrisk" element={<HighRisk />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="pharmacy" element={<Pharmacy />} />
          <Route path="beds" element={<Beds />} />
          <Route path="symptom-checker" element={<SymptomChecker />} />
          <Route path="ambulance" element={<Ambulance />} />
          <Route path="command-center" element={<CommandCenter />} />
          <Route path="icu-monitor" element={<ICUMonitor />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="disease-stats" element={<DiseaseStats />} />
          <Route path="pharmacy-verification" element={<PharmacyDashboard />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={
          <RoleRoute allowedRoles={["STAFF", "ADMIN"]}>
            <StaffLayout />
          </RoleRoute>
        }>
          <Route index element={<StaffDashboard />} />
          <Route path="beds" element={<Beds />} />
          <Route path="patients" element={<Patients />} />
          <Route path="pharmacy" element={<Pharmacy />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="icu-monitor" element={<ICUMonitor />} />
          <Route path="ambulance" element={<Ambulance />} />
          <Route path="notifications" element={<NotificationCenter />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <RoleRoute allowedRoles={["DOCTOR", "ADMIN"]}>
            <DoctorLayout />
          </RoleRoute>
        }>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="consultation" element={<DoctorDashboard activeTab="consultation" />} />
          <Route path="prescriptions" element={<PrescriptionManager />} />
          <Route path="billing" element={<DoctorDashboard activeTab="billing" />} />
          <Route path="performance" element={<DoctorPerformance />} />
          <Route path="emergency-response" element={<EmergencyResponseMode />} />
        </Route>

        {/* Pharmacy Routes */}
        <Route path="/pharmacy" element={
          <RoleRoute allowedRoles={["PHARMACY", "ADMIN"]}>
            <PharmacyLayout />
          </RoleRoute>
        }>
          <Route index element={<PharmacyDashboard />} />
          <Route path="inventory" element={<PharmacyDashboard />} />
          <Route path="prescriptions" element={<PharmacyDashboard />} />
          <Route path="billing" element={<PharmacyDashboard />} />
          <Route path="notifications" element={<NotificationCenter />} />
        </Route>

        {/* Patient Routes */}
        <Route path="/patient" element={
          <RoleRoute allowedRoles={["PATIENT", "ADMIN"]}>
            <PatientLayout />
          </RoleRoute>
        }>
          <Route index element={<PatientDashboard />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="directory" element={<DoctorDirectory />} />
          <Route path="health" element={<PatientHealthMonitor />} />
          <Route path="reports" element={<PatientReports />} />
          <Route path="health-card" element={<HealthCard />} />
          <Route path="recommendations" element={<DoctorRecommendation />} />
          <Route path="history" element={<MedicalHistory />} />
          <Route path="recovery" element={<RecoveryTracker />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="family" element={<FamilyProfiles />} />
          <Route path="map" element={<HospitalsMap />} />
          <Route path="symptom-checker" element={<SymptomChecker />} />
          <Route path="emergency" element={<SOSEmergency />} />
          <Route path="report/:reportId" element={<ReportView />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}