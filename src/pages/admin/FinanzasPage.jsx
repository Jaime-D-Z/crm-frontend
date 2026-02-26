import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';

export default function FinanzasPage() {
    const { showToast } = useToast();
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [typeFilter, setTypeFilter] = useState('todos');
    const [form, setForm] = useState({
        tipo: 'ingreso',
        concepto: '',
        categoria: 'General',
        monto: '',
        metodo_pago: 'transferencia',
        estado: 'completado',
        referencia: '',
        fecha: new Date().toISOString().slice(0, 10),
        observaciones: ''
    });

    const fetchData = async () => {
        try {
            const [s, t] = await Promise.all([
                api.get('/api/finanzas/stats'),
                api.get('/api/finanzas/transacciones')
            ]);
            setStats(s.data.stats);
            setTransactions(t.data.rows || []);
        } catch (err) {
            // Error loading transactions
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/finanzas/transacciones', form);
            showToast('Transacción registrada correctamente', 'success');
            setShowModal(false);
            setForm({
                tipo: 'ingreso',
                concepto: '',
                categoria: 'General',
                monto: '',
                metodo_pago: 'transferencia',
                estado: 'completado',
                referencia: '',
                fecha: new Date().toISOString().slice(0, 10),
                observaciones: ''
            });
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al registrar transacción', 'error');
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
                        <div className="topbar-sub">Operaciones › Gestión de Tesorería</div>
                        <div className="topbar-title">Finanzas & Contabilidad</div>
                    </div>
                    <div className="topbar-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Nuevo Movimiento
                        </button>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {/* Tabs for Transaction Type */}
                    <div className="section-card" style={{ padding: '0 24px', marginBottom: '24px', background: 'transparent', boxShadow: 'none', borderBottom: '1px solid var(--border)', borderRadius: '0' }}>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            {['todos', 'ingreso', 'egreso'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTypeFilter(t)}
                                    style={{
                                        padding: '16px 4px', background: 'none', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        color: (t === typeFilter) ? 'var(--accent)' : 'var(--text-3)',
                                        fontWeight: (t === typeFilter) ? '600' : '500',
                                        borderBottom: (t === typeFilter) ? '2px solid var(--accent)' : '2px solid transparent',
                                        transition: 'all 0.2s', fontSize: '14px', textTransform: 'capitalize'
                                    }}
                                >
                                    {t === 'todos' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>}
                                    {t === 'ingreso' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
                                    {t === 'egreso' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>}
                                    {t === 'todos' ? 'Ver Todos' : (t === 'ingreso' ? 'Ingresos' : 'Egresos')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Ingresos Totales</div>
                            <div className="stat-value" style={{ color: 'var(--accent-2)' }}>${stats?.ingresos?.toLocaleString()}</div>
                            <div className="stat-sub">Entradas de capital del periodo</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2">
                                <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Egresos Totales</div>
                            <div className="stat-value" style={{ color: 'var(--accent-err)' }}>${stats?.egresos?.toLocaleString()}</div>
                            <div className="stat-sub">Gastos y costos operativos</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-err)" strokeWidth="2">
                                <path d="M12 5v14M5 12l7 7 7-7" />
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Balance Neto</div>
                            <div className="stat-value">${stats?.flujo_caja?.toLocaleString()}</div>
                            <div className="stat-sub">Disponibilidad de caja actual</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <div>
                                <div className="section-title">Movimientos Financieros</div>
                                <div className="section-subtitle">Trazabilidad de tesorería y arqueo de caja</div>
                            </div>
                        </div>
                        <div className="section-body" style={{ padding: '0' }}>
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Concepto</th>
                                        <th>Categoría</th>
                                        <th>Monto</th>
                                        <th style={{ textAlign: 'right' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.filter(t => typeFilter === 'todos' || t.tipo === typeFilter).length === 0 ? (
                                        <tr>
                                            <td colSpan="6">
                                                <div className="empty-state" style={{ padding: '60px 0' }}>
                                                    <div className="empty-icon">
                                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                                                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                                        </svg>
                                                    </div>
                                                    <div style={{ color: 'var(--text-3)', marginTop: '12px' }}>Sin movimientos {typeFilter !== 'todos' ? `de tipo "${typeFilter}"` : 'financieros'} registrados</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.filter(t => typeFilter === 'todos' || t.tipo === typeFilter).map(t => (
                                            <tr key={t.id}>
                                                <td style={{ color: 'var(--text-2)', fontSize: '12px' }}>{new Date(t.fecha).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge ${t.tipo === 'ingreso' ? 'badge-green' : 'badge-red'}`} style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>
                                                        {t.tipo}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: '600', color: 'var(--text)' }}>{t.concepto}</td>
                                                <td><span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{t.categoria}</span></td>
                                                <td style={{ fontWeight: '700', color: t.tipo === 'ingreso' ? 'var(--accent-2)' : 'var(--accent-err)' }}>
                                                    {t.tipo === 'ingreso' ? '+' : '-'}${t.monto.toLocaleString()}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <span className={`badge ${t.estado === 'completado' ? 'badge-blue' : t.estado === 'pendiente' ? 'badge-orange' : 'badge-gray'}`} style={{ fontSize: '10px' }}>
                                                        {t.estado}
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
                            <h3 className="modal-title">Nuevo Movimiento Financiero</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Tipo de Movimiento</label>
                                        <select
                                            className="form-input"
                                            value={form.tipo}
                                            onChange={e => setForm({ ...form, tipo: e.target.value })}
                                            required
                                        >
                                            <option value="ingreso">Ingreso (+)</option>
                                            <option value="egreso">Egreso (-)</option>
                                        </select>
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
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Concepto / Glosa</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.concepto}
                                        onChange={e => setForm({ ...form, concepto: e.target.value })}
                                        placeholder="Ej: Pago de Honorarios, Venta de Producto..."
                                        required
                                    />
                                </div>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Monto</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-input"
                                                style={{ paddingLeft: '28px' }}
                                                value={form.monto}
                                                onChange={e => setForm({ ...form, monto: e.target.value })}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Categoría</label>
                                        <select
                                            className="form-input"
                                            value={form.categoria}
                                            onChange={e => setForm({ ...form, categoria: e.target.value })}
                                        >
                                            <option value="General">General</option>
                                            <option value="Ventas">Ventas</option>
                                            <option value="Compras">Compras</option>
                                            <option value="Servicios">Servicios</option>
                                            <option value="Impuestos">Impuestos</option>
                                            <option value="Nomina">Nómina</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Método de Pago</label>
                                        <select
                                            className="form-input"
                                            value={form.metodo_pago}
                                            onChange={e => setForm({ ...form, metodo_pago: e.target.value })}
                                        >
                                            <option value="transferencia">Transferencia</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="tarjeta">Tarjeta</option>
                                            <option value="otros">Otros</option>
                                        </select>
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
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Referencia / Comprobante</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.referencia}
                                        onChange={e => setForm({ ...form, referencia: e.target.value })}
                                        placeholder="Ej: Nro Operación, Factura..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Observaciones</label>
                                    <textarea
                                        className="form-input"
                                        value={form.observaciones}
                                        onChange={e => setForm({ ...form, observaciones: e.target.value })}
                                        placeholder="Notas adicionales..."
                                        style={{ minHeight: '80px' }}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
