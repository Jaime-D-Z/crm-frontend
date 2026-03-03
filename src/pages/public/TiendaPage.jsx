import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/tienda.css';

const API_URL = import.meta.env.VITE_API_URL;

const getSessionId = () => {
    let sessionId = sessionStorage.getItem('tienda_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('tienda_session_id', sessionId);
    }
    return sessionId;
};

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
    const [showCart, setShowCart] = useState(false);
    const [cart, setCart] = useState([]);
    const [showContactForm, setShowContactForm] = useState(false);

    useEffect(() => {
        fetchProductos();
        trackEvent('catalogo_visto');
        
        // Cargar carrito del localStorage
        const savedCart = localStorage.getItem('tienda_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const fetchProductos = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/productos/publicos?limit=100`);
            setProductos(res.data.productos || []);
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

    const addToCart = (producto) => {
        const existingItem = cart.find(item => item.id === producto.id);
        let newCart;
        
        if (existingItem) {
            newCart = cart.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            );
        } else {
            newCart = [...cart, { ...producto, cantidad: 1 }];
        }
        
        setCart(newCart);
        localStorage.setItem('tienda_cart', JSON.stringify(newCart));
        trackEvent('producto_agregado_carrito', producto.id);
    };

    const removeFromCart = (productoId) => {
        const newCart = cart.filter(item => item.id !== productoId);
        setCart(newCart);
        localStorage.setItem('tienda_cart', JSON.stringify(newCart));
    };

    const updateQuantity = (productoId, cantidad) => {
        if (cantidad <= 0) {
            removeFromCart(productoId);
            return;
        }
        const newCart = cart.map(item =>
            item.id === productoId ? { ...item, cantidad } : item
        );
        setCart(newCart);
        localStorage.setItem('tienda_cart', JSON.stringify(newCart));
    };

    const getTotalCart = () => {
        return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    };

    const handleContactClick = () => {
        setShowContactForm(true);
        trackEvent('contacto_click', selectedProduct?.id);
    };

    const handleWhatsAppContact = () => {
        const mensaje = cart.length > 0
            ? `Hola! Estoy interesado en los siguientes productos:\n\n${cart.map(item => `- ${item.nombre} (x${item.cantidad}): $${(item.precio * item.cantidad).toFixed(2)}`).join('\n')}\n\nTotal: $${getTotalCart().toFixed(2)}`
            : `Hola! Estoy interesado en: ${selectedProduct.nombre}`;
        
        const whatsappUrl = `https://wa.me/51999999999?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
        trackEvent('whatsapp_click', selectedProduct?.id, { tiene_carrito: cart.length > 0 });
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
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button 
                            className="btn-cart"
                            onClick={() => setShowCart(!showCart)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                        </button>
                        <button 
                            className="btn-volver"
                            onClick={() => navigate('/')}
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </header>

            <section className="tienda-hero">
                <div className="hero-content">
                    <h2>Descubre Nuestros Productos</h2>
                    <p>Calidad y excelencia en cada detalle</p>
                </div>
            </section>

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

            <section className="tienda-productos">
                <div className="productos-grid">
                    {productosFiltrados.length === 0 ? (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p>No hay productos en esta categoria</p>
                        </div>
                    ) : (
                        productosFiltrados.map(producto => (
                            <div 
                                key={producto.id} 
                                className="producto-card"
                            >
                                {producto.destacado && (
                                    <div className="producto-badge">Destacado</div>
                                )}
                                <div className="producto-imagen" onClick={() => {
                                    trackEvent('producto_visto', producto.id);
                                    handleProductClick(producto);
                                }}>
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
                                            className="btn-add-cart"
                                            onClick={() => addToCart(producto)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="9" cy="21" r="1"></circle>
                                                <circle cx="20" cy="21" r="1"></circle>
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                            </svg>
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Carrito Lateral */}
            {showCart && (
                <div className="cart-sidebar">
                    <div className="cart-header">
                        <h3>Carrito de Compras</h3>
                        <button className="cart-close" onClick={() => setShowCart(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div className="cart-body">
                        {cart.length === 0 ? (
                            <div className="cart-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                <p>Tu carrito esta vacio</p>
                            </div>
                        ) : (
                            <>
                                {cart.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <img src={item.imagen_url || '/placeholder.png'} alt={item.nombre} />
                                        <div className="cart-item-info">
                                            <div className="cart-item-name">{item.nombre}</div>
                                            <div className="cart-item-price">${item.precio.toFixed(2)}</div>
                                            <div className="cart-item-controls">
                                                <button onClick={() => updateQuantity(item.id, item.cantidad - 1)}>-</button>
                                                <span>{item.cantidad}</span>
                                                <button onClick={() => updateQuantity(item.id, item.cantidad + 1)}>+</button>
                                            </div>
                                        </div>
                                        <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    {cart.length > 0 && (
                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total:</span>
                                <span>${getTotalCart().toFixed(2)}</span>
                            </div>
                            <button className="btn-checkout" onClick={handleWhatsAppContact}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                Contactar por WhatsApp
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Detalle */}
            {showModal && selectedProduct && (
                <div className="modal-overlay-tienda" onClick={() => setShowModal(false)}>
                    <div className="modal-tienda" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
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
                                <div className="modal-actions">
                                    <button className="btn-add-cart-modal" onClick={() => {
                                        addToCart(selectedProduct);
                                        setShowModal(false);
                                        setShowCart(true);
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="9" cy="21" r="1"></circle>
                                            <circle cx="20" cy="21" r="1"></circle>
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                        </svg>
                                        Agregar al Carrito
                                    </button>
                                    <button className="btn-contactar" onClick={handleContactClick}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                        </svg>
                                        Contactar Ahora
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Contacto */}
            {showContactForm && (
                <div className="modal-overlay-tienda" onClick={() => setShowContactForm(false)}>
                    <div className="modal-contact" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowContactForm(false)}>&times;</button>
                        <h3>Contactanos</h3>
                        <p>Elige como prefieres contactarnos:</p>
                        <div className="contact-options">
                            <button className="contact-option whatsapp" onClick={handleWhatsAppContact}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                <span>WhatsApp</span>
                            </button>
                            <button className="contact-option email" onClick={() => window.location.href = 'mailto:ventas@tuempresa.com'}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <span>Email</span>
                            </button>
                            <button className="contact-option phone" onClick={() => window.location.href = 'tel:+51999999999'}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <span>Telefono</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="tienda-footer">
                <p>&copy; 2026 CRM System. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
