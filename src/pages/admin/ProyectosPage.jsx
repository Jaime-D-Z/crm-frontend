import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../api/api";
import { useToast } from "../../context/ToastContext";

export default function ProyectosPage() {
  const { showToast } = useToast();
  const [proyectos, setProyectos] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days from now
    estado: "en_progreso"
  });

  const fetchData = async () => {
    try {
      const [p, s] = await Promise.all([api.get("/api/proyectos"), api.get("/api/proyectos/stats")]);
      setProyectos(p.data.rows || []);
      setStats(s.data.stats);
    } catch (err) {
      // Error loading stats
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/proyectos", form);
      showToast("Proyecto creado con éxito", "success");
      setShowModal(false);
      setForm({
        nombre: "",
        descripcion: "",
        fecha_inicio: new Date().toISOString().slice(0, 10),
        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        estado: "en_progreso"
      });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al crear proyecto", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-main">
        <div className="crm-topbar">
          <div>
            <div className="topbar-sub">Comercial › Gestión de Proyectos</div>
            <div className="topbar-title">Proyectos & Tareas</div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Proyecto
            </button>
          </div>
        </div>

        <div className="crm-content fade-in">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Proyectos Totales</div>
              <div className="stat-value">{stats?.total ?? 0}</div>
              <div className="stat-sub">Cartera de proyectos activa</div>
              <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completados</div>
              <div className="stat-value" style={{ color: 'var(--accent-2)' }}>{stats?.completados ?? 0}</div>
              <div className="stat-sub">Hitos finalizados con éxito</div>
              <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-card">
              <div className="stat-label">En Progreso</div>
              <div className="stat-value" style={{ color: 'var(--accent-warn)' }}>{stats?.enProgreso ?? 0}</div>
              <div className="stat-sub">Tareas en desarrollo</div>
              <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warn)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>

          <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {proyectos.map((p) => (
              <div key={p.id} className="section-card" style={{ padding: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{p.nombre}</h3>
                  <span className={`badge ${p.estado === 'completado' ? 'badge-green' : p.estado === 'en_progreso' ? 'badge-blue' : 'badge-gray'}`}>
                    {p.estado === 'en_progreso' ? 'En Progreso' : p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                  </span>
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>{p.descripcion}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {new Date(p.fecha_inicio).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {p.tareas_completadas} / {p.total_tareas} tareas
                  </div>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-hover)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--accent)',
                      borderRadius: '10px',
                      width: `${(p.tareas_completadas / p.total_tareas) * 100 || 0}%`,
                      transition: 'width 0.4s ease'
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {proyectos.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '60px' }}>
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div style={{ color: 'var(--text-3)', marginTop: '16px', fontWeight: '500' }}>No hay proyectos registrados actualmente</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Nuevo Proyecto</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Nombre del Proyecto</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Rediseño de Interfaz"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Descripción</label>
                  <textarea
                    className="form-input"
                    value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Detalles del proyecto..."
                    style={{ minHeight: '100px' }}
                  ></textarea>
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label>Fecha de Inicio</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.fecha_inicio}
                      onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Fin</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.fecha_fin}
                      onChange={e => setForm({ ...form, fecha_fin: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Estado Inicial</label>
                  <select
                    className="form-input"
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}
                  >
                    <option value="en_progreso">En Progreso</option>
                    <option value="pausado">Pausado</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
