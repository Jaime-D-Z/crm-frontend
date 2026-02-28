import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';

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
                            <div className="stat-value">{Math.round(stats?.total_visits ?? 0)}</div>
                            <div className="stat-sub">Tráfico registrado (7 días)</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Conversion Rate</div>
                            <div className="stat-value" style={{ color: '#10b981' }}>{Math.round(ventasStats?.tasa_cierre ?? 0)}%</div>
                            <div className="stat-sub">De prospectos a cierres</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Valor Pipeline</div>
                            <div className="stat-value" style={{ color: '#f59e0b' }}>${Math.round(Number(ventasStats?.valor_pipeline ?? 0)).toLocaleString('en-US')}</div>
                            <div className="stat-sub">Ingresos potenciales</div>
                            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Sesiones/Usuario</div>
                            <div className="stat-value" style={{ color: '#8b5cf6' }}>{Math.round(stats?.pages_per_session ?? 0)}</div>
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
                                <div style={{ height: '280px', width: '100%' }}>
                                    {traffic.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={traffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(tick) => new Date(tick).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                    stroke="var(--text-3)"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="var(--text-3)"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                                                    itemStyle={{ color: 'var(--accent)' }}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="visits"
                                                    name="Vistas"
                                                    stroke="var(--accent)"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorVisits)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                                            Sin datos de tráfico
                                        </div>
                                    )}
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
                                <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={devices}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="total"
                                                nameKey="device_type"
                                                stroke="none"
                                            >
                                                {devices.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                                                itemStyle={{ color: 'var(--text)' }}
                                                formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text)' }}>
                                            {devices.reduce((sum, d) => sum + Number(d.total), 0)}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sesiones</div>
                                    </div>
                                </div>
                                <div style={{ width: '100%', marginTop: '24px' }}>
                                    {devices.map((d, i) => {
                                        const totalDevices = devices.reduce((sum, dv) => sum + Number(dv.total), 0);
                                        const percentage = totalDevices > 0 ? Math.round((Number(d.total) / totalDevices) * 100) : 0;
                                        return (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[i % colors.length] }}></div>
                                                    <span style={{ fontSize: '13px', textTransform: 'capitalize', color: 'var(--text)' }}>{d.device_type}</span>
                                                </div>
                                                <span style={{ fontWeight: '600', fontSize: '13px' }}>{percentage}%</span>
                                            </div>
                                        );
                                    })}
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
                                    { label: 'Oportunidades', count: Number(ventasStats.conteo), color: '#3b82f6', width: '100%' },
                                    { label: 'Negociación', count: Number(ventasStats.pipeline || 0), color: '#f59e0b', width: `${(Number(ventasStats.pipeline || 0) / Number(ventasStats.conteo || 1)) * 100}%` },
                                    { label: 'Cierres Exitosos', count: Number(ventasStats.cerradas || 0), color: '#10b981', width: `${(Number(ventasStats.cerradas || 0) / Number(ventasStats.conteo || 1)) * 100}%` }
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
                                <div style={{ height: '240px', width: '100%' }}>
                                    {ventasEvolutivo.length === 0 ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                                            Sin datos históricos
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ventasEvolutivo} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                                <XAxis
                                                    dataKey="mes"
                                                    tickFormatter={(tick) => { const parts = tick.split('-'); return `${parts[1]}/${parts[0].slice(2)}`; }}
                                                    stroke="var(--text-3)"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="var(--text-3)"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value}`}
                                                />
                                                <RechartsTooltip
                                                    cursor={{ fill: 'var(--border)', opacity: 0.4 }}
                                                    contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                                                    itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
                                                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ventas Cerradas']}
                                                    labelFormatter={(label) => `Mes: ${label}`}
                                                />
                                                <Bar
                                                    dataKey="cerradas"
                                                    name="Ventas Cerradas"
                                                    fill="var(--accent)"
                                                    radius={[6, 6, 0, 0]}
                                                    barSize={40}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
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
