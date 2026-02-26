import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = ["super_admin", "admin_rrhh", "admin"].includes(
    user?.roleName || user?.userRole,
  );
  const isSuperAdmin = (user?.roleName || user?.userRole) === "super_admin";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderIcon = (type) => {
    const icons = {
      dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
      calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
      notifications: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
      sales: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
      projects: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
      finances: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
      hr: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
      attendance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
      analytics: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
      audit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
      permissions: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
      logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    };
    return <span className="nav-icon">{icons[type] || icons.dashboard}</span>;
  };

  return (
    <aside className="crm-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-name">CRM System</div>
            <div className="sidebar-logo-sub">
              {isAdmin ? "Panel de Administración" : "Portal de Empleado"}
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav-container">
        {isAdmin && (
          <>
            <div className="sidebar-section">
              <div className="sidebar-section-label">PANEL</div>
              <nav className="sidebar-nav">
                <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('dashboard')} Inicio
                </NavLink>
                <NavLink to="/admin/calendario" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('calendar')} Calendario
                </NavLink>
                <NavLink to="/admin/notificaciones" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('notifications')} Notificaciones
                </NavLink>
              </nav>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-label">COMERCIAL (CRM)</div>
              <nav className="sidebar-nav">
                <NavLink to="/admin/ventas" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('sales')} Ventas
                </NavLink>
              </nav>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-label">OPERACIONES / PROYECTOS</div>
              <nav className="sidebar-nav">
                <NavLink to="/admin/proyectos" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('projects')} Proyectos
                </NavLink>
              </nav>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-label">FINANZAS</div>
              <nav className="sidebar-nav">
                <NavLink to="/admin/finanzas" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('finances')} Finanzas
                </NavLink>
              </nav>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-label">GESTIÓN INTERNA (RRHH & Ops)</div>
              <nav className="sidebar-nav">
                <NavLink to="/admin/employees" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('hr')} Empleados
                </NavLink>
                <NavLink to="/admin/asistencia" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('attendance')} Asistencia
                </NavLink>
              </nav>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-label">DOCUMENTACIÓN</div>
              <nav className="sidebar-nav">
                <NavLink to="/admin/documentacion" className={({ isActive }) => (isActive ? "active" : "")}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Archivos y Manuales
                </NavLink>
              </nav>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-section-label">SISTEMA Y SEGURIDAD</div>
              <nav className="sidebar-nav">
                <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('analytics')} Analítica Web
                </NavLink>
                <NavLink to="/admin/audit" className={({ isActive }) => (isActive ? "active" : "")}>
                  {renderIcon('audit')} Auditoría
                </NavLink>
                {isSuperAdmin && (
                  <NavLink to="/admin/permissions" className={({ isActive }) => (isActive ? "active" : "")}>
                    {renderIcon('permissions')} Permisos
                  </NavLink>
                )}
                <NavLink to="/admin/facial-config" className={({ isActive }) => (isActive ? "active" : "")}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 8s-1.5 2-4 2-4-2-4-2"></path><path d="M12 14v2"></path><path d="M8 14h8"></path></svg>
                  Config. Facial
                </NavLink>
                <NavLink to="/admin/configuracion" className={({ isActive }) => (isActive ? "active" : "")}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  Configuración
                </NavLink>
              </nav>
            </div>
          </>
        )}

        {!isAdmin && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">MI PORTAL</div>
            <nav className="sidebar-nav">
              <NavLink to="/employee/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                {renderIcon('dashboard')} Dashboard
              </NavLink>
            </nav>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.userName?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user?.userName || "Usuario"}
            </div>
            <div className="sidebar-user-role">
              {user?.roleName || user?.userRole || "Empleado"}
            </div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          {renderIcon('logout')}
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
