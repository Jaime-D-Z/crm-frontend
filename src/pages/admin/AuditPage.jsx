import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';

const ACTION_LABELS = {
    login: { label: 'Inicio de sesión', color: '#10b981', icon: 'login' },
    logout: { label: 'Cierre de sesión', color: '#6b7280', icon: 'logout' },
    employee_created: { label: 'Empleado creado', color: '#3b82f6', icon: 'user-plus' },
    employee_updated: { label: 'Empleado actualizado', color: '#8b5cf6', icon: 'user-edit' },
    employee_deleted: { label: 'Empleado eliminado', color: '#ef4444', icon: 'user-minus' },
    login_failed: { label: 'Login fallido', color: '#f59e0b', icon: 'alert' },
    password_changed: { label: 'Contraseña cambiada', color: '#06b6d4', icon: 'key' },
    evaluation_created: { label: 'Evaluación creada', color: '#14b8a6', icon: 'star' },
    objective_created: { label: 'Objetivo creado', color: '#a855f7', icon: 'target' },
    objective_updated: { label: 'Objetivo actualizado', color: '#ec4899', icon: 'target' },
};

export default function AuditPage() {
    const [logs, setLogs] = useState([]);
    const [duplicates, setDuplicates] = useState([]);
    const [actionFilter, setActionFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');

    useEffect(() => {
        api.get('/api/admin/audit')
            .then(r => {
                setLogs(r.data.logs || []);
                setDuplicates(r.data.duplicates || []);
            })
            .catch(() => {
                // Error loading duplicates
            });
    }, []);

    const filteredLogs = logs.filter(l => {
        const matchesAction = !actionFilter || l.action === actionFilter;
        const matchesUser = !userFilter || (l.user_name && l.user_name.toLowerCase().includes(userFilter.toLowerCase()));
        return matchesAction && matchesUser;
    });

    const uniqueActions = [...new Set(logs.map(l => l.action))];

    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">Sistemas & Seguridad › Trazabilidad de Eventos</div>
                        <div className="topbar-title">Auditoría del Sistema</div>
                    </div>
                    <div className="topbar-actions">
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                api.get('/api/admin/audit')
                                    .then(r => {
                                        setLogs(r.data.logs || []);
                                        setDuplicates(r.data.duplicates || []);
                                    });
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                                <polyline points="23 4 23 10 17 10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                            Actualizar
                        </button>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                        <div className="section-card" style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total de Eventos</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6' }}>{logs.length}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Registros de actividad</div>
                        </div>
                        <div className="section-card" style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Alertas de Seguridad</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: duplicates.length > 0 ? '#ef4444' : '#10b981' }}>{duplicates.length}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Posibles duplicados</div>
                        </div>
                        <div className="section-card" style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Usuarios Activos</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#8b5cf6' }}>{new Set(logs.map(l => l.user_id)).size}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Usuarios únicos</div>
                        </div>
                    </div>

                    <div className="section-card" style={{ marginBottom: '24px' }}>
                        <div className="section-header">
                            <div>
                                <div className="section-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 8 }}>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="16" y1="13" x2="8" y2="13"/>
                                        <line x1="16" y1="17" x2="8" y2="17"/>
                                    </svg>
                                    Logs de Actividad
                                </div>
                                <div className="section-subtitle">Registro cronológico de operaciones del sistema</div>
                            </div>
                        </div>
                        
                        {/* Filtros */}
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Buscar por usuario..."
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                style={{ maxWidth: 220, paddingLeft: 36, backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23999\' stroke-width=\'2\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'/%3E%3Cpath d=\'m21 21-4.35-4.35\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '12px center' }}
                            />
                            <select
                                className="form-select"
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                style={{ maxWidth: 200 }}
                            >
                                <option value="">Todos los eventos</option>
                                {uniqueActions.map(action => (
                                    <option key={action} value={action}>
                                        {ACTION_LABELS[action]?.label || action}
                                    </option>
                                ))}
                            </select>
                            {(actionFilter || userFilter) && (
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setActionFilter('');
                                        setUserFilter('');
                                    }}
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>

                        <div className="section-body" style={{ padding: '0' }}>
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Evento</th>
                                        <th>Detalles</th>
                                        <th>IP Origen</th>
                                        <th>Fecha y Hora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.length === 0 ? (
                                        <tr><td colSpan={5}>
                                            <div className="empty-state" style={{ padding: '40px 0' }}>
                                                <div className="empty-icon">
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                    </svg>
                                                </div>
                                                <div style={{ color: 'var(--text-3)', marginTop: '12px' }}>
                                                    {actionFilter || userFilter ? 'No se encontraron logs con los filtros aplicados' : 'Sin logs de actividad registrados'}
                                                </div>
                                            </div>
                                        </td></tr>
                                    ) : (
                                        filteredLogs.map((l, i) => {
                                            const actionInfo = ACTION_LABELS[l.action] || { label: l.action, color: '#6b7280' };
                                            return (
                                                <tr key={i}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <div style={{ 
                                                                width: 32, 
                                                                height: 32, 
                                                                borderRadius: '50%', 
                                                                background: 'var(--bg-hover)', 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                justifyContent: 'center',
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                color: actionInfo.color
                                                            }}>
                                                                {(l.user_name || 'S')[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                                    {l.user_name || (l.user_id ? `ID: ${l.user_id.slice(0, 8)}` : 'Sistema')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span 
                                                            className="badge" 
                                                            style={{ 
                                                                background: actionInfo.color + '22',
                                                                color: actionInfo.color,
                                                                border: `1px solid ${actionInfo.color}55`,
                                                                fontSize: '11px',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {actionInfo.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                        {l.details || '—'}
                                                    </td>
                                                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2)' }}>
                                                        {l.ip}
                                                    </td>
                                                    <td style={{ color: 'var(--text-3)', fontSize: 12, whiteSpace: 'nowrap' }}>
                                                        {new Date(l.created_at).toLocaleString('es', { 
                                                            day: '2-digit', 
                                                            month: 'short', 
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <div>
                                <div className="section-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 8 }}>
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                        <line x1="12" y1="9" x2="12" y2="13"/>
                                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                                    </svg>
                                    Alertas de Seguridad
                                </div>
                                <div className="section-subtitle">Detección de posibles duplicados o riesgos de integridad</div>
                            </div>
                        </div>
                        <div className="section-body" style={{ padding: '0' }}>
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>Administrador</th>
                                        <th>Nivel de Riesgo</th>
                                        <th>Nuevo Registro</th>
                                        <th>Similar Existente</th>
                                        <th>Acción Tomada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {duplicates.length === 0 ? (
                                        <tr><td colSpan={5}>
                                            <div className="empty-state" style={{ padding: '40px 0' }}>
                                                <div className="empty-icon">
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                                    </svg>
                                                </div>
                                                <div style={{ color: 'var(--text-3)', marginTop: '12px', fontWeight: 600 }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                                    </svg>
                                                    Sin alertas de seguridad pendientes
                                                </div>
                                            </div>
                                        </td></tr>
                                    ) : (
                                        duplicates.map((d, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: '600' }}>
                                                    {d.admin_name || (d.admin_id ? `ID: ${d.admin_id.slice(0, 8)}` : 'Sistema')}
                                                </td>
                                                <td>
                                                    <span 
                                                        className={`badge ${d.similitud > 75 ? 'badge-red' : 'badge-orange'}`} 
                                                        style={{ fontWeight: '700', fontSize: '11px' }}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                                        </svg>
                                                        {d.similitud}% Match
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '13px', fontWeight: 600 }}>{d.nombre_nuevo}</td>
                                                <td style={{ fontSize: '13px', color: 'var(--text-2)' }}>{d.nombre_similar}</td>
                                                <td>
                                                    <span className="badge badge-gray" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                                                        {d.accion}
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
            </main>
        </div>
    );
}
