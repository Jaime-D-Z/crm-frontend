import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';

export default function FacialConfigPage() {
    const [config, setConfig] = useState({
        threshold: 60,
        max_attempts: 3,
        auto_block_enabled: true,
        notify_admin: true
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadConfig();
        loadLogs();
        loadStats();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await api.get('/api/facial/config');
            if (res.data.ok && res.data.config) {
                setConfig(res.data.config);
            }
        } catch (err) {
            console.error('Error loading config:', err);
            showToast('Error al cargar la configuración', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        try {
            const res = await api.get('/api/facial/logs?limit=10');
            if (res.data.ok) {
                setLogs(res.data.logs);
            }
        } catch (err) {
            console.error('Error loading logs:', err);
        }
    };

    const loadStats = async () => {
        try {
            const res = await api.get('/api/facial/stats');
            if (res.data.ok) {
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/api/facial/config', config);
            if (res.data.ok) {
                showToast('Configuración actualizada correctamente', 'success');
                loadLogs(); // Reload logs after config change
            }
        } catch (err) {
            console.error('Error saving config:', err);
            showToast(err.response?.data?.error || 'Error al guardar la configuración', 'error');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="crm-layout">
                <Sidebar />
                <main className="crm-main">
                    <div className="crm-content">
                        <div style={{ textAlign: 'center', padding: '40px' }}>Cargando...</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">Sistema y Seguridad › Biometría</div>
                        <div className="topbar-title">Configuración Facial</div>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {stats && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                            <div className="section-card" style={{ padding: '20px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Total Intentos (30d)</div>
                                <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.total || 0}</div>
                            </div>
                            <div className="section-card" style={{ padding: '20px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Exitosos</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e' }}>{stats.successful || 0}</div>
                            </div>
                            <div className="section-card" style={{ padding: '20px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Fallidos</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{stats.failed || 0}</div>
                            </div>
                            <div className="section-card" style={{ padding: '20px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Similitud Promedio</div>
                                <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.avg_similarity ? `${parseFloat(stats.avg_similarity).toFixed(1)}%` : 'N/A'}</div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

                        <div className="section-card" style={{ padding: '32px' }}>
                            <div className="section-card-header" style={{ marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>Parámetros del Motor</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-3)' }}>Ajuste la sensibilidad y reglas de reconocimiento facial</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Umbral de Similitud Mínimo</span>
                                    <span style={{ fontWeight: '700', color: 'var(--accent)' }}>{config.threshold}%</span>
                                </label>
                                <input
                                    type="range" min="50" max="99" step="1"
                                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                                    value={config.threshold}
                                    onChange={e => setConfig({ ...config, threshold: parseFloat(e.target.value) })}
                                />
                                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px' }}>
                                    Un valor más alto reduce falsos positivos pero aumenta la rigurosidad.
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '24px' }}>
                                <label className="form-label">Máximos Intentos de Validación</label>
                                <input
                                    type="number" className="form-input"
                                    value={config.max_attempts}
                                    onChange={e => setConfig({ ...config, max_attempts: parseInt(e.target.value) })}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox" checked={config.auto_block_enabled}
                                        onChange={e => setConfig({ ...config, auto_block_enabled: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Bloqueo automático de IP</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Tras fallar el umbral biométrico repetidamente.</div>
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox" checked={config.notify_admin}
                                        onChange={e => setConfig({ ...config, notify_admin: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Notificar incidencias a Seguridad</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Envío de alertas en tiempo real por cada fallo crítico.</div>
                                    </div>
                                </label>
                            </div>

                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%', marginTop: '40px' }}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>

                        <div className="section-card" style={{ padding: '32px' }}>
                            <div className="section-card-header" style={{ marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>Auditoría de Acceso Facial</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-3)' }}>Últimos registros de escaneo biométrico</p>
                            </div>

                            {logs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>
                                    No hay registros aún
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {logs.map(log => (
                                        <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.status === 'success' ? '#22c55e' : '#ef4444' }}></div>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{log.user_name || 'Usuario desconocido'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{formatDate(log.created_at)}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '700', fontSize: '14px', color: log.similarity > 70 ? 'var(--text)' : '#ef4444' }}>
                                                    {log.similarity ? `${parseFloat(log.similarity).toFixed(1)}%` : 'N/A'}
                                                </div>
                                                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>Similitud</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
