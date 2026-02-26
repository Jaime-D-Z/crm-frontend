import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';

/**
 * Helper to generate SVG Area Chart Path
 */
const generateAreaPath = (data, width, height) => {
    if (!data || data.length < 2) return '';
    const maxVal = Math.max(...data.map(d => d.visits), 10);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d.visits / maxVal) * height;
        return { x, y };
    });

    let path = `M 0 ${height}`;
    points.forEach((p, i) => {
        if (i === 0) path += ` L ${p.x} ${p.y}`;
        else {
            // Cubic bezier for smoothness
            const prev = points[i - 1];
            const cx = (prev.x + p.x) / 2;
            path += ` C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
        }
    });
    path += ` L ${width} ${height} Z`;
    return path;
};

const generateLinePath = (data, width, height) => {
    if (!data || data.length < 2) return '';
    const maxVal = Math.max(...data.map(d => d.visits), 10);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d.visits / maxVal) * height;
        return { x, y };
    });

    let path = '';
    points.forEach((p, i) => {
        if (i === 0) path += `M ${p.x} ${p.y}`;
        else {
            const prev = points[i - 1];
            const cx = (prev.x + p.x) / 2;
            path += ` C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
        }
    });
    return path;
};

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [topPages, setTopPages] = useState([]);
    const [devices, setDevices] = useState([]);
    const [traffic, setTraffic] = useState([]);
    const [ventasStats, setVentasStats] = useState(null);
    const [ventasEvolutivo, setVentasEvolutivo] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [s, p, d, t, vs, ve] = await Promise.all([
                    api.get('/api/analytics/stats'),
                    api.get('/api/analytics/pages'),
                    api.get('/api/analytics/devices'),
                    api.get('/api/analytics/traffic'),
                    api.get('/api/ventas/stats'),
                    api.get('/api/ventas/evolutivo')
                ]);
                setStats(s.data.stats);
                setTopPages(p.data.pages || []);
                setDevices(d.data.devices || []);
                setTraffic(t.data.data || []);
                setVentasStats(vs.data.stats);
                setVentasEvolutivo(ve.data.data || []);
            } catch (err) {
                // Error loading analytics
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    // Color palette for charts
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="crm-layout">
            <Sidebar />
            <main className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">Sistemas & Seguridad › Inteligencia de Negocio</div>
                        <div className="topbar-title">Analítica Avanzada</div>
                    </div>
                    <div className="topbar-actions">
                        <button className="btn btn-white" onClick={() => window.location.reload()}>
                            Actualizar Datos
                        </button>
                    </div>
                </div>

                <div className="crm-content fade-in">
                    {/* Key Performance Indicators */}
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <div className="stat-card">
                            <div className="stat-label">Vistas Totales</div>
                            <div className="stat-value">{stats?.total_visits ?? '0'}</div>
                            <div className="stat-sub">Tráfico registrado (7 días)</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Conversion Rate</div>
                            <div className="stat-value" style={{ color: '#10b981' }}>{ventasStats?.tasa_cierre ?? '0'}%</div>
                            <div className="stat-sub">De prospectos a cierres</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Valor Pipeline</div>
                            <div className="stat-value" style={{ color: '#f59e0b' }}>${ventasStats?.valor_pipeline?.toLocaleString() ?? '0'}</div>
                            <div className="stat-sub">Ingresos potenciales</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Sesiones/Usuario</div>
                            <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats?.pages_per_session ?? '0'}</div>
                            <div className="stat-sub">Engagement promedio</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 20v-6M6 20V10M18 20V4" /></svg>
                        </div>
                    </div>

                    {/* Main Charts Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
                        {/* Traffic Trend Chart */}
                        <div className="section-card">
                            <div className="section-header">
                                <div>
                                    <h3 className="section-title">Flujo de Tráfico en Tiempo Real</h3>
                                    <p className="section-subtitle">Visualización de vistas de página diarias</p>
                                </div>
                            </div>
                            <div className="section-body" style={{ padding: '24px' }}>
                                <div style={{ height: '240px', position: 'relative' }}>
                                    <svg width="100%" height="100%" viewBox="0 0 800 240" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        {/* Grid lines */}
                                        {[0, 1, 2, 3].map(i => (
                                            <line key={i} x1="0" y1={i * 80} x2="800" y2={i * 80} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                                        ))}
                                        {/* Paths */}
                                        {traffic.length > 0 && (
                                            <>
                                                <path d={generateAreaPath(traffic, 800, 240)} fill="url(#trafficGradient)" />
                                                <path d={generateLinePath(traffic, 800, 240)} fill="none" stroke="var(--accent)" strokeWidth="3" />
                                                {/* Dots on points */}
                                                {traffic.map((d, i) => {
                                                    const x = (i / (traffic.length - 1)) * 800;
                                                    const y = 240 - (d.visits / Math.max(...traffic.map(t => t.visits), 1) * 240);
                                                    return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="var(--accent)" strokeWidth="2" />;
                                                })}
                                            </>
                                        )}
                                    </svg>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'var(--text-3)', fontSize: '11px' }}>
                                    {traffic.map((d, i) => (
                                        <span key={i}>{new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Device Pie/Donut Chart */}
                        <div className="section-card">
                            <div className="section-header">
                                <div>
                                    <h3 className="section-title">Distribución de Dispositivos</h3>
                                    <p className="section-subtitle">Categoría de navegación</p>
                                </div>
                            </div>
                            <div className="section-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
                                <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                                    <svg width="160" height="160" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--bg-hover)" strokeWidth="4"></circle>
                                        {devices.reduce((acc, curr, idx) => {
                                            const total = devices.reduce((sum, d) => sum + d.total, 0);
                                            const percentage = (curr.total / total) * 100;
                                            const offset = acc.offset;
                                            acc.elements.push(
                                                <circle
                                                    key={idx}
                                                    cx="18" cy="18" r="15.915"
                                                    fill="none"
                                                    stroke={colors[idx % colors.length]}
                                                    strokeWidth="4"
                                                    strokeDasharray={`${percentage} ${100 - percentage}`}
                                                    strokeDashoffset={100 - offset + 25}
                                                    className="chart-segment"
                                                />
                                            );
                                            acc.offset += percentage;
                                            return acc;
                                        }, { elements: [], offset: 0 }).elements}
                                    </svg>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text)' }}>
                                            {devices.reduce((sum, d) => sum + d.total, 0)}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase' }}>Sesiones</div>
                                    </div>
                                </div>
                                <div style={{ width: '100%', marginTop: '24px' }}>
                                    {devices.map((d, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[i % colors.length] }}></div>
                                                <span style={{ fontSize: '13px', textTransform: 'capitalize', color: 'var(--text)' }}>{d.device_type}</span>
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '13px' }}>{Math.round((d.total / devices.reduce((sum, dv) => sum + dv.total, 0)) * 100)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CRM Wow Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                        {/* Sales Pipeline Funnel */}
                        <div className="section-card">
                            <div className="section-header">
                                <div>
                                    <h3 className="section-title">Embudo de Conversión (Funnel)</h3>
                                    <p className="section-subtitle">Eficiencia del ciclo de ventas</p>
                                </div>
                            </div>
                            <div className="section-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {ventasStats && [
                                    { label: 'Oportunidades', count: ventasStats.conteo, color: '#3b82f6', width: '100%' },
                                    { label: 'Negociación', count: ventasStats.pipeline, color: '#f59e0b', width: `${(ventasStats.pipeline / ventasStats.conteo) * 100}%` },
                                    { label: 'Cierres Exitosos', count: ventasStats.cerradas, color: '#10b981', width: `${(ventasStats.cerradas / ventasStats.conteo) * 100}%` }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{
                                            width: item.width,
                                            background: item.color,
                                            height: '40px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bolf',
                                            fontSize: '13px',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                            transition: 'width 1s ease-in-out'
                                        }}>
                                            {item.label}: {item.count}
                                        </div>
                                        {i < 2 && (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2" style={{ margin: '4px 0' }}>
                                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Revenue Evolutivo */}
                        <div className="section-card">
                            <div className="section-header">
                                <div>
                                    <h3 className="section-title">Crecimiento de Mensual</h3>
                                    <p className="section-subtitle">Evolución de ventas cerradas ($)</p>
                                </div>
                            </div>
                            <div className="section-body" style={{ padding: '24px' }}>
                                <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '15px' }}>
                                    {ventasEvolutivo.length === 0 ? (
                                        <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-3)' }}>Sin datos históricos</div>
                                    ) : (
                                        ventasEvolutivo.map((m, i) => {
                                            const maxV = Math.max(...ventasEvolutivo.map(x => x.cerradas), 1);
                                            const heightPerc = (m.cerradas / maxV) * 100;
                                            return (
                                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '100%',
                                                        background: 'var(--accent)',
                                                        height: `${heightPerc}%`,
                                                        borderRadius: '4px 4px 0 0',
                                                        position: 'relative',
                                                        transition: 'height 1s ease'
                                                    }}>
                                                        <div className="tooltip">${Math.round(m.cerradas)}</div>
                                                    </div>
                                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-3)' }}>{m.mes.split('-')[1]}/{m.mes.split('-')[0].slice(2)}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Pages Table */}
                    <div className="section-card" style={{ marginTop: '24px' }}>
                        <div className="section-header">
                            <div>
                                <h3 className="section-title">Análisis de Navegación</h3>
                                <p className="section-subtitle">Rutas con mayor tráfico acumulado</p>
                            </div>
                        </div>
                        <div className="section-body" style={{ padding: '0' }}>
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>Página / Ruta</th>
                                        <th style={{ textAlign: 'center' }}>Vistas Totales</th>
                                        <th style={{ textAlign: 'center' }}>Sesiones Únicas</th>
                                        <th style={{ textAlign: 'right' }}>Relevancia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPages.map((p, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: '600', color: 'var(--accent)' }}>{p.path}</td>
                                            <td style={{ textAlign: 'center' }}>{p.visits}</td>
                                            <td style={{ textAlign: 'center' }}>{p.unique_sessions}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ width: '100px', height: '6px', background: 'var(--bg-hover)', borderRadius: '3px', display: 'inline-block', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${(p.visits / Math.max(...topPages.map(x => x.visits), 1)) * 100}%`,
                                                        height: '100%',
                                                        background: 'var(--accent)'
                                                    }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* CSS Injected for Tooltips and animations */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .chart-segment { transition: stroke-dasharray 1.5s ease-in-out, stroke-dashoffset 1.5s ease-in-out; }
                    .tooltip { 
                        position: absolute; top: -25px; left: 50%; transform: translateX(-50%); 
                        background: var(--text); color: white; padding: 2px 6px; border-radius: 4px;
                        font-size: 10px; opacity: 0; transition: opacity 0.2s; pointer-events: none;
                        white-space: nowrap;
                    }
                    .section-card:hover .tooltip { opacity: 1; }
                    .stat-card { transition: transform 0.2s; cursor: default; }
                    .stat-card:hover { transform: translateY(-4px); }
                ` }} />
            </main>
        </div>
    );
}
