import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import AttendanceButton from "../../components/AttendanceButton";
import PermisoModal from "./components/PermisoModal";
import TareasModal from "./components/TareasModal";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [notif, setNotif] = useState([]);
  const [showPermisoModal, setShowPermisoModal] = useState(false);
  const [showTareasModal, setShowTareasModal] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/api/employee/dashboard"),
      api.get("/api/notificaciones/mias"),
    ])
      .then(([d, n]) => {
        setData(d.data);
        setNotif(n.data.notificaciones || []);
      })
      .catch((err) => {
        // Error loading dashboard
        showToast("✗ Error al cargar el dashboard", "error");
      });
  }, []);

  const handlePermissionSubmitted = () => {
    // Refresh data after permission submitted
    setRefresh((r) => r + 1);
  };

  return (
    <div className="crm-layout">
      <Sidebar />
      <main className="crm-main">
        <header className="crm-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Bienvenido, {user?.userName}</h1>
            <p className="topbar-sub">
              Resumen de tu actividad y portal de colaborador
            </p>
          </div>
          <div className="topbar-actions">
            <span className="badge badge-blue">
              {user?.roleName || user?.userRole}
            </span>
          </div>
        </header>

        <div className="crm-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Vistas de Perfil</div>
              <div className="stat-value">{data?.stats?.vistas || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Asistencia Puntual</div>
              <div
                className="stat-value text-success"
                style={{ color: "var(--accent-2)" }}
              >
                {data?.stats?.asistencia || "100%"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "24px",
            }}
          >
            <section className="section-card">
              <div className="section-header">
                <h2 className="section-title">Mis Notificaciones</h2>
              </div>
              <div className="section-body">
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {notif.map((n) => (
                    <li
                      key={n.id}
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid var(--border)",
                        opacity: n.leida ? 0.6 : 1,
                        background: n.leida
                          ? "transparent"
                          : "rgba(59, 130, 246, 0.05)",
                        borderRadius: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        {n.titulo}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--text-2)",
                          marginBottom: "4px",
                        }}
                      >
                        {n.mensaje}
                      </div>
                      <small
                        style={{ color: "var(--text-3)", fontSize: "11px" }}
                      >
                        {new Date(n.created_at).toLocaleDateString()}
                      </small>
                    </li>
                  ))}
                  {notif.length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "var(--text-3)",
                      }}
                    >
                      No hay notificaciones pendientes.
                    </p>
                  )}
                </ul>
              </div>
            </section>

            <section className="section-card">
              <div className="section-header">
                <h2 className="section-title">Mi Asistencia Hoy</h2>
              </div>
              <div className="section-body">
                <AttendanceButton />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    className="btn btn-ghost"
                    style={{ justifyContent: "flex-start" }}
                    onClick={() => setShowPermisoModal(true)}
                  >
                    📝 Solicitar Permiso
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ justifyContent: "flex-start" }}
                    onClick={() => setShowTareasModal(true)}
                  >
                    ✅ Ver Mis Tareas
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showPermisoModal && (
        <PermisoModal
          onClose={() => setShowPermisoModal(false)}
          onSuccess={handlePermissionSubmitted}
        />
      )}

      {showTareasModal && (
        <TareasModal
          onClose={() => setShowTareasModal(false)}
          refreshTrigger={refresh}
        />
      )}
    </div>
  );
}
