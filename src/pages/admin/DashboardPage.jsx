import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';

const ACTION_LABELS = {
    login: { label: 'Inicio de sesión', color: '#4ade80' },
    logout: { label: 'Cierre de sesión', color: '#94a3b8' },
    employee_created: { label: 'Empleado registrado', color: '#60a5fa' },
    employee_updated: { label: 'Empleado actualizado', color: '#a78bfa' },
    login_failed: { label: 'Login fallido', color: '#f87171' },
    password_changed: { label: 'Contraseña cambiada', color: '#34d399' },
};

const empTypeLabels = {
    instructor: 'Instructor',
    developer: 'Desarrollador',
    administrator: 'Administrador',
    assistant: 'Asistente',
    other: 'Otro'
};

function timeAgo(dt) {
    const diff = Date.now() - new Date(dt).getTime();
    if (diff < 60000) return 'hace un momento';
    if (diff < 3600000) return `hace ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)}h`;
    return `hace ${Math.floor(diff / 86400000)}d`;
}

export default function AdminDashboardPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/api/admin/dashboard')
            .then(r => setData(r.data))
            .catch(() => setError('Error cargando el dashboard.'));
    }, []);

    const stats = data?.stats;

    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">
                            Gestión Interna › Panel Principal
                        </div>
                        <div className="topbar-title">Dashboard</div>
                    </div>
                    <div className="topbar-actions">
                        <button className="btn btn-success btn-sm" onClick={() => window.location.href = '/admin/employees'}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Agregar Empleado
                        </button>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {error && <div className="alert alert-error">{error}</div>}

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total Personal</div>
                            <div className="stat-value">{stats?.total ?? '—'}</div>
                            <div className="stat-sub">Empleados registrados</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Instructores</div>
                            <div className="stat-value">{stats?.byType?.instructor ?? 0}</div>
                            <div className="stat-sub">Equipo docente</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Desarrolladores</div>
                            <div className="stat-value">{stats?.byType?.developer ?? 0}</div>
                            <div className="stat-sub">Equipo técnico</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-3)" strokeWidth="2">
                                <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Administrativos</div>
                            <div className="stat-value">{stats?.byType?.administrator ?? 0}</div>
                            <div className="stat-sub">Personal admin</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warn)" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Recent employees + Activity logs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="section-card">
                            <div className="section-header">
                                <div>
                                    <div className="section-title">Nuevas Incorporaciones</div>
                                    <div className="section-subtitle">Últimos empleados registrados</div>
                                </div>
                                <a href="/admin/employees" className="btn btn-ghost btn-sm">Ver todos</a>
                            </div>
                            <div className="section-body">
                                {!data?.recent?.length ? (
                                    <div className="empty-state" style={{ padding: '40px 0' }}>
                                        <div className="empty-icon">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </div>
                                        <div style={{ marginTop: '12px', color: 'var(--text-3)' }}>Sin registros recientes</div>
                                    </div>
                                ) : (
                                    data.recent.map(e => (
                                        <div key={e.id} className="log-item" style={{ borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
                                            {e.photo_url ? (
                                                <img src={e.photo_url} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt={e.name} />
                                            ) : (
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: 'var(--accent)', flexShrink: 0 }}>
                                                    {e.name[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div style={{ flex: 1, marginLeft: '12px' }}>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{e.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{empTypeLabels[e.employee_type] || e.employee_type} · {e.department || '—'}</div>
                                            </div>
                                            <span className={`badge ${e.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                                                {e.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="section-card">
                            <div className="section-header">
                                <div>
                                    <div className="section-title">Actividad Reciente</div>
                                    <div className="section-subtitle">Eventos del sistema</div>
                                </div>
                            </div>
                            <div className="section-body">
                                {!data?.logs?.length ? (
                                    <div className="empty-state" style={{ padding: '40px 0' }}>
                                        <div className="empty-icon">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                            </svg>
                                        </div>
                                        <div style={{ marginTop: '12px', color: 'var(--text-3)' }}>Sin actividad registrada</div>
                                    </div>
                                ) : (
                                    data.logs.map((l, i) => {
                                        const info = ACTION_LABELS[l.action] || { label: l.action, color: '#94a3b8' };
                                        return (
                                            <div key={i} className="log-item" style={{ borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
                                                <div className="log-dot" style={{ background: info.color }}></div>
                                                <div style={{ flex: 1, marginLeft: '12px' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{info.label}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{l.user_name || 'Sistema'} · {l.ip}</div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: '500' }}>{timeAgo(l.created_at)}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
