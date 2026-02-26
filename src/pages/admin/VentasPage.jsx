import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';

export default function VentasPage() {
    const { showToast } = useToast();
    const [stats, setStats] = useState(null);
    const [sales, setSales] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('todos');
    const [form, setForm] = useState({
        cliente_nombre: '',
        concepto: '',
        monto: '',
        fecha: new Date().toISOString().slice(0, 10),
        estado: 'completado'
    });

    const fetchData = async () => {
        try {
            const [s, t] = await Promise.all([
                api.get('/api/ventas/stats'),
                api.get('/api/ventas')
            ]);
            setStats(s.data.stats);
            setSales(t.data.rows || []);
        } catch (err) {
            // Error loading sales
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/ventas', form);
            showToast('Venta registrada con éxito', 'success');
            setShowModal(false);
            setForm({
                cliente_nombre: '',
                concepto: '',
                monto: '',
                fecha: new Date().toISOString().slice(0, 10),
                estado: 'completado'
            });
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al registrar venta', 'error');
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
                        <div className="topbar-sub">Comercial › Registro de Transacciones</div>
                        <div className="topbar-title">Ventas & Ingresos</div>
                    </div>
                    <div className="topbar-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Nueva Venta
                        </button>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {/* Tabs for Transaction Status */}
                    <div className="section-card" style={{ padding: '0 24px', marginBottom: '24px', background: 'transparent', boxShadow: 'none', borderBottom: '1px solid var(--border)', borderRadius: '0' }}>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            {['todos', 'completado', 'pendiente', 'cancelado'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    style={{
                                        padding: '16px 4px', background: 'none', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        color: (status === statusFilter) ? 'var(--accent)' : 'var(--text-3)',
                                        fontWeight: (status === statusFilter) ? '600' : '500',
                                        borderBottom: (status === statusFilter) ? '2px solid var(--accent)' : '2px solid transparent',
                                        transition: 'all 0.2s', fontSize: '14px', textTransform: 'capitalize'
                                    }}
                                >
                                    {status === 'todos' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>}
                                    {status === 'completado' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                                    {status === 'pendiente' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                                    {status === 'cancelado' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>}
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total Ventas</div>
                            <div className="stat-value">${stats?.totalVentas?.toLocaleString()}</div>
                            <div className="stat-sub">Volumen total facturado</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Transacciones</div>
                            <div className="stat-value">{stats?.conteo}</div>
                            <div className="stat-sub">Operaciones registradas</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Ticket Promedio</div>
                            <div className="stat-value">${stats?.promedio?.toLocaleString()}</div>
                            <div className="stat-sub">Monto medio por venta</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-3)" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <div>
                                <div className="section-title">Registro de Ingresos</div>
                                <div className="section-subtitle">Trazabilidad completa de operaciones comerciales</div>
                            </div>
                        </div>
                        <div className="section-body" style={{ padding: '0' }}>
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>Fecha de Operación</th>
                                        <th>Cliente / Entidad</th>
                                        <th>Concepto del Pago</th>
                                        <th>Monto</th>
                                        <th style={{ textAlign: 'right' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.filter(s => statusFilter === 'todos' || s.estado === statusFilter).length === 0 ? (
                                        <tr>
                                            <td colSpan="5">
                                                <div className="empty-state" style={{ padding: '60px 0' }}>
                                                    <div className="empty-icon">
                                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                                                            <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                                                        </svg>
                                                    </div>
                                                    <div style={{ color: 'var(--text-3)', marginTop: '12px' }}>No hay ventas {statusFilter !== 'todos' ? `con estado "${statusFilter}"` : 'registradas'}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sales.filter(s => statusFilter === 'todos' || s.estado === statusFilter).map(s => (
                                            <tr key={s.id}>
                                                <td style={{ color: 'var(--text-2)', fontSize: '12px' }}>{new Date(s.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                <td style={{ fontWeight: '600', color: 'var(--text)' }}>{s.cliente_nombre || 'S/N'}</td>
                                                <td style={{ fontSize: '13px' }}>{s.concepto}</td>
                                                <td style={{ fontWeight: '700', color: 'var(--accent)' }}>${s.monto.toLocaleString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <span className={`badge ${s.estado === 'completado' ? 'badge-green' : s.estado === 'pendiente' ? 'badge-orange' : 'badge-red'}`} style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                                                        {s.estado}
                                                    </span>
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
                            <h3 className="modal-title">Registrar Nueva Venta</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Cliente / Entidad</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.cliente_nombre}
                                        onChange={e => setForm({ ...form, cliente_nombre: e.target.value })}
                                        placeholder="Nombre del cliente"
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Concepto del Pago</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.concepto}
                                        onChange={e => setForm({ ...form, concepto: e.target.value })}
                                        placeholder="Ej: Suscripción Mensual"
                                        required
                                    />
                                </div>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Monto ($)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.monto}
                                            onChange={e => setForm({ ...form, monto: e.target.value })}
                                            placeholder="0.00"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Fecha</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={form.fecha}
                                            onChange={e => setForm({ ...form, fecha: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select
                                        className="form-input"
                                        value={form.estado}
                                        onChange={e => setForm({ ...form, estado: e.target.value })}
                                    >
                                        <option value="completado">Completado</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Registrar Venta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
