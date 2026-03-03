import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export default function VentasPage() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('productos');
    const [productos, setProductos] = useState([]);
    const [stats, setStats] = useState(null);
    const [analyticsStats, setAnalyticsStats] = useState(null);
    const [topProductos, setTopProductos] = useState([]);
    const [usuariosUnicos, setUsuariosUnicos] = useState([]);
    const [checkoutFunnel, setCheckoutFunnel] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen_url: '',
        categoria: 'General',
        stock: 0,
        activo: true,
        destacado: false,
        orden: 0
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'productos') {
                const [p, s] = await Promise.all([
                    api.get('/api/productos'),
                    api.get('/api/productos/stats')
                ]);
                setProductos(p.data.productos || []);
                setStats(s.data.stats);
            } else {
                const [a, t, u, f] = await Promise.all([
                    api.get('/api/eventos/stats'),
                    api.get('/api/eventos/top-productos?limit=10'),
                    api.get('/api/eventos/usuarios-unicos'),
                    api.get('/api/eventos/checkout-funnel')
                ]);
                setAnalyticsStats(a.data.stats);
                setTopProductos(t.data.productos || []);
                setUsuariosUnicos(u.data.usuarios || []);
                setCheckoutFunnel(f.data.funnel);
            }
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingProduct) {
                await api.put(`/api/productos/${editingProduct.id}`, form);
                showToast('Producto actualizado exitosamente', 'success');
            } else {
                await api.post('/api/productos', form);
                showToast('Producto creado exitosamente', 'success');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al guardar producto', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (producto) => {
        setEditingProduct(producto);
        setForm({
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio: producto.precio,
            imagen_url: producto.imagen_url || '',
            categoria: producto.categoria,
            stock: producto.stock,
            activo: producto.activo,
            destacado: producto.destacado,
            orden: producto.orden
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await api.delete(`/api/productos/${id}`);
            showToast('Producto eliminado exitosamente', 'success');
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al eliminar producto', 'error');
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setForm({
            nombre: '',
            descripcion: '',
            precio: '',
            imagen_url: '',
            categoria: 'General',
            stock: 0,
            activo: true,
            destacado: false,
            orden: 0
        });
    };

    return (
        <div className="crm-layout">
            <Sidebar />
            <div className="crm-main">
                <div className="crm-topbar">
                    <div>
                        <div className="topbar-sub">E-Commerce › Gestión de Ventas</div>
                        <div className="topbar-title">Productos & Analytics</div>
                    </div>
                    {activeTab === 'productos' && (
                        <div className="topbar-actions">
                            <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowModal(true); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Nuevo Producto
                            </button>
                        </div>
                    )}
                </div>

                <div className="crm-content fade-in">
                    {/* Tabs */}
                    <div className="section-card" style={{ padding: '0 24px', marginBottom: '24px', background: 'transparent', boxShadow: 'none', borderBottom: '1px solid var(--border)', borderRadius: '0' }}>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            <button
                                onClick={() => setActiveTab('productos')}
                                style={{
                                    padding: '16px 4px', background: 'none', border: 'none', cursor: 'pointer',
                                    color: activeTab === 'productos' ? 'var(--accent)' : 'var(--text-3)',
                                    fontWeight: activeTab === 'productos' ? '600' : '500',
                                    borderBottom: activeTab === 'productos' ? '2px solid var(--accent)' : '2px solid transparent',
                                    fontSize: '14px'
                                }}
                            >
                                📦 Gestión de Productos
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                style={{
                                    padding: '16px 4px', background: 'none', border: 'none', cursor: 'pointer',
                                    color: activeTab === 'analytics' ? 'var(--accent)' : 'var(--text-3)',
                                    fontWeight: activeTab === 'analytics' ? '600' : '500',
                                    borderBottom: activeTab === 'analytics' ? '2px solid var(--accent)' : '2px solid transparent',
                                    fontSize: '14px'
                                }}
                            >
                                📊 Analytics de Ventas
                            </button>
                        </div>
                    </div>


                    {/* Tab: Productos */}
                    {activeTab === 'productos' && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Total Productos</div>
                                    <div className="stat-value">{stats?.total || 0}</div>
                                    <div className="stat-sub">{stats?.activos || 0} activos</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Categorías</div>
                                    <div className="stat-value">{stats?.categorias || 0}</div>
                                    <div className="stat-sub">Diferentes tipos</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Stock Total</div>
                                    <div className="stat-value">{stats?.stock_total || 0}</div>
                                    <div className="stat-sub">Unidades disponibles</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Precio Promedio</div>
                                    <div className="stat-value">${stats?.precio_promedio ? parseFloat(stats.precio_promedio).toFixed(2) : '0.00'}</div>
                                    <div className="stat-sub">Por producto</div>
                                </div>
                            </div>

                            <div className="section-card">
                                <div className="section-header">
                                    <div>
                                        <div className="section-title">Catálogo de Productos</div>
                                        <div className="section-subtitle">Gestiona tu inventario de productos</div>
                                    </div>
                                </div>
                                <div className="section-body" style={{ padding: '0' }}>
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Categoría</th>
                                                <th>Precio</th>
                                                <th>Stock</th>
                                                <th>Estado</th>
                                                <th style={{ textAlign: 'right' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productos.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6">
                                                        <div className="empty-state" style={{ padding: '60px 0' }}>
                                                            <div className="empty-icon">
                                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1">
                                                                    <circle cx="9" cy="21" r="1"></circle>
                                                                    <circle cx="20" cy="21" r="1"></circle>
                                                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                                                </svg>
                                                            </div>
                                                            <div style={{ color: 'var(--text-3)', marginTop: '12px' }}>No hay productos registrados</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                productos.map(p => (
                                                    <tr key={p.id}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                {p.imagen_url ? (
                                                                    <img src={p.imagen_url} alt={p.nombre} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
                                                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div style={{ fontWeight: '600' }}>{p.nombre}</div>
                                                                    {p.destacado && <span className="badge badge-orange" style={{ fontSize: '10px' }}>DESTACADO</span>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{p.categoria}</td>
                                                        <td style={{ fontWeight: '700', color: 'var(--accent)' }}>${p.precio.toLocaleString()}</td>
                                                        <td>{p.stock}</td>
                                                        <td>
                                                            <span className={`badge ${p.activo ? 'badge-green' : 'badge-red'}`}>
                                                                {p.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(p)} style={{ marginRight: '8px' }}>
                                                                Editar
                                                            </button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
                                                                Eliminar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}


                    {/* Tab: Analytics */}
                    {activeTab === 'analytics' && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Total Eventos</div>
                                    <div className="stat-value">{analyticsStats?.total_eventos || 0}</div>
                                    <div className="stat-sub">Últimos 30 días</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Sesiones Únicas</div>
                                    <div className="stat-value">{analyticsStats?.sesiones_unicas || 0}</div>
                                    <div className="stat-sub">Visitantes diferentes</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Vistas de Productos</div>
                                    <div className="stat-value">{analyticsStats?.vistas_producto || 0}</div>
                                    <div className="stat-sub">{analyticsStats?.productos_vistos || 0} productos únicos</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Tasa de Conversión</div>
                                    <div className="stat-value">{analyticsStats?.tasa_conversion || 0}%</div>
                                    <div className="stat-sub">Vistas → Contactos</div>
                                </div>
                            </div>

                            <div className="section-card">
                                <div className="section-header">
                                    <div>
                                        <div className="section-title">Productos Más Vistos</div>
                                        <div className="section-subtitle">Top 10 productos con más interacción</div>
                                    </div>
                                </div>
                                <div className="section-body" style={{ padding: '0' }}>
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Categoría</th>
                                                <th>Vistas</th>
                                                <th>Detalles</th>
                                                <th>Contactos</th>
                                                <th>Sesiones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProductos.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6">
                                                        <div className="empty-state" style={{ padding: '60px 0' }}>
                                                            <div style={{ color: 'var(--text-3)' }}>No hay datos de analytics aún</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                topProductos.map((p, idx) => (
                                                    <tr key={p.id}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <div style={{ 
                                                                    width: '24px', 
                                                                    height: '24px', 
                                                                    borderRadius: '50%', 
                                                                    background: idx < 3 ? 'var(--accent)' : 'var(--bg-2)', 
                                                                    color: idx < 3 ? 'white' : 'var(--text-3)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '12px',
                                                                    fontWeight: '700'
                                                                }}>
                                                                    {idx + 1}
                                                                </div>
                                                                <div style={{ fontWeight: '600' }}>{p.nombre}</div>
                                                            </div>
                                                        </td>
                                                        <td>{p.categoria}</td>
                                                        <td><span className="badge badge-blue">{p.vistas}</span></td>
                                                        <td><span className="badge badge-purple">{p.detalles}</span></td>
                                                        <td><span className="badge badge-green">{p.contactos}</span></td>
                                                        <td>{p.sesiones_unicas}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Usuarios Únicos con IPs */}
                            <div className="section-card">
                                <div className="section-header">
                                    <div>
                                        <div className="section-title">Usuarios en Tiempo Real</div>
                                        <div className="section-subtitle">Últimos 7 días - Identificación por IP</div>
                                    </div>
                                </div>
                                <div className="section-body" style={{ padding: '0' }}>
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>IP</th>
                                                <th>Dispositivo</th>
                                                <th>Primera Visita</th>
                                                <th>Última Actividad</th>
                                                <th>Eventos</th>
                                                <th>Productos</th>
                                                <th>Contactos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuariosUnicos.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7">
                                                        <div className="empty-state" style={{ padding: '60px 0' }}>
                                                            <div style={{ color: 'var(--text-3)' }}>No hay usuarios registrados aún</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                usuariosUnicos.map((usuario, idx) => (
                                                    <tr key={usuario.session_id}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ 
                                                                    width: '8px', 
                                                                    height: '8px', 
                                                                    borderRadius: '50%', 
                                                                    background: idx === 0 ? '#10b981' : '#6b7280'
                                                                }}></div>
                                                                <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '600' }}>{usuario.ip}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {usuario.device_type === 'desktop' && (
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                                        <line x1="8" y1="21" x2="16" y2="21"></line>
                                                                        <line x1="12" y1="17" x2="12" y2="21"></line>
                                                                    </svg>
                                                                )}
                                                                {usuario.device_type === 'mobile' && (
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                                                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                                                    </svg>
                                                                )}
                                                                {usuario.device_type === 'tablet' && (
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                                                                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                                                    </svg>
                                                                )}
                                                                <span className={`badge ${
                                                                    usuario.device_type === 'mobile' ? 'badge-blue' : 
                                                                    usuario.device_type === 'tablet' ? 'badge-purple' : 
                                                                    'badge-gray'
                                                                }`}>
                                                                    {usuario.device_type}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                                                            {new Date(usuario.primera_visita).toLocaleString('es', { 
                                                                day: '2-digit', 
                                                                month: 'short', 
                                                                hour: '2-digit', 
                                                                minute: '2-digit' 
                                                            })}
                                                        </td>
                                                        <td style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                                                            {new Date(usuario.ultima_actividad).toLocaleString('es', { 
                                                                day: '2-digit', 
                                                                month: 'short', 
                                                                hour: '2-digit', 
                                                                minute: '2-digit' 
                                                            })}
                                                        </td>
                                                        <td><span className="badge badge-blue">{usuario.total_eventos}</span></td>
                                                        <td><span className="badge badge-purple">{usuario.productos_vistos}</span></td>
                                                        <td><span className="badge badge-green">{usuario.contactos}</span></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Funnel de Checkout */}
                            {checkoutFunnel && (
                                <div className="section-card">
                                    <div className="section-header">
                                        <div>
                                            <div className="section-title">🛒 Funnel de Conversión</div>
                                            <div className="section-subtitle">Análisis del proceso de compra</div>
                                        </div>
                                    </div>
                                    <div className="section-body">
                                        <div className="funnel-container">
                                            <div className="funnel-step">
                                                <div className="funnel-bar" style={{ width: '100%', background: '#4f8ef7' }}>
                                                    <div className="funnel-content">
                                                        <div className="funnel-icon">🛍️</div>
                                                        <div className="funnel-info">
                                                            <div className="funnel-label">Productos Agregados</div>
                                                            <div className="funnel-value">{checkoutFunnel.agregados_carrito}</div>
                                                        </div>
                                                        <div className="funnel-percent">100%</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="funnel-step">
                                                <div className="funnel-bar" style={{ 
                                                    width: checkoutFunnel.agregados_carrito > 0 
                                                        ? `${(checkoutFunnel.checkout_iniciado / checkoutFunnel.agregados_carrito * 100)}%` 
                                                        : '0%',
                                                    background: '#8b5cf6'
                                                }}>
                                                    <div className="funnel-content">
                                                        <div className="funnel-icon">🚀</div>
                                                        <div className="funnel-info">
                                                            <div className="funnel-label">Checkout Iniciado</div>
                                                            <div className="funnel-value">{checkoutFunnel.checkout_iniciado}</div>
                                                        </div>
                                                        <div className="funnel-percent">{checkoutFunnel.tasa_inicio}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="funnel-step">
                                                <div className="funnel-bar" style={{ 
                                                    width: checkoutFunnel.agregados_carrito > 0 
                                                        ? `${(checkoutFunnel.paso_1_completado / checkoutFunnel.agregados_carrito * 100)}%` 
                                                        : '0%',
                                                    background: '#10b981'
                                                }}>
                                                    <div className="funnel-content">
                                                        <div className="funnel-icon">📝</div>
                                                        <div className="funnel-info">
                                                            <div className="funnel-label">Información Completada</div>
                                                            <div className="funnel-value">{checkoutFunnel.paso_1_completado}</div>
                                                        </div>
                                                        <div className="funnel-percent">
                                                            {checkoutFunnel.checkout_iniciado > 0 
                                                                ? ((checkoutFunnel.paso_1_completado / checkoutFunnel.checkout_iniciado * 100).toFixed(1))
                                                                : 0}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="funnel-step">
                                                <div className="funnel-bar" style={{ 
                                                    width: checkoutFunnel.agregados_carrito > 0 
                                                        ? `${(checkoutFunnel.compras_completadas / checkoutFunnel.agregados_carrito * 100)}%` 
                                                        : '0%',
                                                    background: '#059669'
                                                }}>
                                                    <div className="funnel-content">
                                                        <div className="funnel-icon">✅</div>
                                                        <div className="funnel-info">
                                                            <div className="funnel-label">Compras Completadas</div>
                                                            <div className="funnel-value">{checkoutFunnel.compras_completadas}</div>
                                                        </div>
                                                        <div className="funnel-percent">{checkoutFunnel.tasa_completado}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="funnel-step abandoned">
                                                <div className="funnel-bar" style={{ 
                                                    width: checkoutFunnel.agregados_carrito > 0 
                                                        ? `${(checkoutFunnel.checkout_abandonado / checkoutFunnel.agregados_carrito * 100)}%` 
                                                        : '0%',
                                                    background: '#ef4444'
                                                }}>
                                                    <div className="funnel-content">
                                                        <div className="funnel-icon">❌</div>
                                                        <div className="funnel-info">
                                                            <div className="funnel-label">Checkout Abandonado</div>
                                                            <div className="funnel-value">{checkoutFunnel.checkout_abandonado}</div>
                                                        </div>
                                                        <div className="funnel-percent">{checkoutFunnel.tasa_abandono}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="funnel-insights">
                                            <div className="insight-card">
                                                <div className="insight-icon" style={{ background: '#10b981' }}>📈</div>
                                                <div className="insight-content">
                                                    <div className="insight-label">Tasa de Conversión</div>
                                                    <div className="insight-value">{checkoutFunnel.tasa_completado}%</div>
                                                </div>
                                            </div>
                                            <div className="insight-card">
                                                <div className="insight-icon" style={{ background: '#ef4444' }}>📉</div>
                                                <div className="insight-content">
                                                    <div className="insight-label">Tasa de Abandono</div>
                                                    <div className="insight-value">{checkoutFunnel.tasa_abandono}%</div>
                                                </div>
                                            </div>
                                            <div className="insight-card">
                                                <div className="insight-icon" style={{ background: '#4f8ef7' }}>💰</div>
                                                <div className="insight-content">
                                                    <div className="insight-label">Oportunidades Perdidas</div>
                                                    <div className="insight-value">{checkoutFunnel.checkout_abandonado}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Gráficos */}
                            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="section-card">
                                    <div className="section-header">
                                        <div>
                                            <div className="section-title">Distribución de Dispositivos</div>
                                        </div>
                                    </div>
                                    <div className="section-body">
                                        {analyticsStats && (analyticsStats.desktop > 0 || analyticsStats.mobile > 0 || analyticsStats.tablet > 0) ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: '💻 Desktop', value: parseInt(analyticsStats.desktop) || 0, color: '#4f8ef7' },
                                                            { name: '📱 Mobile', value: parseInt(analyticsStats.mobile) || 0, color: '#10b981' },
                                                            { name: '📱 Tablet', value: parseInt(analyticsStats.tablet) || 0, color: '#f59e0b' }
                                                        ].filter(d => d.value > 0)}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {[
                                                            { name: '💻 Desktop', value: parseInt(analyticsStats.desktop) || 0, color: '#4f8ef7' },
                                                            { name: '📱 Mobile', value: parseInt(analyticsStats.mobile) || 0, color: '#10b981' },
                                                            { name: '📱 Tablet', value: parseInt(analyticsStats.tablet) || 0, color: '#f59e0b' }
                                                        ].filter(d => d.value > 0).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => `${value} eventos`} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                                                No hay datos disponibles
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="section-card">
                                    <div className="section-header">
                                        <div>
                                            <div className="section-title">Eventos por Tipo</div>
                                        </div>
                                    </div>
                                    <div className="section-body">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={[
                                                { name: '👀 Vistas', value: analyticsStats?.vistas_producto || 0, fill: '#4f8ef7' },
                                                { name: '📄 Detalles', value: analyticsStats?.vistas_detalle || 0, fill: '#8b5cf6' },
                                                { name: '📞 Contactos', value: analyticsStats?.clicks_contacto || 0, fill: '#10b981' }
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        background: 'white', 
                                                        border: '1px solid #e5e7eb', 
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                                    {[
                                                        { name: '👀 Vistas', value: analyticsStats?.vistas_producto || 0, fill: '#4f8ef7' },
                                                        { name: '📄 Detalles', value: analyticsStats?.vistas_detalle || 0, fill: '#8b5cf6' },
                                                        { name: '📞 Contactos', value: analyticsStats?.clicks_contacto || 0, fill: '#10b981' }
                                                    ].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>


            {/* Modal de Producto */}
            {showModal && (
                <div className="modal-overlay open">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Nombre del Producto *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.nombre}
                                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                                        placeholder="Ej: Laptop HP Pavilion"
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Descripción</label>
                                    <textarea
                                        className="form-input"
                                        value={form.descripcion}
                                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                        placeholder="Descripción detallada del producto"
                                        rows="3"
                                    />
                                </div>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Precio ($) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.precio}
                                            onChange={e => setForm({ ...form, precio: e.target.value })}
                                            placeholder="0.00"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.stock}
                                            onChange={e => setForm({ ...form, stock: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Categoría</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={form.categoria}
                                            onChange={e => setForm({ ...form, categoria: e.target.value })}
                                            placeholder="Ej: Tecnología"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Orden</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.orden}
                                            onChange={e => setForm({ ...form, orden: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>URL de Imagen</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        value={form.imagen_url}
                                        onChange={e => setForm({ ...form, imagen_url: e.target.value })}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                </div>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={form.activo}
                                                onChange={e => setForm({ ...form, activo: e.target.checked })}
                                            />
                                            Producto Activo
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={form.destacado}
                                                onChange={e => setForm({ ...form, destacado: e.target.checked })}
                                            />
                                            Producto Destacado
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
