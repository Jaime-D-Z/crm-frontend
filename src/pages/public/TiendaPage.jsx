import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/tienda.css';

const API_URL = import.meta.env.VITE_API_URL;

// Generar session ID único para tracking
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('tienda_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('tienda_session_id', sessionId);
    }
    return sessionId;
};

// Función para trackear eventos
const trackEvent = async (tipo_evento, producto_id = null, metadata = null) => {
    try {
        await axios.post(`${API_URL}/api/eventos/track`, {
            tipo_evento,
            producto_id,
            session_id: getSessionId(),
            metadata
        });
    } catch (err) {
        console.error('Error tracking event:', err);
    }
};

export default function TiendaPage() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriaFilter, setCategoriaFilter] = useState('todas');
    const [categorias, setCategorias] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchProductos();
        // Track visita al catálogo
        trackEvent('catalogo_visto');
    }, []);

    const fetchProductos = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/productos/publicos?limit=100`);
            setProductos(res.data.productos || []);
            
            // Extraer categorías únicas
            const cats = [...new Set(res.data.productos.map(p => p.categoria))];
            setCategorias(cats);
        } catch (err) {
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (producto) => {
        setSelectedProduct(producto);
        setShowModal(true);
        trackEvent('producto_detalle', producto.id);
    };

    const handleContactClick = (producto) => {
        trackEvent('contacto_click', producto.id);
        // Aquí puedes redirigir a WhatsApp, email, etc.
        alert(`Contactar sobre: ${producto.nombre}\n\nPróximamente: integración con WhatsApp/Email`);
    };

    const handleCategoryFilter = (categoria) => {
        setCategoriaFilter(categoria);
        trackEvent('filtro_usado', null, { categoria });
    };

    const productosFiltrados = categoriaFilter === 'todas' 
        ? productos 
        : productos.filter(p => p.categoria === categoriaFilter);

    if (loading) {
        return (
            <div className="tienda-loading">
                <div className="spinner"></div>
                <p>Cargando productos...</p>
            </div>
        );
    }

    return (
        <div className="tienda-container">
            {/* Header */}
            <header className="tienda-header">
                <div className="tienda-header-content">
                    <div className="tienda-logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <h1>Nuestra Tienda</h1>
                    </div>
                    <button 
                        className="btn-volver"
                        onClick={() => navigate('/')}
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="tienda-hero">
                <div className="hero-content">
                    <h2>Descubre Nuestros Productos</h2>
                    <p>Calidad y excelencia en cada detalle</p>
                </div>
            </section>

            {/* Filtros */}
            <section className="tienda-filtros">
                <div className="filtros-container">
                    <button
                        className={`filtro-btn ${categoriaFilter === 'todas' ? 'active' : ''}`}
                        onClick={() => handleCategoryFilter('todas')}
                    >
                        Todas
                    </button>
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            className={`filtro-btn ${categoriaFilter === cat ? 'active' : ''}`}
                            onClick={() => handleCategoryFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Grid de Productos */}
            <section className="tienda-productos">
                <div className="productos-grid">
                    {productosFiltrados.length === 0 ? (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p>No hay productos en esta categoría</p>
                        </div>
                    ) : (
                        productosFiltrados.map(producto => (
                            <div 
                                key={producto.id} 
                                className="producto-card"
                                onClick={() => {
                                    trackEvent('producto_visto', producto.id);
                                    handleProductClick(producto);
                                }}
                            >
                                {producto.destacado && (
                                    <div className="producto-badge">Destacado</div>
                                )}
                                <div className="producto-imagen">
                                    {producto.imagen_url ? (
                                        <img src={producto.imagen_url} alt={producto.nombre} />
                                    ) : (
                                        <div className="producto-placeholder">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="producto-info">
                                    <div className="producto-categoria">{producto.categoria}</div>
                                    <h3 className="producto-nombre">{producto.nombre}</h3>
                                    <p className="producto-descripcion">
                                        {producto.descripcion?.substring(0, 80)}
                                        {producto.descripcion?.length > 80 ? '...' : ''}
                                    </p>
                                    <div className="producto-footer">
                                        <div className="producto-precio">${producto.precio.toLocaleString()}</div>
                                        <button 
                                            className="btn-ver-mas"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductClick(producto);
                                            }}
                                        >
                                            Ver más
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Modal de Detalle */}
            {showModal && selectedProduct && (
                <div className="modal-overlay-tienda" onClick={() => setShowModal(false)}>
                    <div className="modal-tienda" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            &times;
                        </button>
                        <div className="modal-content-tienda">
                            <div className="modal-imagen">
                                {selectedProduct.imagen_url ? (
                                    <img src={selectedProduct.imagen_url} alt={selectedProduct.nombre} />
                                ) : (
                                    <div className="modal-placeholder">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="modal-info">
                                <div className="modal-categoria">{selectedProduct.categoria}</div>
                                <h2 className="modal-titulo">{selectedProduct.nombre}</h2>
                                <p className="modal-descripcion">{selectedProduct.descripcion}</p>
                                <div className="modal-precio-grande">${selectedProduct.precio.toLocaleString()}</div>
                                <button 
                                    className="btn-contactar"
                                    onClick={() => handleContactClick(selectedProduct)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    Contactar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="tienda-footer">
                <p>&copy; 2026 CRM System. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
