import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';

export default function ConfiguracionPage() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            const { data } = await api.get('/api/admin/config');
            setConfigs(data.config || []);
        } catch (err) {
            // Error loading configs
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key, newValue) => {
        setSavingKey(key);
        try {
            await api.put(`/api/admin/config/${key}`, { value: newValue });
            // Update local state
            setConfigs(prev => prev.map(c => c.key_name === key ? { ...c, value_content: newValue } : c));
            showToast('Configuración actualizada correctamente', 'success');
        } catch (err) {
            showToast('Error al actualizar configuración', 'error');
        } finally {
            setSavingKey(null);
        }
    };

    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">Sistema › Ajustes Globales</div>
                        <div className="topbar-title">Configuración del Sistema</div>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    <div className="section-card-header">
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Variables de Entorno y Preferencias</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-3)' }}>
                            Gestión centralizada de parámetros operativos del CRM.
                        </p>
                    </div>

                    <div className="section-card" style={{ marginTop: '20px' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Cargando configuración...</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="crm-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '250px' }}>Parámetro</th>
                                            <th>Valor / Contenido</th>
                                            <th style={{ width: '150px', textAlign: 'right' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {configs.map(item => (
                                            <tr key={item.key_name}>
                                                <td>
                                                    <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '14px' }}>{item.key_name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.description}</div>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        style={{ fontSize: '13px', padding: '8px 12px' }}
                                                        defaultValue={item.value_content}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== item.value_content) {
                                                                handleUpdate(item.key_name, e.target.value);
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {savingKey === item.key_name ? (
                                                        <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>Guardando...</span>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', color: '#22c55e', opacity: 0.7 }}>Sincronizado</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>Nota de Seguridad</div>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-3)', lineHeight: '1.5' }}>
                                    Los cambios en estas variables afectan el comportamiento global del sistema.
                                    Asegúrese de validar los valores antes de salir de esta pantalla.
                                    El sistema registra quién realizó cada modificación por motivos de auditoría.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
