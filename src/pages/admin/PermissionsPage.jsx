import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';

const MODULE_ICONS = {
    'Analitica': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    'Asistencia': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    'Auditoria': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    'Configuracion': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"/></svg>,
    'Desempeno': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    'Finanzas': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    'Objetivos': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    'Proyectos': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    'RRHH': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    'Ventas': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
};

const ACTION_LABELS = {
    'crear': { label: 'Crear', color: '#10b981' },
    'editar': { label: 'Editar', color: '#3b82f6' },
    'eliminar': { label: 'Eliminar', color: '#ef4444' },
    'ver': { label: 'Ver', color: '#6b7280' },
    'exportar': { label: 'Exportar', color: '#8b5cf6' },
};

export default function PermissionsPage() {
    const [matrix, setMatrix] = useState({ roles: [], permisos: [], assignedSet: [] });
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        api.get('/api/permissions/matrix')
            .then(r => {
                setMatrix(r.data);
                // Expandir todos los módulos por defecto
                const modules = {};
                r.data.permisos?.forEach(p => {
                    modules[p.modulo] = true;
                });
                setExpandedModules(modules);
            })
            .catch(() => {
                // Error loading permissions
            });
    }, []);

    const togglePermission = async (roleId, permisoId) => {
        try {
            await api.post('/api/permissions/toggle', { roleId, permisoId });
            const { data } = await api.get('/api/permissions/matrix');
            setMatrix(data);
        } catch (err) {
            alert('Error al actualizar permiso');
        }
    };

    const isGranted = (roleId, permisoId) => {
        return matrix.assignedSet?.includes(`${roleId}:${permisoId}`);
    };

    const toggleModule = (moduleName) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleName]: !prev[moduleName]
        }));
    };

    // Agrupar permisos por módulo
    const groupedPermisos = {};
    matrix.permisos?.forEach(perm => {
        if (!groupedPermisos[perm.modulo]) {
            groupedPermisos[perm.modulo] = [];
        }
        groupedPermisos[perm.modulo].push(perm);
    });

    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">Sistemas y Seguridad › Control de Acceso</div>
                        <div className="topbar-title">Gestión de Permisos RBAC</div>
                    </div>
                    <div className="topbar-actions">
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                const allExpanded = Object.values(expandedModules).every(v => v);
                                const newState = {};
                                Object.keys(groupedPermisos).forEach(mod => {
                                    newState[mod] = !allExpanded;
                                });
                                setExpandedModules(newState);
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                                <polyline points="9 11 12 14 22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                            {Object.values(expandedModules).every(v => v) ? 'Contraer Todo' : 'Expandir Todo'}
                        </button>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                        <div className="section-card" style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total de Roles</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6' }}>{matrix.roles?.length || 0}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Perfiles de usuario</div>
                        </div>
                        <div className="section-card" style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Módulos</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#8b5cf6' }}>{Object.keys(groupedPermisos).length}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Áreas del sistema</div>
                        </div>
                        <div className="section-card" style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Permisos</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{matrix.permisos?.length || 0}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Acciones configurables</div>
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <div>
                                <div className="section-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 8 }}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    Matriz de Roles & Privilegios
                                </div>
                                <div className="section-subtitle">Asignación granular de capacidades por perfil de usuario</div>
                            </div>
                        </div>

                        {/* Roles Header */}
                        <div style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', background: 'var(--surface-1)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>MÓDULO / ACCIÓN</div>
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${matrix.roles?.length || 1}, 1fr)`, gap: 8 }}>
                                    {matrix.roles?.map(r => (
                                        <div key={r.id} style={{ textAlign: 'center', fontWeight: 700, fontSize: 12, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {r.nombre}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="section-body" style={{ padding: '0' }}>
                            {Object.keys(groupedPermisos).length === 0 ? (
                                <div className="empty-state" style={{ padding: '60px 0' }}>
                                    <div className="empty-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <div style={{ marginTop: '16px', color: 'var(--text-3)', fontWeight: '500' }}>Configurando matriz de seguridad...</div>
                                </div>
                            ) : (
                                Object.keys(groupedPermisos).sort().map((moduleName) => (
                                    <div key={moduleName} style={{ borderBottom: '1px solid var(--border)' }}>
                                        {/* Module Header */}
                                        <div 
                                            onClick={() => toggleModule(moduleName)}
                                            style={{ 
                                                padding: '14px 20px', 
                                                background: 'var(--bg-hover)', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        >
                                            <svg 
                                                width="16" 
                                                height="16" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                strokeWidth="2"
                                                style={{ 
                                                    transition: 'transform 0.2s',
                                                    transform: expandedModules[moduleName] ? 'rotate(90deg)' : 'rotate(0deg)'
                                                }}
                                            >
                                                <polyline points="9 18 15 12 9 6"/>
                                            </svg>
                                            <div style={{ color: '#3b82f6', marginRight: 8 }}>
                                                {MODULE_ICONS[moduleName] || MODULE_ICONS['Configuracion']}
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', flex: 1 }}>
                                                {moduleName}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-1)', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>
                                                {groupedPermisos[moduleName].length} permisos
                                            </div>
                                        </div>

                                        {/* Module Permissions */}
                                        {expandedModules[moduleName] && (
                                            <div style={{ padding: '8px 0' }}>
                                                {groupedPermisos[moduleName].map((perm) => {
                                                    const actionInfo = ACTION_LABELS[perm.accion] || { label: perm.accion, color: '#6b7280' };
                                                    return (
                                                        <div 
                                                            key={perm.id}
                                                            style={{ 
                                                                padding: '12px 20px 12px 68px',
                                                                display: 'grid',
                                                                gridTemplateColumns: '300px 1fr',
                                                                gap: 16,
                                                                alignItems: 'center',
                                                                borderBottom: '1px solid var(--border)',
                                                                transition: 'background 0.15s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <span 
                                                                    style={{ 
                                                                        fontSize: '11px', 
                                                                        background: actionInfo.color + '22',
                                                                        color: actionInfo.color,
                                                                        padding: '4px 10px', 
                                                                        borderRadius: '6px',
                                                                        fontWeight: 700,
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.5px',
                                                                        border: `1px solid ${actionInfo.color}44`
                                                                    }}
                                                                >
                                                                    {actionInfo.label}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${matrix.roles?.length || 1}, 1fr)`, gap: 8 }}>
                                                                {matrix.roles?.map(role => (
                                                                    <div key={role.id} style={{ display: 'flex', justifyContent: 'center' }}>
                                                                        <label className="checkbox-container" style={{ margin: 0 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isGranted(role.id, perm.id)}
                                                                                onChange={() => togglePermission(role.id, perm.id)}
                                                                            />
                                                                            <span className="checkmark"></span>
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
