import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ResidentRoute } from "./components/ResidentRoute";
import { GuardianRoute } from "./components/GuardianRoute";
import { VolunteerRoute } from "./components/VolunteerRoute";
import { SecurityRoute } from "./components/SecurityRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import SOSMonitor from "./pages/SOSMonitor";
import Societies from "./pages/Societies";
import Blocks from "./pages/Blocks";
import Flats from "./pages/Flats";
import Residents from "./pages/Residents";
import EmergencyContacts from "./pages/EmergencyContacts";
import Notifications from "./pages/Notifications";
import Escalation from "./pages/Escalation";

import ResidentDashboard from "./pages/ResidentDashboard";
import ResidentProfile from "./pages/ResidentProfile";
import ResidentSOS from "./pages/ResidentSOS";
import ResidentContacts from "./pages/ResidentContacts";
import ResidentNotifications from "./pages/ResidentNotifications";

import GuardianDashboard from "./pages/GuardianDashboard";
import GuardianProfile from "./pages/GuardianProfile";
import GuardianNotifications from "./pages/GuardianNotifications";

import VolunteerDashboard from "./pages/VolunteerDashboard";
import VolunteerProfile from "./pages/VolunteerProfile";
import VolunteerNotifications from "./pages/VolunteerNotifications";

import SecurityDashboard from "./pages/SecurityDashboard";
import SecurityProfile from "./pages/SecurityProfile";
import SecurityNotifications from "./pages/SecurityNotifications";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/societies"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Societies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/blocks"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Blocks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/flats"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Flats />
          </ProtectedRoute>
        }
      />

      <Route
        path="/residents"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Residents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/emergency-contacts"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EmergencyContacts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/escalation"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Escalation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sos-monitor"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SOSMonitor />
          </ProtectedRoute>
        }
      />

      {/* Resident Protected Routes */}
      <Route
        path="/resident"
        element={
          <ResidentRoute>
            <ResidentDashboard />
          </ResidentRoute>
        }
      />

      <Route
        path="/resident/profile"
        element={
          <ResidentRoute>
            <ResidentProfile />
          </ResidentRoute>
        }
      />

      <Route
        path="/resident/sos"
        element={
          <ResidentRoute>
            <ResidentSOS />
          </ResidentRoute>
        }
      />

      <Route
        path="/resident/sos/history"
        element={
          <ResidentRoute>
            <ResidentSOS />
          </ResidentRoute>
        }
      />

      <Route
        path="/resident/contacts"
        element={
          <ResidentRoute>
            <ResidentContacts />
          </ResidentRoute>
        }
      />

      <Route
        path="/resident/notifications"
        element={
          <ResidentRoute>
            <ResidentNotifications />
          </ResidentRoute>
        }
      />

      {/* Guardian Protected Routes */}
      <Route
        path="/guardian"
        element={
          <GuardianRoute>
            <GuardianDashboard />
          </GuardianRoute>
        }
      />

      <Route
        path="/guardian/sos"
        element={
          <GuardianRoute>
            <GuardianDashboard />
          </GuardianRoute>
        }
      />

      <Route
        path="/guardian/notifications"
        element={
          <GuardianRoute>
            <GuardianNotifications />
          </GuardianRoute>
        }
      />

      <Route
        path="/guardian/profile"
        element={
          <GuardianRoute>
            <GuardianProfile />
          </GuardianRoute>
        }
      />

      {/* Volunteer Protected Routes */}
      <Route
        path="/volunteer"
        element={
          <VolunteerRoute>
            <VolunteerDashboard />
          </VolunteerRoute>
        }
      />

      <Route
        path="/volunteer/incidents"
        element={
          <VolunteerRoute>
            <VolunteerDashboard />
          </VolunteerRoute>
        }
      />

      <Route
        path="/volunteer/notifications"
        element={
          <VolunteerRoute>
            <VolunteerNotifications />
          </VolunteerRoute>
        }
      />

      <Route
        path="/volunteer/profile"
        element={
          <VolunteerRoute>
            <VolunteerProfile />
          </VolunteerRoute>
        }
      />

      {/* Security Protected Routes */}
      <Route
        path="/security"
        element={
          <SecurityRoute>
            <SecurityDashboard />
          </SecurityRoute>
        }
      />

      <Route
        path="/security/sos"
        element={
          <SecurityRoute>
            <SecurityDashboard />
          </SecurityRoute>
        }
      />

      <Route
        path="/security/notifications"
        element={
          <SecurityRoute>
            <SecurityNotifications />
          </SecurityRoute>
        }
      />

      <Route
        path="/security/profile"
        element={
          <SecurityRoute>
            <SecurityProfile />
          </SecurityRoute>
        }
      />
    </Routes>
  );
}
