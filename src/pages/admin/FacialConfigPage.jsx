import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';

export default function FacialConfigPage() {
    const [config, setConfig] = useState({
        minSimilarity: 75,
        maxAttempts: 3,
        enableAutoBlock: true,
        notifyAdmin: true,
        storageDuration: 30
    });
    const [saving, setSaving] = useState(false);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Mocking some biometric audit logs
        setLogs([
            { id: 1, user: 'Juan Perez', date: '2024-03-24 10:30', score: 98, status: 'success' },
            { id: 2, user: 'Maria Garcia', date: '2024-03-24 11:15', score: 65, status: 'failed' },
            { id: 3, user: 'Unknown', date: '2024-03-24 11:16', score: 12, status: 'blocked' }
        ]);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // await api.post('/api/admin/facial/config', config);
            await new Promise(r => setTimeout(r, 800));
            alert('Configuración biométrica actualizada con éxito.');
        } catch (err) {
            alert('Error al guardar la configuración.');
        } finally {
            setSaving(false);
        }
    };

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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

                        <div className="section-card" style={{ padding: '32px' }}>
                            <div className="section-card-header" style={{ marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>Parámetros del Motor</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-3)' }}>Ajuste la sensibilidad y reglas de reconocimiento facial</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Umbral de Similitud Mínimo</span>
                                    <span style={{ fontWeight: '700', color: 'var(--accent)' }}>{config.minSimilarity}%</span>
                                </label>
                                <input
                                    type="range" min="50" max="99" step="1"
                                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                                    value={config.minSimilarity}
                                    onChange={e => setConfig({ ...config, minSimilarity: e.target.value })}
                                />
                                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px' }}>
                                    Un valor más alto reduce falsos positivos pero aumenta la rigurosidad.
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '24px' }}>
                                <label className="form-label">Máximos Intentos de Validación</label>
                                <input
                                    type="number" className="form-input"
                                    value={config.maxAttempts}
                                    onChange={e => setConfig({ ...config, maxAttempts: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox" checked={config.enableAutoBlock}
                                        onChange={e => setConfig({ ...config, enableAutoBlock: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Bloqueo automático de IP</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Tras fallar el umbral biométrico repetidamente.</div>
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox" checked={config.notifyAdmin}
                                        onChange={e => setConfig({ ...config, notifyAdmin: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Notificar incidencias a Seguridad</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Envío de alertas en tiempo real por cada fallo crítico.</div>
                                    </div>
                                </label>
                            </div>

                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%', marginTop: '40px' }}>
                                {saving ? 'Guardando...' : 'Guardar Cambios Maestros'}
                            </button>
                        </div>

                        <div className="section-card" style={{ padding: '32px' }}>
                            <div className="section-card-header" style={{ marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>Auditoría de Acceso Facial</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-3)' }}>Últimos registros de escaneo biométrico</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {logs.map(log => (
                                    <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.status === 'success' ? '#22c55e' : '#ef4444' }}></div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{log.user}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{log.date}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '700', fontSize: '14px', color: log.score > 70 ? 'var(--text)' : '#ef4444' }}>{log.score}%</div>
                                            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>Similitud</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
