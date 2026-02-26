import { useAnalyticsTracking } from "../hooks/useAnalyticsTracking";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import LoginPage from "./LoginPage";
import ChangePasswordPage from "./ChangePasswordPage";
import ForgotPasswordPage from "./ForgotPasswordPage";

import AdminDashboardPage from "./admin/DashboardPage";
import EmployeesPage from "./admin/EmployeesPage";
import AuditPage from "./admin/AuditPage";
import PermissionsPage from "./admin/PermissionsPage";
import AnalyticsPage from "./admin/AnalyticsPage";
import FinanzasPage from "./admin/FinanzasPage";
import VentasPage from "./admin/VentasPage";
import ProyectosPage from "./admin/ProyectosPage";
import NotificacionesPage from "./admin/NotificacionesPage";
import CalendarioPage from "./admin/CalendarioPage";
import AsistenciaPage from "./admin/AsistenciaPage";
import UsersPage from "./admin/UsersPage";
import FacialConfigPage from "./admin/FacialConfigPage";
import DocumentacionPage from "./admin/DocumentacionPage";
import ConfiguracionPage from "./admin/ConfiguracionPage";

import EmployeeDashboardPage from "./employee/DashboardPage";

const ADMIN_ROLES = ["super_admin", "admin_rrhh", "admin"];

export default function AppRoutes() {
  // Track every route change for analytics
  useAnalyticsTracking();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Auth-required — any role */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <EmployeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <AuditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/permissions"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <PermissionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finanzas"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <FinanzasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ventas"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <VentasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/proyectos"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <ProyectosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notificaciones"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <NotificacionesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/calendario"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <CalendarioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/asistencia"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <AsistenciaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/facial-config"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <FacialConfigPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/documentacion"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <DocumentacionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <ConfiguracionPage />
          </ProtectedRoute>
        }
      />

      {/* Employee-only routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute>
            <EmployeeDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="/" element={<Navigate to="/admin/dashboard" />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" />} />
    </Routes>
  );
}
