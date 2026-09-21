import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import People from "./pages/People";
import "./styles/global.css";

// Admin CMS Imports
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import PeopleManagement from "./pages/admin/PeopleManagement";
import RoleManagement from "./pages/admin/RoleManagement";
import EventsManagement from "./pages/admin/EventsManagement";

// Render public navbar only for public customer-facing routes
function AppNavbar() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) {
    return null;
  }
  return <Navbar />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppNavbar />
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/sessions" element={<Navigate to="/events" replace />} />
          <Route path="/sessions/:sessionId" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<Navigate to="/events" replace />} />
          <Route path="/events/:eventId/sessions/:sessionId" element={<Navigate to="/events" replace />} />
          <Route path="/people" element={<People />} />

          {/* Admin CMS Authentication */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin CMS Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="people" element={<PeopleManagement />} />
              <Route path="roles" element={<RoleManagement />} />
              <Route path="events" element={<EventsManagement />} />
              <Route path="sessions" element={<Navigate to="/admin/events" replace />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

