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
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState(1); // 1: info, 2: pago, 3: confirmacion
    const [checkoutData, setCheckoutData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        metodoPago: 'tarjeta_credito',
        tarjetaNumero: '',
        tarjetaNombre: '',
        tarjetaExpiracion: '',
        tarjetaCVV: ''
    });
    const [processingPayment, setProcessingPayment] = useState(false);
    const [orderConfirmation, setOrderConfirmation] = useState(null);
    
    // Marketing Automation States
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [timeOnPage, setTimeOnPage] = useState(0);
    const [subscribeEmail, setSubscribeEmail] = useState('');
    const [subscribeNombre, setSubscribeNombre] = useState('');
    const [cuponActivo, setCuponActivo] = useState(null);
    const [productoConDescuento, setProductoConDescuento] = useState(null);
    
    // Debug: Mostrar tiempo en consola cada 10 segundos
    useEffect(() => {
        if (timeOnPage > 0 && timeOnPage % 10 === 0) {
            console.log(`⏱️ Tiempo en página: ${timeOnPage}s (${Math.floor(timeOnPage / 60)}m ${timeOnPage % 60}s)`);
        }
    }, [timeOnPage]);

    useEffect(() => {
        fetchProductos();
        trackEvent('catalogo_visto');
        
        // Cargar carrito del localStorage
        const savedCart = localStorage.getItem('tienda_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }

        // Detectar cupón en URL
        const urlParams = new URLSearchParams(window.location.search);
        const cuponCode = urlParams.get('cupon');
        const productoId = urlParams.get('producto');
        
        if (cuponCode && productoId) {
            validarCuponURL(cuponCode, productoId);
        }
    }, []);

    // Timer para modal de suscripción (5 minutos) con detección de visibilidad
    useEffect(() => {
        // Recuperar tiempo acumulado de sessionStorage
        const savedTime = parseInt(sessionStorage.getItem('tienda_time_on_page') || '0');
        setTimeOnPage(savedTime);

        let timer;
        let isPageVisible = !document.hidden;
        let lastActivity = Date.now();

        // Función para actualizar el timer
        const updateTimer = () => {
            const now = Date.now();
            // Solo contar si la página es visible Y hubo actividad en los últimos 30 segundos
            if (isPageVisible && (now - lastActivity < 30000)) {
                setTimeOnPage(prev => {
                    const newTime = prev + 1;
                    sessionStorage.setItem('tienda_time_on_page', newTime.toString());
                    return newTime;
                });
            }
        };

        // Detectar cambios de visibilidad (cambio de pestaña)
        const handleVisibilityChange = () => {
            isPageVisible = !document.hidden;
            if (isPageVisible) {
                lastActivity = Date.now(); // Resetear actividad al volver
            }
        };

        // Detectar actividad del usuario
        const handleActivity = () => {
            lastActivity = Date.now();
        };

        // Iniciar timer
        timer = setInterval(updateTimer, 1000);

        // Agregar listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('mousemove', handleActivity);
        document.addEventListener('scroll', handleActivity);
        document.addEventListener('click', handleActivity);
        document.addEventListener('keypress', handleActivity);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('mousemove', handleActivity);
            document.removeEventListener('scroll', handleActivity);
            document.removeEventListener('click', handleActivity);
            document.removeEventListener('keypress', handleActivity);
        };
    }, []);

    // Mostrar modal después de 5 minutos (300 segundos)
    useEffect(() => {
        if (timeOnPage >= 300 && !localStorage.getItem('subscribed')) {
            setShowSubscribeModal(true);
        }
    }, [timeOnPage]);

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

    // Validar cupón desde URL
    const validarCuponURL = async (codigo, productoId) => {
        try {
            const response = await axios.post(`${API_URL}/api/marketing/validar-cupon`, {
                codigo,
                producto_id: productoId,
                ip: 'auto' // El backend detectará la IP
            });

            if (response.data.ok) {
                setCuponActivo(response.data.cupon);
                setProductoConDescuento(productoId);
                
                // Mostrar notificación
                const descuento = response.data.cupon.tipo === 'porcentaje' 
                    ? `${response.data.cupon.valor}%` 
                    : `$${response.data.cupon.valor}`;
                alert(`¡Cupón aplicado! Tienes ${descuento} de descuento`);
            }
        } catch (err) {
            console.error('Error validando cupón:', err);
            if (err.response?.data?.error) {
                alert(err.response.data.error);
            }
        }
    };

    // Manejar suscripción
    const handleSubscribe = async () => {
        if (!subscribeEmail) {
            alert('Por favor ingresa tu email');
            return;
        }

        try {
            await axios.post(`${API_URL}/api/marketing/suscribir`, {
                email: subscribeEmail,
                nombre: subscribeNombre || null,
                session_id: getSessionId(),
                origen: 'modal_5min'
            });
            
            localStorage.setItem('subscribed', 'true');
            setShowSubscribeModal(false);
            alert('¡Gracias por suscribirte! Recibirás ofertas exclusivas en tu email.');
            trackEvent('suscripcion_completada', null, { email: subscribeEmail });
        } catch (err) {
            console.error('Error al suscribirse:', err);
            if (err.response?.data?.already_subscribed) {
                localStorage.setItem('subscribed', 'true');
                setShowSubscribeModal(false);
                alert('Ya estás suscrito a nuestras ofertas');
            } else {
                alert('Error al suscribirse. Por favor intenta de nuevo.');
            }
        }
    };

    // Calcular precio con descuento
    const calcularPrecioConDescuento = (producto) => {
        if (!cuponActivo || productoConDescuento !== producto.id) {
            return null;
        }

        const precioOriginal = parseFloat(producto.precio);
        let precioFinal;

        if (cuponActivo.tipo === 'porcentaje') {
            precioFinal = precioOriginal * (1 - cuponActivo.valor / 100);
        } else {
            precioFinal = precioOriginal - cuponActivo.valor;
        }

        return {
            original: precioOriginal,
            final: Math.max(0, precioFinal),
            descuento: cuponActivo.valor
        };
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
        return cart.reduce((total, item) => {
            const precio = parseFloat(item.precio) || 0;
            let precioFinal = precio;
            
            // Aplicar descuento si hay cupón activo para este producto
            if (cuponActivo && productoConDescuento === item.id) {
                if (cuponActivo.tipo === 'porcentaje') {
                    precioFinal = precio * (1 - cuponActivo.valor / 100);
                } else {
                    precioFinal = precio - cuponActivo.valor;
                }
                precioFinal = Math.max(0, precioFinal);
            }
            
            return total + (precioFinal * item.cantidad);
        }, 0);
    };

    const getSubtotal = () => getTotalCart();
    const getImpuestos = () => getSubtotal() * 0.16; // IVA 16%
    const getEnvio = () => getSubtotal() > 500 ? 0 : 99;
    const getTotal = () => getSubtotal() + getImpuestos() + getEnvio();
    
    // Obtener descuento total aplicado
    const getDescuentoTotal = () => {
        if (!cuponActivo) return 0;
        
        return cart.reduce((descuento, item) => {
            if (productoConDescuento === item.id) {
                const precio = parseFloat(item.precio) || 0;
                let descuentoItem = 0;
                
                if (cuponActivo.tipo === 'porcentaje') {
                    descuentoItem = precio * (cuponActivo.valor / 100);
                } else {
                    descuentoItem = cuponActivo.valor;
                }
                
                return descuento + (descuentoItem * item.cantidad);
            }
            return descuento;
        }, 0);
    };

    const handleCheckoutClick = () => {
        setShowCart(false);
        setShowCheckout(true);
        setCheckoutStep(1);
        trackEvent('checkout_iniciado', null, { 
            items_count: cart.length,
            total: getTotalCart()
        });
    };

    const handleCheckoutInputChange = (e) => {
        const { name, value } = e.target;
        setCheckoutData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckoutStepChange = (newStep) => {
        if (newStep === 2) {
            trackEvent('checkout_paso_1_completado', null, {
                nombre: checkoutData.nombre,
                email: checkoutData.email
            });
        }
        setCheckoutStep(newStep);
    };

    const handleCheckoutClose = () => {
        trackEvent('checkout_abandonado', null, {
            step: checkoutStep,
            items_count: cart.length,
            total: getTotalCart()
        });
        setShowCheckout(false);
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setCheckoutData(prev => ({ ...prev, tarjetaNumero: formatted }));
    };

    const handleProcessPayment = async () => {
        // Validaciones
        if (!checkoutData.nombre || !checkoutData.email) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        if (checkoutData.metodoPago === 'tarjeta_credito' || checkoutData.metodoPago === 'tarjeta_debito') {
            if (!checkoutData.tarjetaNumero || !checkoutData.tarjetaNombre || 
                !checkoutData.tarjetaExpiracion || !checkoutData.tarjetaCVV) {
                alert('Por favor completa los datos de la tarjeta');
                return;
            }
        }

        setProcessingPayment(true);

        try {
            const items = cart.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad
            }));

            const response = await axios.post(`${API_URL}/api/pedidos`, {
                cliente_nombre: checkoutData.nombre,
                cliente_email: checkoutData.email,
                cliente_telefono: checkoutData.telefono,
                direccion_calle: checkoutData.direccion,
                direccion_ciudad: checkoutData.ciudad,
                direccion_estado: checkoutData.estado,
                direccion_codigo_postal: checkoutData.codigoPostal,
                metodo_pago: checkoutData.metodoPago,
                tarjeta_numero: checkoutData.tarjetaNumero.replace(/\s/g, ''),
                tarjeta_nombre: checkoutData.tarjetaNombre,
                tarjeta_expiracion: checkoutData.tarjetaExpiracion,
                tarjeta_cvv: checkoutData.tarjetaCVV,
                items,
                session_id: getSessionId()
            });

            if (response.data.ok) {
                setOrderConfirmation(response.data.pedido);
                setCheckoutStep(3);
                setCart([]);
                localStorage.removeItem('tienda_cart');
                trackEvent('compra_completada', null, { 
                    numero_orden: response.data.pedido.numero_orden,
                    total: response.data.pedido.total 
                });
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert(error.response?.data?.error || 'Error al procesar el pago. Por favor intenta de nuevo.');
        } finally {
            setProcessingPayment(false);
        }
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
                        {/* Indicador de Timer (visible siempre para testing) */}
                        <div style={{
                            background: 'rgba(79, 70, 229, 0.1)',
                            border: '1px solid rgba(79, 70, 229, 0.3)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {Math.floor(timeOnPage / 60)}:{(timeOnPage % 60).toString().padStart(2, '0')}
                            {timeOnPage >= 300 ? ' ✅' : ` / 5:00`}
                        </div>
                        {/* Botón de testing para forzar modal */}
                        <button 
                            onClick={() => {
                                localStorage.removeItem('subscribed');
                                setShowSubscribeModal(true);
                            }}
                            style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                            title="Forzar modal de suscripción (testing)"
                        >
                            🧪 Test Modal
                        </button>
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
                
                {/* Hero Stats */}
                <div className="hero-stats">
                    <div className="hero-stat-card">
                        <div className="hero-stat-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="3" width="15" height="13"></rect>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                            </svg>
                        </div>
                        <div className="hero-stat-value">Gratis</div>
                        <div className="hero-stat-label">Envío en compras +$500</div>
                    </div>
                    <div className="hero-stat-card">
                        <div className="hero-stat-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <div className="hero-stat-value">100%</div>
                        <div className="hero-stat-label">Pago Seguro</div>
                    </div>
                    <div className="hero-stat-card">
                        <div className="hero-stat-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </div>
                        <div className="hero-stat-value">{productos.length}+</div>
                        <div className="hero-stat-label">Productos Disponibles</div>
                    </div>
                    <div className="hero-stat-card">
                        <div className="hero-stat-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                        </div>
                        <div className="hero-stat-value">Fácil</div>
                        <div className="hero-stat-label">Proceso de Compra</div>
                    </div>
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
                        productosFiltrados.map(producto => {
                            const precioDescuento = calcularPrecioConDescuento(producto);
                            return (
                            <div 
                                key={producto.id} 
                                className="producto-card"
                            >
                                {producto.destacado && (
                                    <div className="producto-badge">Destacado</div>
                                )}
                                {precioDescuento && (
                                    <div className="producto-badge descuento">-{precioDescuento.descuento}%</div>
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
                                        {precioDescuento ? (
                                            <div className="producto-precio-descuento">
                                                <span className="precio-original">${precioDescuento.original.toFixed(2)}</span>
                                                <span className="precio-final">${precioDescuento.final.toFixed(2)}</span>
                                            </div>
                                        ) : (
                                            <div className="producto-precio">${producto.precio.toLocaleString()}</div>
                                        )}
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
                        )})
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
                                {cart.map(item => {
                                    const precio = parseFloat(item.precio) || 0;
                                    const subtotal = precio * item.cantidad;
                                    return (
                                        <div key={item.id} className="cart-item">
                                            <img src={item.imagen_url || '/placeholder.png'} alt={item.nombre} />
                                            <div className="cart-item-info">
                                                <div className="cart-item-name">{item.nombre}</div>
                                                <div className="cart-item-price">${precio.toFixed(2)}</div>
                                                <div className="cart-item-controls">
                                                    <button onClick={() => updateQuantity(item.id, item.cantidad - 1)}>-</button>
                                                    <span>{item.cantidad}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.cantidad + 1)}>+</button>
                                                </div>
                                                <div className="cart-item-subtotal">${subtotal.toFixed(2)}</div>
                                            </div>
                                            <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                    {cart.length > 0 && (
                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total:</span>
                                <span>${getTotalCart().toFixed(2)}</span>
                            </div>
                            <button className="btn-checkout" onClick={handleCheckoutClick}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                                Proceder al Pago
                            </button>
                            <button className="btn-whatsapp-alt" onClick={handleWhatsAppContact}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                O contactar por WhatsApp
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

            {/* Modal de Checkout */}
            {showCheckout && (
                <div className="modal-overlay-tienda checkout-overlay" onClick={handleCheckoutClose}>
                    <div className="modal-checkout" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCheckoutClose}>&times;</button>
                        
                        {/* Progress Bar */}
                        <div className="checkout-progress">
                            <div className={`progress-step ${checkoutStep >= 1 ? 'active' : ''} ${checkoutStep > 1 ? 'completed' : ''}`}>
                                <div className="progress-circle">
                                    {checkoutStep > 1 ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : '1'}
                                </div>
                                <span>Información</span>
                            </div>
                            <div className="progress-line"></div>
                            <div className={`progress-step ${checkoutStep >= 2 ? 'active' : ''} ${checkoutStep > 2 ? 'completed' : ''}`}>
                                <div className="progress-circle">
                                    {checkoutStep > 2 ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : '2'}
                                </div>
                                <span>Pago</span>
                            </div>
                            <div className="progress-line"></div>
                            <div className={`progress-step ${checkoutStep >= 3 ? 'active' : ''}`}>
                                <div className="progress-circle">3</div>
                                <span>Confirmación</span>
                            </div>
                        </div>
                        
                        {checkoutStep === 1 && (
                            <div className="checkout-step">
                                <h2 className="checkout-title">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    Información de Contacto
                                </h2>
                                <div className="checkout-form">
                                    <div className="form-group">
                                        <label>Nombre Completo *</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={checkoutData.nombre}
                                            onChange={handleCheckoutInputChange}
                                            placeholder="Juan Pérez"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={checkoutData.email}
                                            onChange={handleCheckoutInputChange}
                                            placeholder="juan@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono</label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={checkoutData.telefono}
                                            onChange={handleCheckoutInputChange}
                                            placeholder="+52 55 1234 5678"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Dirección</label>
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={checkoutData.direccion}
                                            onChange={handleCheckoutInputChange}
                                            placeholder="Calle y número"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Ciudad</label>
                                            <input
                                                type="text"
                                                name="ciudad"
                                                value={checkoutData.ciudad}
                                                onChange={handleCheckoutInputChange}
                                                placeholder="Ciudad"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Estado</label>
                                            <input
                                                type="text"
                                                name="estado"
                                                value={checkoutData.estado}
                                                onChange={handleCheckoutInputChange}
                                                placeholder="Estado"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Código Postal</label>
                                        <input
                                            type="text"
                                            name="codigoPostal"
                                            value={checkoutData.codigoPostal}
                                            onChange={handleCheckoutInputChange}
                                            placeholder="06600"
                                        />
                                    </div>
                                    <button className="btn-next-step" onClick={() => handleCheckoutStepChange(2)}>
                                        Continuar al Pago
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {checkoutStep === 2 && (
                            <div className="checkout-step">
                                <button className="btn-back" onClick={() => setCheckoutStep(1)}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="19" y1="12" x2="5" y2="12"></line>
                                        <polyline points="12 19 5 12 12 5"></polyline>
                                    </svg>
                                    Volver
                                </button>
                                <h2 className="checkout-title">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                    Método de Pago
                                </h2>
                                
                                <div className="payment-methods">
                                    <label className={`payment-method ${checkoutData.metodoPago === 'tarjeta_credito' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value="tarjeta_credito"
                                            checked={checkoutData.metodoPago === 'tarjeta_credito'}
                                            onChange={handleCheckoutInputChange}
                                        />
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                            <line x1="1" y1="10" x2="23" y2="10"></line>
                                        </svg>
                                        <span>Tarjeta de Crédito</span>
                                    </label>
                                    <label className={`payment-method ${checkoutData.metodoPago === 'tarjeta_debito' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value="tarjeta_debito"
                                            checked={checkoutData.metodoPago === 'tarjeta_debito'}
                                            onChange={handleCheckoutInputChange}
                                        />
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                            <line x1="1" y1="10" x2="23" y2="10"></line>
                                        </svg>
                                        <span>Tarjeta de Débito</span>
                                    </label>
                                </div>

                                {(checkoutData.metodoPago === 'tarjeta_credito' || checkoutData.metodoPago === 'tarjeta_debito') && (
                                    <div className="checkout-form">
                                        <div className="form-group">
                                            <label>Número de Tarjeta *</label>
                                            <input
                                                type="text"
                                                name="tarjetaNumero"
                                                value={checkoutData.tarjetaNumero}
                                                onChange={handleCardNumberChange}
                                                placeholder="4242 4242 4242 4242"
                                                maxLength="19"
                                                required
                                            />
                                            <small className="form-hint">💳 Prueba: 4242 4242 4242 4242</small>
                                        </div>
                                        <div className="form-group">
                                            <label>Nombre en la Tarjeta *</label>
                                            <input
                                                type="text"
                                                name="tarjetaNombre"
                                                value={checkoutData.tarjetaNombre}
                                                onChange={handleCheckoutInputChange}
                                                placeholder="JUAN PEREZ"
                                                style={{ textTransform: 'uppercase' }}
                                                required
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Expiración *</label>
                                                <input
                                                    type="text"
                                                    name="tarjetaExpiracion"
                                                    value={checkoutData.tarjetaExpiracion}
                                                    onChange={handleCheckoutInputChange}
                                                    placeholder="MM/YY"
                                                    maxLength="5"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>CVV *</label>
                                                <input
                                                    type="text"
                                                    name="tarjetaCVV"
                                                    value={checkoutData.tarjetaCVV}
                                                    onChange={handleCheckoutInputChange}
                                                    placeholder="123"
                                                    maxLength="4"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="order-summary">
                                    <h3>Resumen del Pedido</h3>
                                    <div className="summary-line">
                                        <span>Subtotal:</span>
                                        <span>${getSubtotal().toFixed(2)}</span>
                                    </div>
                                    {cuponActivo && getDescuentoTotal() > 0 && (
                                        <div className="summary-line descuento">
                                            <span>Descuento ({cuponActivo.codigo}):</span>
                                            <span style={{ color: '#10b981' }}>-${getDescuentoTotal().toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="summary-line">
                                        <span>Impuestos (16%):</span>
                                        <span>${getImpuestos().toFixed(2)}</span>
                                    </div>
                                    <div className="summary-line">
                                        <span>Envío:</span>
                                        <span>{getEnvio() === 0 ? 'GRATIS' : `$${getEnvio().toFixed(2)}`}</span>
                                    </div>
                                    <div className="summary-line total">
                                        <span>Total:</span>
                                        <span>${getTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                <button 
                                    className="btn-process-payment" 
                                    onClick={handleProcessPayment}
                                    disabled={processingPayment}
                                >
                                    {processingPayment ? (
                                        <>
                                            <div className="spinner-small"></div>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            Pagar ${getTotal().toFixed(2)}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {checkoutStep === 3 && orderConfirmation && (
                            <div className="checkout-step confirmation">
                                <div className="success-icon">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                </div>
                                <h2 className="success-title">¡Pago Exitoso!</h2>
                                <p className="success-message">
                                    Tu pedido ha sido procesado correctamente
                                </p>
                                <div className="order-details">
                                    <div className="detail-row">
                                        <span>Número de Orden:</span>
                                        <strong>{orderConfirmation.numero_orden}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Total Pagado:</span>
                                        <strong>${orderConfirmation.total.toFixed(2)}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Estado:</span>
                                        <span className="status-badge success">
                                            {orderConfirmation.estado === 'pagado' ? 'Pagado' : orderConfirmation.estado}
                                        </span>
                                    </div>
                                    {orderConfirmation.transaccion_id && (
                                        <div className="detail-row">
                                            <span>ID de Transacción:</span>
                                            <code>{orderConfirmation.transaccion_id}</code>
                                        </div>
                                    )}
                                </div>
                                <p className="confirmation-note">
                                    📧 Recibirás un email de confirmación en breve
                                </p>
                                <button 
                                    className="btn-continue-shopping" 
                                    onClick={() => {
                                        setShowCheckout(false);
                                        setCheckoutStep(1);
                                        setOrderConfirmation(null);
                                    }}
                                >
                                    Continuar Comprando
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Trust Badges Section */}
            <section className="trust-section">
                <div className="trust-grid">
                    <div className="trust-badge">
                        <div className="trust-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </div>
                        <div className="trust-title">Pago Seguro</div>
                        <div className="trust-description">Tus datos están protegidos con encriptación SSL</div>
                    </div>
                    <div className="trust-badge">
                        <div className="trust-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <div className="trust-title">Envío Rápido</div>
                        <div className="trust-description">Entrega en 3-5 días hábiles a todo el país</div>
                    </div>
                    <div className="trust-badge">
                        <div className="trust-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </div>
                        <div className="trust-title">Garantía</div>
                        <div className="trust-description">30 días de garantía en todos los productos</div>
                    </div>
                    <div className="trust-badge">
                        <div className="trust-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <div className="trust-title">Soporte 24/7</div>
                        <div className="trust-description">Atención al cliente siempre disponible</div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="testimonials-container">
                    <h2 className="testimonials-title">Lo que dicen nuestros clientes</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </div>
                            <p className="testimonial-text">
                                "Excelente servicio y productos de calidad. La entrega fue rápida y el proceso de compra muy sencillo."
                            </p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">MR</div>
                                <div className="testimonial-info">
                                    <div className="testimonial-name">María Rodríguez</div>
                                    <div className="testimonial-role">Cliente Verificado</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </div>
                            <p className="testimonial-text">
                                "Me encantó la variedad de productos y los precios son muy competitivos. Definitivamente volveré a comprar."
                            </p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">JL</div>
                                <div className="testimonial-info">
                                    <div className="testimonial-name">Juan López</div>
                                    <div className="testimonial-role">Cliente Frecuente</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </div>
                            <p className="testimonial-text">
                                "El mejor lugar para comprar online. Atención al cliente excepcional y productos originales."
                            </p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">AG</div>
                                <div className="testimonial-info">
                                    <div className="testimonial-name">Ana García</div>
                                    <div className="testimonial-role">Cliente Satisfecho</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal de Suscripción (5 minutos) */}
            {showSubscribeModal && (
                <div className="modal-overlay-tienda" onClick={() => setShowSubscribeModal(false)}>
                    <div className="modal-subscribe" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowSubscribeModal(false)}>
                            &times;
                        </button>
                        <div className="subscribe-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <h2 className="subscribe-title">¡Ofertas Exclusivas!</h2>
                        <p className="subscribe-description">
                            Suscríbete y recibe un <strong>10% de descuento</strong> en tu próxima compra
                        </p>
                        <div className="subscribe-form">
                            <input
                                type="text"
                                placeholder="Tu nombre (opcional)"
                                value={subscribeNombre}
                                onChange={(e) => setSubscribeNombre(e.target.value)}
                                className="subscribe-input"
                            />
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                value={subscribeEmail}
                                onChange={(e) => setSubscribeEmail(e.target.value)}
                                className="subscribe-input"
                                required
                            />
                            <button onClick={handleSubscribe} className="btn-subscribe">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Suscribirme Ahora
                            </button>
                        </div>
                        <p className="subscribe-note">
                            No spam. Solo ofertas especiales y descuentos exclusivos.
                        </p>
                    </div>
                </div>
            )}

            <footer className="tienda-footer">
                <p>&copy; 2026 CRM System. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
