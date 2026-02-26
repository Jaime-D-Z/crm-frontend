import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../api/api";
import { useToast } from "../../context/ToastContext";

export default function CalendarioPage() {
  const { showToast } = useToast();
  const [eventos, setEventos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: new Date().toISOString().slice(0, 16),
    fecha_fin: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    tipo: "evento",
    color: "#4f8ef7",
    todo_el_dia: false
  });

  const fetchData = async () => {
    try {
      const r = await api.get("/api/calendario/proximos");
      setEventos(r.data.eventos || []);
    } catch (err) {
      // Error loading events
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/calendario", form);
      showToast("Evento creado con éxito", "success");
      setShowModal(false);
      setForm({
        titulo: "",
        descripcion: "",
        fecha_inicio: new Date().toISOString().slice(0, 16),
        fecha_fin: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        tipo: "evento",
        color: "#4f8ef7",
        todo_el_dia: false
      });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al crear evento", "error");
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
            <div className="topbar-sub">Agenda & Eventos › Planificación Semanal</div>
            <div className="topbar-title">Calendario Corporativo</div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Evento
            </button>
          </div>
        </div>

        <div className="crm-content fade-in">
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Próximos Eventos & Reuniones</div>
                <div className="section-subtitle">Seguimiento de hitos y actividades programadas</div>
              </div>
            </div>
            <div className="section-body">
              <div className="event-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {eventos.map((e) => (
                  <div key={e.id} className="event-item" style={{
                    display: 'flex', gap: '20px', padding: '16px', borderRadius: '12px',
                    background: 'var(--bg)', border: '1px solid var(--border)', transition: 'all 0.2s',
                    borderLeft: `5px solid ${e.color || 'var(--accent)'}`
                  }}>
                    <div className="event-date" style={{
                      width: '60px', height: '60px', borderRadius: '12px', background: 'var(--white)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
                    }}>
                      <span className="day" style={{ fontSize: '20px', fontWeight: '700', color: e.color || 'var(--accent)' }}>
                        {new Date(e.fecha_inicio).getDate()}
                      </span>
                      <span className="month" style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-3)', textTransform: 'uppercase' }}>
                        {new Date(e.fecha_inicio).toLocaleString("es", { month: "short" })}
                      </span>
                    </div>
                    <div className="event-info" style={{ flex: 1 }}>
                      <h3 className="event-title" style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{e.titulo}</h3>
                      <p className="event-desc" style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.4' }}>{e.descripcion}</p>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span className="event-time" style={{ fontSize: '12px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                          {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'var(--border)' }}></span>
                        <span style={{ fontSize: '12px', color: e.color || 'var(--accent)', fontWeight: '500' }}>
                          {e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {eventos.length === 0 && (
                  <div className="empty-state" style={{ padding: '60px 0' }}>
                    <div className="empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                      </svg>
                    </div>
                    <div style={{ marginTop: '16px', color: 'var(--text-3)', fontWeight: '500' }}>No hay eventos próximos registrados</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Nuevo Evento</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Título del Evento</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ej: Reunión de Equipo"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Descripción</label>
                  <textarea
                    className="form-input"
                    value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Detalles de la actividad..."
                    style={{ minHeight: '80px' }}
                  ></textarea>
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label>Fecha y Hora Inicio</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={form.fecha_inicio}
                      onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha y Hora Fin</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={form.fecha_fin}
                      onChange={e => setForm({ ...form, fecha_fin: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label>Categoría / Tipo</label>
                    <select
                      className="form-input"
                      value={form.tipo}
                      onChange={e => setForm({ ...form, tipo: e.target.value })}
                    >
                      <option value="evento">Evento General</option>
                      <option value="reunion">Reunión</option>
                      <option value="festivo">Festivo</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Color Distintivo</label>
                    <input
                      type="color"
                      className="form-input"
                      value={form.color}
                      onChange={e => setForm({ ...form, color: e.target.value })}
                      style={{ padding: '4px', height: '42px' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="todoElDia"
                      checked={form.todo_el_dia}
                      onChange={e => setForm({ ...form, todo_el_dia: e.target.checked })}
                    />
                    <label htmlFor="todoElDia" style={{ margin: 0, cursor: 'pointer' }}>Evento de todo el día</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
