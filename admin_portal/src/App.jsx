import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import SOSMonitor from "./pages/SOSMonitor";
import Societies from "./pages/Societies";
import Residents from "./pages/Residents";
import EmergencyContacts from "./pages/EmergencyContacts";
import Notifications from "./pages/Notifications";
import Escalation from "./pages/Escalation";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/societies"
        element={
          <ProtectedRoute>
            <Societies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/residents"
        element={
          <ProtectedRoute>
            <Residents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/emergency-contacts"
        element={
          <ProtectedRoute>
            <EmergencyContacts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/escalation"
        element={
          <ProtectedRoute>
            <Escalation />
          </ProtectedRoute>
        }
      />
      <Route
  path="/sos-monitor"
  element={
    <ProtectedRoute>
      <SOSMonitor />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}