import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../api/api";
import { useToast } from "../../context/ToastContext";

export default function NotificacionesPage() {
  const { showToast } = useToast();
  const [notif, setNotif] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    usuario_id: "",
    titulo: "",
    mensaje: "",
    tipo: "info",
    todos: false
  });

  const fetchData = async () => {
    try {
      const [nRes, uRes] = await Promise.all([
        api.get("/api/notificaciones"),
        api.get("/api/users").catch(e => {
          // Error fetching users - continue with empty array
          return { data: { users: [] } };
        })
      ]);
      setNotif(nRes.data.notificaciones || []);
      setUsers(uRes.data.users || []);
    } catch (err) {
      // Error loading notifications
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/notificaciones", form);
      showToast("Notificación enviada con éxito", "success");
      setShowModal(false);
      setForm({ usuario_id: "", titulo: "", mensaje: "", tipo: "info", todos: false });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al enviar notificación", "error");
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
            <div className="topbar-sub">Comunicaciones › Alertas del Sistema</div>
            <div className="topbar-title">Centro de Notificaciones</div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Crear Notificación
            </button>
          </div>
        </div>

        <div className="crm-content fade-in">
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Historial de Alertas & Mensajes</div>
                <div className="section-subtitle">Trazabilidad de comunicaciones enviadas a usuarios</div>
              </div>
            </div>

            <div className="section-body" style={{ padding: '0' }}>
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Asunto / Título</th>
                    <th>Mensaje Detallado</th>
                    <th>Destinatario</th>
                    <th style={{ textAlign: 'right' }}>Fecha de Envío</th>
                  </tr>
                </thead>
                <tbody>
                  {notif.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state" style={{ padding: '60px 0' }}>
                          <div className="empty-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                          </div>
                          <div style={{ marginTop: '16px', color: 'var(--text-3)', fontWeight: '500' }}>No se han emitido notificaciones recientemente</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    notif.map((n) => (
                      <tr key={n.id}>
                        <td style={{ fontWeight: '600', color: 'var(--text)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.tipo === 'error' ? '#ef4444' : n.tipo === 'warning' ? '#f59e0b' : 'var(--accent)' }}></div>
                            {n.titulo}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-2)', fontSize: '13px', maxWidth: '300px' }}>{n.mensaje}</td>
                        <td>
                          <span className="badge badge-gray" style={{ fontSize: '11px' }}>
                            {n.usuario_nombre || "Todos los Usuarios"}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--text-3)', fontSize: '12px' }}>
                          {new Date(n.created_at).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Nueva Notificación</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Título / Asunto</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ej: Mantenimiento del Sistema"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Mensaje</label>
                  <textarea
                    className="form-input"
                    value={form.mensaje}
                    onChange={e => setForm({ ...form, mensaje: e.target.value })}
                    placeholder="Escribe el contenido detallado..."
                    style={{ minHeight: '100px' }}
                  ></textarea>
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select
                      className="form-input"
                      value={form.tipo}
                      onChange={e => setForm({ ...form, tipo: e.target.value })}
                    >
                      <option value="info">Información (Azul)</option>
                      <option value="success">Éxito (Verde)</option>
                      <option value="warning">Advertencia (Naranja)</option>
                      <option value="error">Crítico (Rojo)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Destinatario</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <input
                        type="checkbox"
                        id="todos"
                        checked={form.todos}
                        onChange={e => setForm({ ...form, todos: e.target.checked, usuario_id: e.target.checked ? "" : form.usuario_id })}
                      />
                      <label htmlFor="todos" style={{ margin: 0, cursor: 'pointer' }}>Todos los usuarios</label>
                    </div>
                  </div>
                </div>
                {!form.todos && (
                  <div className="form-group">
                    <label>Seleccionar Usuario</label>
                    <select
                      className="form-input"
                      value={form.usuario_id}
                      onChange={e => setForm({ ...form, usuario_id: e.target.value })}
                      required={!form.todos}
                    >
                      <option value="">Seleccione un usuario...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role_name || u.role})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Notificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
